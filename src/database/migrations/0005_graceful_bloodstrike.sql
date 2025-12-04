DROP TABLE "daily_task_completions" CASCADE;--> statement-breakpoint
DROP TABLE "daily_tasks" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_experience" integer DEFAULT 0 NOT NULL;