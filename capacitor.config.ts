import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sula.sfixied',
  appName: 'sFixied',
  webDir: 'public',
  server: {
    url: 'https://i-fixied.vercel.app/',
    cleartext: false
  }
};

export default config;