-- Add column as nullable first
ALTER TABLE "goals" ADD COLUMN "expires_at" timestamp;-->statement-breakpoint

-- Set default value for existing goals (7 days from creation)
UPDATE "goals" SET "expires_at" = "created_at" + INTERVAL '7 days' WHERE "expires_at" IS NULL;-->statement-breakpoint

-- Now make it NOT NULL
ALTER TABLE "goals" ALTER COLUMN "expires_at" SET NOT NULL;-->statement-breakpoint

ALTER TABLE "users" ADD COLUMN "cloudinary_public_id" text;