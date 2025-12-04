-- Deletar registros existentes sem userId
DELETE FROM "goal_completions";-->statement-breakpoint
ALTER TABLE "goal_completions" ADD COLUMN "user_id" text NOT NULL;-->statement-breakpoint
ALTER TABLE "goal_completions" ADD CONSTRAINT "goal_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;