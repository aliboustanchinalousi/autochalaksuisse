'use client';

import React, { useState, FormEvent } from 'react'; // Explicitly import FormEvent
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { createVehicle, CreateVehiclePayload } from '@/services/vehicleService';
import { useI18n, useCurrentLocale } from '@/lib/i18n.client';
import Link from 'next/link';

// Define more specific types for form state if needed
type VehicleFormData = {
    make: string;
    model: string;
    year_of_manufacture_str: string;
    price_str: string;
    mileage_str: string;
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng' | 'hydrogen' | 'other'; // More specific types
    transmission_type: 'manual' | 'automatic' | 'semi-automatic'; // More specific types
    description: string;
    image_urls_str: string; // Comma-separated string for image URLs
    location: string;
    // status: 'available' | 'pending'; // Defaulted to 'available' in backend or set by admin
};

const NewVehiclePageContent: React.FC = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const locale = useCurrentLocale();
  const { t } = useI18n();

  const initialFormData: VehicleFormData = {
    make: '', model: '', year_of_manufacture_str: '', price_str: '', mileage_str: '',
    fuel_type: 'petrol', transmission_type: 'manual', description: '',
    image_urls_str: '', location: '',
  };
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any })); // Use 'as any' for type compatibility with specific fuel/transmission types
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !user) {
      setError(t('error_not_authenticated_to_create') || 'You must be logged in to create a listing.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (!formData.make || !formData.model || !formData.price_str || !formData.year_of_manufacture_str || !formData.mileage_str) {
        throw new Error(t('error_missing_required_fields_simple') || 'Please fill in all required fields (Make, Model, Year, Price, Mileage).');
      }

      const price = parseFloat(formData.price_str);
      if (isNaN(price) || price <= 0) throw new Error(t('error_invalid_price') || 'Price must be a positive number.');

      const year = parseInt(formData.year_of_manufacture_str, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) throw new Error(t('error_invalid_year', { currentYear: currentYear + 1 }) || `Year must be between 1900 and ${currentYear + 1}.`);

      const mileage = parseInt(formData.mileage_str, 10);
      if (isNaN(mileage) || mileage < 0) throw new Error(t('error_invalid_mileage') || 'Mileage must be a non-negative number.');

      const image_urls = formData.image_urls_str ? formData.image_urls_str.split(',').map(url => url.trim()).filter(url => url) : [];

      const payload: CreateVehiclePayload = {
        make: formData.make,
        model: formData.model,
        year_of_manufacture: year,
        price: price,
        mileage: mileage,
        fuel_type: formData.fuel_type,
        transmission_type: formData.transmission_type,
        description: formData.description,
        image_urls: image_urls,
        location: formData.location,
        seller_id: user.id, // Associate with logged-in user
        // status is defaulted by backend or set by admin logic
      };

      const newVehicle = await createVehicle(payload, token);
      setSuccessMessage(t('success_vehicle_created_message', {make: newVehicle.make, model: newVehicle.model}) || `Vehicle ${newVehicle.make} ${newVehicle.model} created successfully!`);
      setFormData(initialFormData);
      // router.push(`/${locale}/cars/${newVehicle.id}`); // Optional: redirect to the new listing
    } catch (err: any) {
      setError(err.message || t('error_creating_vehicle_unknown') || 'An unknown error occurred while creating the vehicle.');
    } finally {
      setIsLoading(false);
    }
  };

  const commonInputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white";
  const commonLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  const fuelTypeOptions = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'hydrogen', 'other'];
  const transmissionTypeOptions = ['manual', 'automatic', 'semi-automatic'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{t('create_new_listing_title') || 'Create New Vehicle Listing'}</h1>
        <Link href={`/${locale}/cars`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            &larr; {t('back_to_listings') || 'Back to Listings'}
        </Link>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 text-green-800 bg-green-100 dark:bg-green-700 dark:text-green-100 border border-green-400 dark:border-green-600 rounded-md shadow-sm">
          {successMessage} {' '}
          <Link href={`/${locale}/cars`} className="font-semibold underline hover:text-green-900 dark:hover:text-green-200">
            {t('view_all_listings_link') || 'View all listings.'}
          </Link>
        </div>
      )}
      {error && <p className="mb-4 p-3 text-red-800 bg-red-100 dark:bg-red-700 dark:text-red-100 border border-red-400 dark:border-red-600 rounded-md shadow-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-xl rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="make" className={commonLabelClass}>{t('make') || 'Make'}*</label>
            <input type="text" name="make" id="make" value={formData.make} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="model" className={commonLabelClass}>{t('model') || 'Model'}*</label>
            <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className={commonInputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="year_of_manufacture_str" className={commonLabelClass}>{t('year_of_manufacture') || 'Year'}*</label>
            <input type="number" name="year_of_manufacture_str" id="year_of_manufacture_str" value={formData.year_of_manufacture_str} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="price_str" className={commonLabelClass}>{t('price') || 'Price'} (CHF)*</label>
            <input type="number" name="price_str" id="price_str" step="0.01" value={formData.price_str} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="mileage_str" className={commonLabelClass}>{t('mileage') || 'Mileage'} (km)*</label>
            <input type="number" name="mileage_str" id="mileage_str" value={formData.mileage_str} onChange={handleChange} required className={commonInputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="fuel_type" className={commonLabelClass}>{t('fuel_type') || 'Fuel Type'}</label>
                <select name="fuel_type" id="fuel_type" value={formData.fuel_type} onChange={handleChange} className={commonInputClass}>
                    {fuelTypeOptions.map(type => (
                        <option key={type} value={type}>{t(`fuel_types.${type}`)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="transmission_type" className={commonLabelClass}>{t('transmission_type') || 'Transmission'}</label>
                <select name="transmission_type" id="transmission_type" value={formData.transmission_type} onChange={handleChange} className={commonInputClass}>
                     {transmissionTypeOptions.map(type => (
                        <option key={type} value={type}>{t(`transmission_types.${type}`)}</option>
                    ))}
                </select>
            </div>
        </div>

        <div>
          <label htmlFor="description" className={commonLabelClass}>{t('description') || 'Description'}</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className={commonInputClass}></textarea>
        </div>

        <div>
          <label htmlFor="image_urls_str" className={commonLabelClass}>{t('image_urls_label') || 'Image URLs'}</label>
          <input type="text" name="image_urls_str" id="image_urls_str" value={formData.image_urls_str} onChange={handleChange} placeholder={t('image_urls_placeholder') || 'e.g., url1,url2,url3'} className={commonInputClass} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('image_urls_helper_text') || 'Comma-separated list of image URLs.'}</p>
        </div>

        <div>
          <label htmlFor="location" className={commonLabelClass}>{t('location') || 'Location'}</label>
          <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className={commonInputClass} />
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out">
          {isLoading ? (t('creating_listing_button_loading') || 'Creating...') : (t('create_listing_button') || 'Create Listing')}
        </button>
      </form>
    </div>
  );
};

export default function CreateNewVehiclePage() {
  return (
    <ProtectedRoute>
      <NewVehiclePageContent />
    </ProtectedRoute>
  );
}
