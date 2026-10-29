'use client';

import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Bot, Loader2, Mic, Send, X } from 'lucide-react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type BrowserSpeechResult = { 0?: { transcript?: string } };
type BrowserSpeechEvent = { results: ArrayLike<BrowserSpeechResult> };
type BrowserSpeechErrorEvent = { error?: string };

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechEvent) => void) | null;
  onerror: ((event: BrowserSpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

export default function AdminAssistant({ onPawnCreated }: { onPawnCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [notice, setNotice] = useState('');
  const browserRecognizer = useRef<BrowserSpeechRecognition | null>(null);
  const bottomOfChat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomOfChat.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, isOpen]);

  const sendMessage = async (content: string) => {
    const text = content.trim();
    if (!text || isSending) return;

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setDraft('');
    setNotice('');
    setIsSending(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.slice(-12) }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result.message === 'string' ? result.message : 'Asisten belum dapat menjawab.');
      }
      if (result.createdPawnId) onPawnCreated?.();
      setMessages([...nextMessages, { role: 'assistant', content: result.text || 'Selesai.' }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Koneksi ke asisten terputus.';
      setMessages([...nextMessages, { role: 'assistant', content: message }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleMicrophone = async () => {
    if (isListening) {
      try {
        if (Capacitor.isNativePlatform()) await SpeechRecognition.stop();
        else browserRecognizer.current?.stop();
      } catch {
        setIsListening(false);
      }
      return;
    }

    setNotice('');
    try {
      if (Capacitor.isNativePlatform()) {
        const availability = await SpeechRecognition.available();
        if (!availability.available) {
          setNotice('Pengenalan suara tidak tersedia di perangkat ini.');
          return;
        }

        let permission = await SpeechRecognition.checkPermissions();
        if (permission.speechRecognition !== 'granted') {
          permission = await SpeechRecognition.requestPermissions();
        }
        if (permission.speechRecognition !== 'granted') {
          setNotice('Izinkan akses mikrofon dan pengenalan suara di perangkat.');
          return;
        }

        setIsListening(true);
        const result = await SpeechRecognition.start({
          language: 'id-ID',
          maxResults: 1,
          partialResults: false,
          popup: false,
        });
        const transcript = result.matches?.[0]?.trim();
        setIsListening(false);
        if (transcript) await sendMessage(transcript);
        else setNotice('Suara belum tertangkap. Tekan mikrofon dan coba lagi.');
        return;
      }

      const speechWindow = window as SpeechRecognitionWindow;
      const SpeechRecognitionConstructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) {
        setNotice('Pengenalan suara web tidak tersedia di browser ini. Gunakan aplikasi atau browser yang mendukung mikrofon.');
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      browserRecognizer.current = recognition;
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim();
        setIsListening(false);
        if (transcript) void sendMessage(transcript);
        else setNotice('Suara belum tertangkap. Tekan mikrofon dan coba lagi.');
      };
      recognition.onerror = () => {
        setIsListening(false);
        setNotice('Mikrofon tidak dapat menangkap suara. Periksa izin mikrofon lalu coba lagi.');
      };
      recognition.onend = () => {
        setIsListening(false);
        browserRecognizer.current = null;
      };
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      setNotice('Mikrofon belum siap. Periksa izin perangkat lalu coba lagi.');
    }
  };

  return (
    <>
      {isOpen && (
        <section className="fixed bottom-24 right-4 z-[250] flex h-[min(640px,calc(100dvh-8rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-2"><Bot size={20} /></div>
              <div>
                <h2 className="text-sm font-bold">Asisten Kasir</h2>
                <p className="text-[10px] text-blue-100">Cek data dan catat gadaian</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Tutup chat" className="rounded-lg p-2 hover:bg-white/15">
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-slate-700 shadow-sm">
              Saya bisa membantu mencari dan meringkas data gadaian, atau mencatat gadaian baru. Contoh: “Masukkan gadaian Nisa, Samsung A15, Rp300.000.”
            </div>
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl p-3 text-sm shadow-sm ${message.role === 'user' ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm bg-white text-slate-700'}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Memproses perintah…</div>
            )}
            <div ref={bottomOfChat} />
          </div>

          <form
            className="border-t border-slate-100 bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(draft);
            }}
          >
            {notice && <p role="status" className="mb-2 text-xs text-amber-700">{notice}</p>}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => void handleMicrophone()}
                disabled={isSending}
                aria-label={isListening ? 'Hentikan mikrofon' : 'Mulai perintah suara'}
                title={isListening ? 'Mendengarkan…' : 'Perintah suara'}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors disabled:opacity-50 ${isListening ? 'animate-pulse bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {isListening ? <span className="h-3 w-3 rounded-full bg-red-600" /> : <Mic size={18} />}
              </button>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(draft);
                  }
                }}
                rows={1}
                maxLength={1200}
                placeholder="Tulis perintah…"
                aria-label="Pesan untuk asisten"
                className="max-h-24 min-h-11 flex-1 resize-y rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                aria-label="Kirim pesan"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Send size={17} />
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-400">Ucapan diubah menjadi teks oleh perangkat atau layanan suara; teks perintah dikirim ke AI. Hasilnya akan langsung mencatat gadaian.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Tutup asisten kasir' : 'Buka asisten kasir'}
        className="fixed bottom-5 right-5 z-[250] flex items-center gap-2 rounded-full bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={18} /> : <Bot size={19} />}
        <span>{isOpen ? 'Tutup' : 'Asisten AI'}</span>
      </button>
    </>
  );
}
