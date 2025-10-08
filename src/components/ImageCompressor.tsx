import React, { useState, useRef } from 'react';
import { compressImageTo500x500, isValidImageFile, getImageDimensions, CompressedImageResult } from '../utils/imageCompression';
import { PixelTable } from './PixelTable';

interface ImageInfo {
  name: string;
  size: number;
  dimensions: { width: number; height: number };
  type: string;
}

export const ImageCompressor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageInfo, setOriginalImageInfo] = useState<ImageInfo | null>(null);
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPixelTable, setShowPixelTable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setCompressedImage(null);

    // Validate file type
    if (!isValidImageFile(file)) {
      setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Get original image info
      const dimensions = await getImageDimensions(file);
      const imageInfo: ImageInfo = {
        name: file.name,
        size: file.size,
        dimensions,
        type: file.type,
      };
      
      setOriginalImage(file);
      setOriginalImageInfo(imageInfo);

      // Compress the image
      const result = await compressImageTo500x500(file);
      setCompressedImage(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedImage || !originalImageInfo) return;

    const link = document.createElement('a');
    link.href = compressedImage.dataUrl;
    link.download = `compressed_${originalImageInfo.name.split('.')[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalImageInfo(null);
    setCompressedImage(null);
    setError(null);
    setShowPixelTable(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-full mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Image Compressor - 500x500
        </h2>
        
        {/* File Input */}
        <div className="mb-6">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Select an image to compress
          </label>
          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-600 text-sm">Processing image...</p>
          </div>
        )}

        {/* Results */}
        {originalImageInfo && compressedImage && (
          <div className="space-y-6">
            {/* Original Image Info - Only show before compression */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Original Image</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium">Name:</span> {originalImageInfo.name}</div>
                <div><span className="font-medium">Size:</span> {formatFileSize(originalImageInfo.size)}</div>
                <div><span className="font-medium">Dimensions:</span> {originalImageInfo.dimensions.width} × {originalImageInfo.dimensions.height}</div>
                <div><span className="font-medium">Type:</span> {originalImageInfo.type}</div>
              </div>
            </div>

            {/* Main Content Grid: Compressed Image (1fr) + Pixel Table (3fr) */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Compressed Image Section - 1fr */}
              <div className="xl:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Compressed Image</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Size:</span> {formatFileSize(compressedImage.blob.size)}</p>
                    <p><span className="font-medium">Dimensions:</span> 500 × 500</p>
                    <p><span className="font-medium">Type:</span> image/jpeg</p>
                    <p><span className="font-medium">Compression:</span> {((1 - compressedImage.blob.size / originalImageInfo.size) * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="border rounded-md overflow-hidden bg-white">
                  <img
                    src={compressedImage.dataUrl}
                    alt="Compressed"
                    className="w-full h-auto"
                    style={{ maxWidth: '500px', maxHeight: '500px' }}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
                  >
                    Download Image
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm"
                  >
                    Upload New Image
                  </button>
                </div>
              </div>

              {/* Pixel Table Section - 3fr */}
              <div className="xl:col-span-3">
                <PixelTable pixelData={compressedImage.pixelData} width={500} height={500} />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {compressedImage && (
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowPixelTable(!showPixelTable)}
              className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                showPixelTable 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
              }`}
            >
              {showPixelTable ? 'Hide Pixel Table' : 'Show Pixel Table'}
            </button>
          </div>
        )}

        {/* Pixel Table */}
        {compressedImage && showPixelTable && (
          <div className="mt-8">
            <PixelTable pixelData={compressedImage.pixelData} width={500} height={500} />
          </div>
        )}
      </div>
    </div>
  );
};