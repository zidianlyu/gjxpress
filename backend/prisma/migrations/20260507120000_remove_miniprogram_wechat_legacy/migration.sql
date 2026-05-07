-- Remove legacy mini program login identity columns from users.
-- Review before applying to any shared database.

DROP INDEX IF EXISTS "users_openid_key";

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "openid",
  DROP COLUMN IF EXISTS "unionid";
