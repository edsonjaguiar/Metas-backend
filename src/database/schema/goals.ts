import { randomUUIDv7 } from "bun"
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { users } from "./users"

export const goals = pgTable("goals", {
	id: text("id")
		.primaryKey()
		.$default(() => randomUUIDv7()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	desiredWeeklyFrequency: integer("desired_weekly_frequency").notNull(),
	xpReward: integer("xp_reward").default(10).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
}, (table) => {
	return {
		userIdIdx: index("goals_user_id_idx").on(table.userId),
	}
})