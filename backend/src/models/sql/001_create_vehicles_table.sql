-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL, -- Increased precision for price
    mileage INTEGER NOT NULL,
    fuel_type VARCHAR(50),
    transmission_type VARCHAR(50),
    description TEXT,
    image_urls JSONB DEFAULT '[]'::jsonb,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending', 'deleted')), -- Added more statuses and a check constraint
    seller_id INTEGER, -- To be linked to a users table later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to automatically update updated_at on row modification
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add some indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles(make);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles(location);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_seller_id ON vehicles(seller_id);

COMMENT ON COLUMN vehicles.image_urls IS 'Array of image URLs, e.g., ["url1.jpg", "url2.png"]';
COMMENT ON COLUMN vehicles.price IS 'Price of the vehicle, up to 9,999,999,999.99';
COMMENT ON COLUMN vehicles.status IS 'Current status of the vehicle listing';
