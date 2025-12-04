import { randomUUIDv7 } from "bun"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { users } from "./users"

export const achievements = pgTable("achievements", {
	id: text("id")
		.primaryKey()
		.$default(() => randomUUIDv7()),
	name: text("name").notNull(),
	description: text("description").notNull(),
	icon: text("icon").notNull(),
	xpReward: integer("xp_reward").notNull(),
	criteriaType: text("criteria_type").notNull(), // e.g., 'STREAK', 'GOALS_COMPLETED'
	criteriaValue: integer("criteria_value").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
})

export const userAchievements = pgTable("user_achievements", {
	id: text("id")
		.primaryKey()
		.$default(() => randomUUIDv7()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	achievementId: text("achievement_id")
		.notNull()
		.references(() => achievements.id, { onDelete: "cascade" }),
	unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
})
