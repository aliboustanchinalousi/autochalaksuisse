'use client';

import React, { useState, useEffect, useCallback } from 'react';
import VehicleList from '@/components/vehicles/VehicleList';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import { getVehicles, GetVehiclesParams } from '@/services/vehicleService';
import { PaginatedVehicles } from '@/types/vehicle'; // Using the frontend-centric type
import { useI18n, useCurrentLocale } from '@/lib/i18n.client';
import Link from 'next/link'; // For pagination links if preferred

const ITEMS_PER_PAGE = 12;

export default function CarsPage() {
  const { t } = useI18n();
  const locale = useCurrentLocale();
  const [vehiclesResponse, setVehiclesResponse] = useState<PaginatedVehicles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // 1-indexed page
  const [currentFilters, setCurrentFilters] = useState<Partial<GetVehiclesParams>>({});

  const fetchVehicleData = useCallback(async (page: number, filters: Partial<GetVehiclesParams>) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: GetVehiclesParams = {
        ...filters,
        page: page, // Send 1-indexed page to service
        limit: ITEMS_PER_PAGE,
      };
      console.log("Fetching with params:", params);
      const data = await getVehicles(params);
      setVehiclesResponse(data);
    } catch (err: any) {
      console.error("Error in CarsPage fetchVehicleData:", err);
      setError(err.message || 'An unknown error occurred while fetching vehicles.');
      setVehiclesResponse(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect will run when currentPage or currentFilters change
    fetchVehicleData(currentPage, currentFilters);
  }, [currentPage, currentFilters, fetchVehicleData]);

  const handleFilterChange = useCallback((filters: Partial<GetVehiclesParams>) => {
    setCurrentFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (!vehiclesResponse || newPage <= vehiclesResponse.total_pages)) {
      setCurrentPage(newPage);
      // Scroll to top might be nice here: window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen"> {/* Ensure page takes at least screen height */}
      <div className="my-6 text-center"> {/* Added margin for spacing */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          {t('buy_sell_cars_title') || "Explore Vehicles for Sale"}
        </h1>
      </div>

      <VehicleFilters onFilterChange={handleFilterChange} initialFilters={currentFilters} />

      {error && (
        <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-md my-6 shadow-md">
          <p className="font-semibold">Error loading vehicles:</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchVehicleData(currentPage, currentFilters)}
            className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      <VehicleList
        vehicles={vehiclesResponse?.vehicles || []}
        isLoading={isLoading}
        error={!isLoading && !vehiclesResponse?.vehicles?.length && !error ? "No vehicles found." : undefined} // Pass error to list if needed
      />

      {!isLoading && vehiclesResponse && vehiclesResponse.total_pages > 0 && (
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 mt-10 mb-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors text-sm"
          >
            {t('pagination_previous') || 'Previous'}
          </button>
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            {t('pagination_page_info', { currentPage: vehiclesResponse.page, totalPages: vehiclesResponse.total_pages }) || `Page ${vehiclesResponse.page} of ${vehiclesResponse.total_pages}`}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === vehiclesResponse.total_pages || vehiclesResponse.total_pages === 0}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors text-sm"
          >
            {t('pagination_next') || 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
