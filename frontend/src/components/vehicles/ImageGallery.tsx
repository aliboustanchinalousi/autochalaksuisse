'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  imageUrls: string[];
  altText: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ imageUrls, altText }) => {
  const placeholderImage = "/images/placeholder-vehicle.png"; // Ensure this image exists in public/images

  // Initialize selectedImage with the first valid URL or placeholder
  const [selectedImage, setSelectedImage] = useState(() => {
    return imageUrls && imageUrls.length > 0 ? imageUrls[0] : placeholderImage;
  });

  // Update selectedImage if imageUrls prop changes (e.g., parent component re-fetches data)
  useEffect(() => {
    if (imageUrls && imageUrls.length > 0) {
      // Only update if the current selectedImage is not in the new list or is the placeholder
      if (!imageUrls.includes(selectedImage) || selectedImage === placeholderImage) {
        setSelectedImage(imageUrls[0]);
      }
    } else {
      setSelectedImage(placeholderImage);
    }
  }, [imageUrls, selectedImage]); // Added selectedImage to dependencies to prevent unnecessary updates if it's already valid

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== placeholderImage) { // Prevent infinite loop if placeholder itself fails
      target.src = placeholderImage;
      target.srcset = ""; // Clear srcset
    }
  };

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg">
        <Image
          src={placeholderImage}
          alt={altText || "Placeholder image"}
          width={800} // Provide explicit width for layout stability
          height={600} // Provide explicit height for layout stability
          className="object-contain rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-3xl h-80 md:h-96 lg:h-[500px] mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <Image
          src={selectedImage}
          alt={altText}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
          onError={handleImageError}
          priority={true} // Mark main image as priority for LCP
        />
      </div>
      {imageUrls.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto p-2 w-full max-w-3xl justify-center">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer rounded-md border-2 ${selectedImage === url ? 'border-blue-600 dark:border-blue-400' : 'border-transparent'} hover:border-blue-400 dark:hover:border-blue-300 transition-all duration-150 flex-shrink-0 overflow-hidden`}
              onClick={() => setSelectedImage(url)}
            >
              <Image
                src={url}
                alt={`${altText} - thumbnail ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
                onError={handleImageError}
                sizes="(max-width: 640px) 64px, 80px" // For performance optimization
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
