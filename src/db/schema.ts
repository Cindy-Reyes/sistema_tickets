import { pgEnum, pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["USER", "ADMIN"]);
export const ticketStatus = pgEnum("ticket_status", [ "OPEN", "IN_PROGRESS", "RESOLVED" ]);
export const ticketPriority = pgEnum("ticket_priority", [ "LOW", "MEDIUM", "HIGH" ]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRole("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

