-- Migration to fix remaining_amount for existing data
-- Run this ONCE if you have existing data in secret_box table

-- Step 1: Add remaining_amount column if it doesn't exist
ALTER TABLE secret_box 
ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;

-- Step 2: Set remaining_amount = amount for all TAKE entries
UPDATE secret_box
SET remaining_amount = amount
WHERE t_type = 'TAKE';

-- Step 3: Calculate and update remaining_amount based on returns
-- This will process each person's transactions and update remaining amounts

DO $$
DECLARE
    person_record RECORD;
    take_record RECORD;
    return_record RECORD;
    remaining_to_deduct NUMERIC;
    current_remaining NUMERIC;
    deduction NUMERIC;
BEGIN
    -- Loop through each unique person
    FOR person_record IN 
        SELECT DISTINCT user_id, party_name 
        FROM secret_box 
        WHERE party_name IS NOT NULL
    LOOP
        -- Get all RETURN entries for this person (oldest first)
        FOR return_record IN
            SELECT id, amount, created_at
            FROM secret_box
            WHERE user_id = person_record.user_id 
            AND party_name = person_record.party_name
            AND t_type = 'RETURN'
            ORDER BY created_at ASC
        LOOP
            remaining_to_deduct := return_record.amount;
            
            -- Apply this return to TAKE entries (oldest first)
            FOR take_record IN
                SELECT id, amount, remaining_amount, created_at
                FROM secret_box
                WHERE user_id = person_record.user_id 
                AND party_name = person_record.party_name
                AND t_type = 'TAKE'
                AND remaining_amount > 0
                ORDER BY created_at ASC
            LOOP
                IF remaining_to_deduct <= 0 THEN
                    EXIT;
                END IF;
                
                current_remaining := take_record.remaining_amount;
                deduction := LEAST(remaining_to_deduct, current_remaining);
                
                -- Update the TAKE entry's remaining_amount
                UPDATE secret_box
                SET remaining_amount = current_remaining - deduction
                WHERE id = take_record.id;
                
                remaining_to_deduct := remaining_to_deduct - deduction;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Step 4: Verify the results
SELECT 
    party_name,
    t_type,
    COUNT(*) as entry_count,
    SUM(amount) as total_amount,
    SUM(CASE WHEN t_type = 'TAKE' THEN remaining_amount ELSE 0 END) as total_remaining
FROM secret_box
GROUP BY party_name, t_type
ORDER BY party_name, t_type;
