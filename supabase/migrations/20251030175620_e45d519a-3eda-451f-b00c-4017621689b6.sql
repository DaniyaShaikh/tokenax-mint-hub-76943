-- Allow users to update their own KYC for demo auto-approval
CREATE POLICY "Users can update their own KYC status"
ON public.kyc_verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);