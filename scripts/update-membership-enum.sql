-- Add the "student" value to the membership enum if it doesn't exist
DO $$
BEGIN
    -- Check if the "student" value exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'student' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'membership'
        )
    ) THEN
        -- Add the "student" value to the enum
        ALTER TYPE "membership" ADD VALUE 'student';
    END IF;
END
$$; 