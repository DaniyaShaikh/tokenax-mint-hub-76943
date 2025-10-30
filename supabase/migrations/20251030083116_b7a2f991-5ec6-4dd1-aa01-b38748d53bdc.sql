-- First, check and drop the constraint if it exists with the wrong configuration
ALTER TABLE public.properties
DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;

-- Now add it with the correct configuration
ALTER TABLE public.properties
ADD CONSTRAINT properties_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;