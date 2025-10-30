-- Update existing pending properties with relevant property images

-- Commercial Office Tower
UPDATE properties 
SET property_images = '[
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
  "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200",
  "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=1200",
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200"
]'::jsonb
WHERE title = 'Commercial Office Tower' AND status = 'pending';

-- Retail Shopping Center
UPDATE properties 
SET property_images = '[
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
  "https://images.unsplash.com/photo-1567449303183-7aa628b7db66?w=1200",
  "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200"
]'::jsonb
WHERE title = 'Retail Shopping Center' AND status = 'pending';

-- Downtown Commercial Complex
UPDATE properties 
SET property_images = '[
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200"
]'::jsonb
WHERE title = 'Downtown Commercial Complex' AND status = 'pending';

-- Beachfront Hotel Resort
UPDATE properties 
SET property_images = '[
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200"
]'::jsonb
WHERE title = 'Beachfront Hotel Resort' AND status = 'pending';

-- Luxury Oceanfront Estate
UPDATE properties 
SET property_images = '[
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200"
]'::jsonb
WHERE title = 'Luxury Oceanfront Estate' AND status = 'pending';

-- Modern Luxury Villa
UPDATE properties 
SET property_images = '[
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200"
]'::jsonb
WHERE title = 'Modern Luxury Villa' AND status = 'pending';