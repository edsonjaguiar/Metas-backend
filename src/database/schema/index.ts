import { accounts } from "./accounts"
import { achievements, userAchievements } from "./achievements"
import { goals } from "./goals"
import { goalCompletions } from "./goals-completions"
import { sessions } from "./sessions"
import { users } from "./users"
import { verifications } from "./verifications"

export const schema = {
	users,
	accounts,
	verifications,
	sessions,
	goals,
	goalCompletions,
	achievements,
	userAchievements,
}