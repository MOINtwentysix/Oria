ALTER TABLE users RENAME COLUMN clerk_id TO account_id;
DROP INDEX IF EXISTS idx_users_clerk_id;
CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);