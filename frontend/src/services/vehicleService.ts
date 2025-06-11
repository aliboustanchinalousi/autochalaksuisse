import { VehicleApiResponse, PaginatedVehicles, Vehicle } from '@/types/vehicle';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export interface GetVehiclesParams {
  page?: number;
  limit?: number;
  make?: string;
  model?: string;
  price_min?: number;
  price_max?: number;
  year_of_manufacture?: number;
  fuel_type?: string;
  transmission_type?: string;
  sort_by?: string; // e.g., 'price', 'created_at'
  sort_order?: 'ASC' | 'DESC';
}

export const getVehicles = async (params: GetVehiclesParams = {}): Promise<PaginatedVehicles> => {
  const queryParams = new URLSearchParams();

  // Convert page to offset for backend if backend uses offset
  // The backend findAll uses offset and limit, page is derived in controller
  // So, we send page and limit, backend controller should handle it.
  if (params.page) queryParams.append('offset', ((params.page - 1) * (params.limit || 20)).toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  if (params.make) queryParams.append('make', params.make);
  if (params.model) queryParams.append('model', params.model);
  if (params.price_min) queryParams.append('price_min', params.price_min.toString());
  if (params.price_max) queryParams.append('price_max', params.price_max.toString());
  if (params.year_of_manufacture) queryParams.append('year_of_manufacture', params.year_of_manufacture.toString());
  if (params.fuel_type) queryParams.append('fuel_type', params.fuel_type);
  if (params.transmission_type) queryParams.append('transmission_type', params.transmission_type);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);


  const url = `${API_BASE_URL}/vehicles?${queryParams.toString()}`;
  console.log("Fetching vehicles from URL:", url); // For debugging

  const response = await fetch(url);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `Network response was not ok (${response.status})`, status: response.status };
    }
    console.error('Failed to fetch vehicles:', errorData);
    throw new Error(errorData.message || `Failed to fetch vehicles. Status: ${response.status}`);
  }

  const apiResponse: VehicleApiResponse = await response.json();

  // Transform to PaginatedVehicles
  return {
    vehicles: apiResponse.data,
    total_count: apiResponse.meta.total_count,
    page: apiResponse.meta.page,
    page_size: apiResponse.meta.page_size,
    total_pages: apiResponse.meta.total_pages,
  };
};

// Define a type for vehicle creation payload, omitting fields like id, created_at, updated_at
// and ensuring price is a number. image_urls is already string[] in Vehicle type.
export type CreateVehiclePayload = Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'price' | 'status'> & {
    price: number;
    status?: string; // Status is optional from form, defaults in backend if not provided by admin
    // seller_id will be added from authenticated user context or explicitly if admin
};

export const createVehicle = async (
    vehicleData: CreateVehiclePayload,
    token: string
): Promise<Vehicle> => {
  const url = `${API_BASE_URL}/vehicles`;
  console.log("Creating vehicle at URL:", url, "with data:", vehicleData); // For debugging

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(vehicleData),
  });

  // Try to parse JSON regardless of response.ok
  let responseData;
  try {
    responseData = await response.json();
  } catch (jsonError) {
    if (!response.ok) {
      throw new Error(`Failed to create vehicle (status ${response.status}) and could not parse error response.`);
    }
    // This case is unlikely if API is consistent (e.g. 201 with non-JSON body)
    throw new Error('Vehicle creation request seemed to succeed but failed to parse response.');
  }

  if (!response.ok) {
    console.error('Failed to create vehicle:', responseData);
    throw new Error(responseData.message || `Failed to create vehicle. Status: ${response.status}`);
  }

  // Assuming backend returns { status: 'success', data: newVehicle }
  if (responseData && responseData.status === 'success' && responseData.data) {
    return responseData.data as Vehicle;
  } else {
    console.error('Unexpected response structure after creating vehicle:', responseData);
    throw new Error(responseData.message || 'Vehicle created, but server response format was unexpected.');
  }
};


// Fetches a single vehicle by its ID
export const getVehicleById = async (id: string | number): Promise<Vehicle> => {
  const url = `${API_BASE_URL}/vehicles/${id}`;
  console.log("Fetching vehicle from URL:", url); // For debugging

  const response = await fetch(url);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If parsing errorData itself fails, construct a generic error
      errorData = { message: `Network error or invalid JSON response (${response.status})` };
    }

    if (response.status === 404) {
      console.warn(`Vehicle with id ${id} not found (404).`);
      throw new Error(errorData.message || 'Vehicle not found'); // Use server message if available
    }

    console.error(`Failed to fetch vehicle with id ${id}:`, errorData);
    throw new Error(errorData.message || `Failed to fetch vehicle with id ${id}. Status: ${response.status}`);
  }

  const result = await response.json(); // Expects { status: 'success', data: vehicle }
  if (result && result.data) {
    return result.data as Vehicle;
  } else {
    // This case should ideally not happen if API is consistent
    console.error(`Unexpected response structure for vehicle id ${id}:`, result);
    throw new Error('Received unexpected data structure from server.');
  }
};
