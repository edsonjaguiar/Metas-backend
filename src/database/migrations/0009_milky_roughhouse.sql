CREATE INDEX "goal_completions_goal_id_idx" ON "goal_completions" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "goal_completions_user_id_idx" ON "goal_completions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");