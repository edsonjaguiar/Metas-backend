import { randomUUIDv7 } from "bun"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { goals } from "./goals"
import { users } from "./users"

export const goalCompletions = pgTable("goal_completions", {
	id: text("id")
		.primaryKey()
		.$default(() => randomUUIDv7()),
	goalId: text("goal_id")
		.notNull()
		.references(() => goals.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	completedAt: timestamp("completed_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
})
