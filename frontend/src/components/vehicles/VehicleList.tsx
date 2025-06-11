'use client';
import { Vehicle } from '@/types/vehicle';
import VehicleCard from './VehicleCard';

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  error?: string | null; // Optional error message to display
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, isLoading, error }) => {
  if (error) {
    // This is a fallback, CarsPage.tsx has a more prominent error display.
    // However, this could be useful if VehicleList is used in other contexts.
    return <p className="text-center text-red-500 py-8">Error loading vehicles: {error}</p>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg shadow p-4 bg-white dark:bg-gray-800 animate-pulse">
            <div className="w-full h-56 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mt-3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">No vehicles found matching your criteria.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleList;
