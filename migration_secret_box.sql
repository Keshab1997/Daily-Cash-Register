-- Migration Script: Add party_name column to secret_box table
-- Run this in Supabase SQL Editor if you already have the secret_box table

-- Add party_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'secret_box' AND column_name = 'party_name'
    ) THEN
        ALTER TABLE secret_box ADD COLUMN party_name text;
    END IF;
END $$;

-- Update policy to include update permission
DROP POLICY IF EXISTS "Users can update own secret data" ON secret_box;
CREATE POLICY "Users can update own secret data" ON secret_box 
FOR UPDATE USING (auth.uid() = user_id);
