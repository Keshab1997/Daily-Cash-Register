-- Check current state of secret_box table
SELECT 
    id,
    party_name,
    t_type,
    amount,
    remaining_amount,
    created_at
FROM secret_box
WHERE party_name = 'Keshab'
ORDER BY created_at ASC;

-- If you see wrong remaining_amount values, run this to reset:
-- This will recalculate everything from scratch

-- Step 1: Reset all TAKE entries to their original amount
UPDATE secret_box
SET remaining_amount = amount
WHERE t_type = 'TAKE';

-- Step 2: Now you can manually test the return feature
-- The system should work correctly after this reset
