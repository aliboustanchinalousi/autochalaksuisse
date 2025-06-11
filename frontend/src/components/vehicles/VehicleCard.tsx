'use client';
import { Vehicle } from '@/types/vehicle';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrentLocale } from '@/lib/i18n.client';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const locale = useCurrentLocale();
  const placeholderImage = "/images/placeholder-vehicle.png"; // Ensure this image exists in public/images

  return (
    <Link href={`/${locale}/cars/${vehicle.id}`} legacyBehavior>
      <a className="block border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow duration-200 ease-in-out overflow-hidden bg-white dark:bg-gray-800">
        <div className="relative w-full h-56"> {/* Increased height for better image display */}
          <Image
            src={vehicle.image_urls && vehicle.image_urls.length > 0 ? vehicle.image_urls[0] : placeholderImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            layout="fill"
            objectFit="cover"
            onError={(e) => {
              // Type assertion for the event target
              const target = e.target as HTMLImageElement;
              if (target.src !== placeholderImage) { // Prevent infinite loop if placeholder also fails
                target.src = placeholderImage;
                target.srcset = ""; // Clear srcset if it was set
              }
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 truncate" title={`${vehicle.make} ${vehicle.model}`}>
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.year_of_manufacture}</p>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-2">
            CHF {parseFloat(vehicle.price).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{vehicle.mileage.toLocaleString('de-CH')} km</p>
          {vehicle.location && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate" title={vehicle.location}>
              {vehicle.location}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
};

export default VehicleCard;
