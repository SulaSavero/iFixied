import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const pawns = pgTable("pawns", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  name: text("name").notNull(),
  phoneBrand: text("phone_brand").notNull(),
  loanAmount: text("loan_amount").notNull(),
  interestReduction: text("interest_reduction").default("0"),
  penalty: text("penalty").default("0"),
  accessCode: text("access_code").notNull(),
  status: text("status").default("active"),
  memberId: text("member_id"),
  createdAt: timestamp("created_at").defaultNow(),
});