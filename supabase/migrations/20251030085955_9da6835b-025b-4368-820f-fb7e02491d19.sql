-- Add verification steps data to kyc_verifications table
ALTER TABLE public.kyc_verifications 
ADD COLUMN verification_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN admin_notes text,
ADD COLUMN review_status text DEFAULT 'pending';

COMMENT ON COLUMN public.kyc_verifications.verification_data IS 'Stores step-by-step verification data including personal info, documents, etc';
COMMENT ON COLUMN public.kyc_verifications.admin_notes IS 'Admin notes for verification review';
COMMENT ON COLUMN public.kyc_verifications.review_status IS 'Overall review status: pending, approved, rejected, needs_revision';