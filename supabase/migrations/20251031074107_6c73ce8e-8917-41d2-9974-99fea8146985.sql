-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to include dummy data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_admin_user BOOLEAN;
  new_property_id UUID;
  tokenized_property_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, user_mode)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'buyer'
  );
  
  -- Check if admin
  is_admin_user := NEW.email = 'admin@tokenax.co';
  
  -- Assign role
  IF is_admin_user THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  -- Only add dummy data for non-admin users
  IF NOT is_admin_user THEN
    -- Create dummy properties for the user (as seller)
    INSERT INTO properties (title, owner_id, address, property_type, description, valuation, status, property_images, expected_tokens)
    VALUES 
      (
        'Luxury Penthouse Suite',
        NEW.id,
        '123 Skyline Boulevard, Manhattan, NY 10001',
        'residential',
        'Stunning penthouse with panoramic city views, featuring modern architecture and premium finishes',
        3500000,
        'tokenized',
        '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"]',
        35000
      ),
      (
        'Modern Office Complex',
        NEW.id,
        '456 Business Park Drive, San Francisco, CA 94107',
        'commercial',
        'State-of-the-art commercial space in prime tech hub location',
        8500000,
        'tokenized',
        '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"]',
        85000
      ),
      (
        'Seaside Resort Villa',
        NEW.id,
        '789 Ocean Avenue, Miami Beach, FL 33139',
        'residential',
        'Exclusive beachfront property with private access and luxury amenities',
        2750000,
        'pending',
        '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"]',
        27500
      )
    RETURNING id INTO new_property_id;

    -- Get IDs of the tokenized properties just created
    FOR tokenized_property_id IN 
      SELECT id FROM properties 
      WHERE owner_id = NEW.id 
      AND status = 'tokenized'
    LOOP
      -- Create property tokens for tokenized properties
      INSERT INTO property_tokens (property_id, total_tokens, available_tokens, price_per_token)
      SELECT 
        tokenized_property_id,
        p.expected_tokens,
        p.expected_tokens - 1000, -- 1000 tokens already "sold"
        p.valuation / p.expected_tokens
      FROM properties p
      WHERE p.id = tokenized_property_id;
    END LOOP;

    -- Create dummy investments for the user (as buyer)
    -- Get some existing tokenized properties from other users to invest in
    INSERT INTO token_purchases (buyer_id, property_id, tokens_purchased, price_per_token, total_amount)
    SELECT 
      NEW.id,
      pt.property_id,
      500,
      pt.price_per_token,
      500 * pt.price_per_token
    FROM property_tokens pt
    JOIN properties p ON p.id = pt.property_id
    WHERE p.owner_id != NEW.id
    AND p.status = 'tokenized'
    LIMIT 2;

    -- If no other properties exist yet, that's okay - user will still have their own properties
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();