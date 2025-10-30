-- Ensure profiles can be read by admins for property management
CREATE POLICY "Admins can view profiles for property management"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);