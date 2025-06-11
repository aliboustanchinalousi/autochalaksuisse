'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getVehicleById } from '@/services/vehicleService';
import { Vehicle } from '@/types/vehicle';
import ImageGallery from '@/components/vehicles/ImageGallery';
import { useI18n, useCurrentLocale } from '@/lib/i18n.client';

// Helper to format specific vehicle fields using i18n
const formatVehicleField = (field: string | undefined, t: Function, prefix: string = '') => {
  if (!field) return t('not_available') || 'N/A';
  const key = prefix + field.toLowerCase().replace(/[\s-]+/g, '_');
  const translated = t(key);
  // If translation exists and is not the key itself, use it. Otherwise, use the original field.
  return translated !== key ? translated : field;
};


export default function VehicleDetailPage() {
  const params = useParams();
  const locale = useCurrentLocale();
  const { t } = useI18n();

  const id = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleDetails = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      setError(t('error_invalid_vehicle_id') || 'Invalid vehicle ID.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVehicleById(id);
      setVehicle(data);
    } catch (err: any) {
      console.error(`Error fetching vehicle ${id}:`, err);
      if (err.message.toLowerCase().includes('not found')) {
        setError(t('vehicle_not_found_with_id', { id }) || `Vehicle with ID ${id} not found.`);
      } else {
        setError(err.message || t('error_loading_vehicle_details_generic') || 'Failed to load vehicle details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, t]); // Added t to dependencies of useCallback

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 animate-pulse min-h-screen">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div> {/* Back link placeholder */}
        <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div> {/* Image Gallery placeholder */}
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div> {/* Title placeholder */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div> {/* Subtitle placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, colIndex) => (
            <div key={colIndex} className="space-y-3">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-3"></div> {/* Section title placeholder */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center">
        <p className="text-red-600 dark:text-red-400 text-xl mb-4">{error}</p>
        <Link href={`/${locale}/cars`} legacyBehavior>
          <a className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            {t('back_to_listings') || 'Back to Listings'}
          </a>
        </Link>
      </div>
    );
  }

  if (!vehicle) {
    // This state should ideally be covered by the error 'Vehicle not found'
    return (
      <div className="container mx-auto p-4 text-center min-h-screen">
        <p className="text-gray-700 dark:text-gray-300 text-xl">{t('vehicle_not_found') || 'Vehicle details are currently unavailable.'}</p>
        <Link href={`/${locale}/cars`} legacyBehavior>
          <a className="mt-4 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            {t('back_to_listings') || 'Back to Listings'}
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <Link href={`/${locale}/cars`} legacyBehavior>
          <a className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t('back_to_listings') || 'Back to Listings'}
          </a>
        </Link>
      </div>

      <article className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <ImageGallery imageUrls={vehicle.image_urls || []} altText={`${vehicle.make} ${vehicle.model}`} />

        <div className="p-6 sm:p-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{vehicle.year_of_manufacture}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b pb-2 dark:border-gray-700">{t('vehicle_details_title') || 'Vehicle Details'}</h2>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>{t('price') || 'Price'}:</strong> <span className="font-semibold text-green-600 dark:text-green-400 text-lg">CHF {parseFloat(vehicle.price).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></li>
                <li><strong>{t('mileage') || 'Mileage'}:</strong> {vehicle.mileage.toLocaleString('de-CH')} km</li>
                {vehicle.fuel_type && <li><strong>{t('fuel_type') || 'Fuel Type'}:</strong> {formatVehicleField(vehicle.fuel_type, t, 'fuel_types.')}</li>}
                {vehicle.transmission_type && <li><strong>{t('transmission_type') || 'Transmission'}:</strong> {formatVehicleField(vehicle.transmission_type, t, 'transmission_types.')}</li>}
                {vehicle.location && <li><strong>{t('location') || 'Location'}:</strong> {vehicle.location}</li>}
                <li><strong>{t('status') || 'Status'}:</strong> {formatVehicleField(vehicle.status, t, 'status_types.')}</li>
                <li><strong>{t('listed_on') || 'Listed On'}:</strong> {new Date(vehicle.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b pb-2 dark:border-gray-700">{t('seller_information_title') || 'Seller Information'}</h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                 <p className="text-gray-600 dark:text-gray-300">{t('seller_info_placeholder') || 'Detailed seller information will be available soon.'}</p>
                 {vehicle.seller_id && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Seller ID: {vehicle.seller_id}</p>}
              </div>
            </div>
          </div>

          {vehicle.description && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b pb-2 dark:border-gray-700">{t('description_title') || 'Description'}</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{vehicle.description}</p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
