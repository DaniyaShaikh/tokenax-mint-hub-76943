-- Drop existing constraint if it exists
ALTER TABLE public.kyc_verifications
DROP CONSTRAINT IF EXISTS kyc_verifications_user_id_fkey;

-- Add foreign key relationship between kyc_verifications and profiles
ALTER TABLE public.kyc_verifications
ADD CONSTRAINT kyc_verifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;