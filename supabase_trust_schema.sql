-- Trust & Safety Expansion for CampusCart

-- 1. Users / Profiles Table (Handles verification & reputation)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  college_id text UNIQUE,
  department text,
  year text,
  avatar_url text,
  is_verified boolean DEFAULT false,
  role text DEFAULT 'student', -- student, staff, admin
  reputation_score numeric DEFAULT 5.0,
  strikes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Reviews Table (Ratings after handovers)
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES users(id),
  target_user_id uuid REFERENCES users(id),
  product_id uuid REFERENCES products(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Rentals Table (For tracking rented items & deposits)
CREATE TABLE rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  renter_id uuid REFERENCES users(id),
  deposit_amount numeric NOT NULL,
  start_date timestamp with time zone DEFAULT now(),
  due_date timestamp with time zone NOT NULL,
  status text DEFAULT 'active', -- active, returned, disputed
  returned_at timestamp with time zone
);

-- 4. Dispute & Reporting Table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id),
  reported_user_id uuid REFERENCES users(id),
  product_id uuid REFERENCES products(id),
  category text NOT NULL, -- fake_listing, scam, inappropriate, damaged
  description text NOT NULL,
  status text DEFAULT 'pending', -- pending, resolved, dismissed
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Safe Pickup Locations (Admin defined)
CREATE TABLE pickup_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true
);

-- Insert some default Safe Pickup Zones
INSERT INTO pickup_locations (name, description) VALUES
('Main Library Entrance', 'Under CCTV surveillance, 24/7 security present.'),
('Student Center Atrium', 'Busy public area, safe during daytime.'),
('Block A Canteen', 'Popular meetup spot, well lit.');
