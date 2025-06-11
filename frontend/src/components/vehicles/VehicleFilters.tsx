'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { GetVehiclesParams } from '@/services/vehicleService';

interface VehicleFiltersProps {
  onFilterChange: (filters: Partial<GetVehiclesParams>) => void;
  initialFilters?: Partial<GetVehiclesParams>;
  // Could add more props like availableMakes, availableModels if fetched from API
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [make, setMake] = useState(initialFilters.make || '');
  const [model, setModel] = useState(initialFilters.model || '');
  const [priceMin, setPriceMin] = useState(initialFilters.price_min?.toString() || '');
  const [priceMax, setPriceMax] = useState(initialFilters.price_max?.toString() || '');
  const [year, setYear] = useState(initialFilters.year_of_manufacture?.toString() || '');
  // Add more states for other filters like fuel_type, transmission_type if needed

  const debouncedFilterChange = useCallback(
    (filters: Partial<GetVehiclesParams>) => {
      onFilterChange(filters);
    },
    [onFilterChange]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const filters: Partial<GetVehiclesParams> = {};
      if (make) filters.make = make;
      if (model) filters.model = model;
      if (priceMin) filters.price_min = Number(priceMin);
      if (priceMax) filters.price_max = Number(priceMax);
      if (year) filters.year_of_manufacture = Number(year);
      debouncedFilterChange(filters);
    }, 700); // Increased debounce time slightly

    return () => clearTimeout(handler);
  }, [make, model, priceMin, priceMax, year, debouncedFilterChange]);

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission if it were part of a form
    setMake('');
    setModel('');
    setPriceMin('');
    setPriceMax('');
    setYear('');
    // Immediately trigger update with empty filters
    // To ensure this is applied, the debounced function is called directly
    // or call onFilterChange directly if preferred.
    debouncedFilterChange({});
  };

  return (
    <div className="p-4 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <input
          type="text"
          placeholder="Make (e.g., BMW)"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Model (e.g., X5)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Min Price (CHF)"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Max Price (CHF)"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
         <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default VehicleFilters;
