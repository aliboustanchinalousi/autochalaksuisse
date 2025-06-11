// frontend/src/types/vehicle.ts
export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year_of_manufacture: number;
  price: string; // Comes as string from DECIMAL, convert to number for display/calculations if needed
  mileage: number;
  fuel_type?: string;
  transmission_type?: string;
  description?: string;
  image_urls: string[]; // Assuming JSONB is parsed into an array of strings
  location?: string;
  status: string;
  seller_id?: number;
  created_at: string; // Date string
  updated_at: string; // Date string
}

// This was the response structure from the backend for getAllVehicles
export interface VehicleApiResponse {
  status: string;
  data: Vehicle[];
  meta: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}


// This is a more frontend-centric paginated response type if we transform the API response
export interface PaginatedVehicles {
  vehicles: Vehicle[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}
