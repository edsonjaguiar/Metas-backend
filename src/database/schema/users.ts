import { randomUUIDv7 } from "bun"
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$default(() => randomUUIDv7()),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	cloudinaryPublicId: text("cloudinary_public_id"),
	level: integer("level").default(1).notNull(),
	experience: integer("experience").default(0).notNull(),
	totalExperience: integer("total_experience").default(0).notNull(),
	experienceToNextLevel: integer("experience_to_next_level")
		.default(100)
		.notNull(),
	currentStreak: integer("current_streak").default(0).notNull(),
	longestStreak: integer("longest_streak").default(0).notNull(),
	lastInteractionDate: timestamp("last_interaction_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
})