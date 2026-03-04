import React, { useState, useEffect } from "react";
import { 
  MdDelete, 
  MdClose, 
  MdCheckCircle, 
  MdError,
  MdFileUpload,
  MdImage
} from "react-icons/md";
import { FiZoomIn, FiRotateCw, FiDownload } from "react-icons/fi";

const ImagePreview = ({ 
  image, 
  onRemove, 
  fileName = "image.png",
  fileSize = 0,
  onReplace,
  showControls = true,
  maxHeight = "400px",
  previewMode = "contain", // 'contain', 'cover', or 'fill'
  showFileInfo = true,
  showValidation = true,
  isUploading = false,
  uploadProgress = 0,
  className = ""
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasError, setHasError] = useState(false);

  // File size formatting
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format file name
  const formatFileName = (name) => {
    if (!name || name.length <= 30) return name;
    return name.substring(0, 15) + "..." + name.substring(name.length - 15);
  };

  // Image validation
  const validateImage = (url) => {
    const img = new Image();
    img.onload = () => setHasError(false);
    img.onerror = () => setHasError(true);
    img.src = url;
  };

  useEffect(() => {
    if (image) {
      validateImage(image);
    }
  }, [image]);

  // Rotation handler
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Download handler
  const handleDownload = () => {
    if (!image) return;
    
    const link = document.createElement("a");
    link.href = image;
    link.download = fileName || "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Image style based on preview mode
  const getImageStyle = () => {
    const baseStyle = {
      transform: `rotate(${rotation}deg)`,
      transition: "transform 0.3s ease",
    };

    switch (previewMode) {
      case "cover":
        return { ...baseStyle, objectFit: "cover", width: "100%", height: "100%" };
      case "fill":
        return { ...baseStyle, objectFit: "fill", width: "100%", height: "100%" };
      default:
        return { ...baseStyle, objectFit: "contain", maxWidth: "100%", maxHeight: maxHeight };
    }
  };

  // Get file extension safely
  const getFileExtension = () => {
    if (!fileName) return "";
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop().toUpperCase() : "";
  };

  if (hasError && !isUploading) {
    return (
      <div className={`relative bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center border-2 border-dashed border-red-300 ${className}`}>
        <div className="text-red-500 mb-4">
          <MdError className="w-16 h-16" />
        </div>
        <p className="text-lg font-medium text-red-700 mb-2">Failed to load image</p>
        <p className="text-gray-600 mb-6">The image file may be corrupted or inaccessible.</p>
        <div className="flex space-x-3">
          <button
            onClick={onRemove}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
          >
            <MdDelete className="mr-2" />
            Remove
          </button>
          {onReplace && (
            <button
              onClick={onReplace}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <MdFileUpload className="mr-2" />
              Replace
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
            aria-label="Close zoom"
          >
            <MdClose className="w-6 h-6 text-gray-800" />
          </button>
          <img
            src={image}
            alt="Full size preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onError={() => setHasError(true)}
          />
        </div>
      )}

      {/* Main Preview Container */}
      <div className={`relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Uploading...</p>
              <p className="text-white text-sm mt-2">{uploadProgress}%</p>
              <div className="w-48 h-2 bg-gray-600 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Top Controls */}
        {showControls && (
          <div className="absolute top-3 right-3 z-10 flex space-x-2">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Zoom in"
              title="Zoom image"
            >
              <FiZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Rotate image"
              title="Rotate 90°"
            >
              <FiRotateCw className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="Remove image"
              title="Remove image"
            >
              <MdDelete className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        {showControls && (
          <div className="absolute bottom-3 right-3 z-10 flex space-x-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Download image"
              title="Download image"
            >
              <FiDownload className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* Image Container */}
        <div className="flex items-center justify-center p-4 min-h-[200px] relative">
          {image ? (
            <img
              src={image}
              alt="Preview"
              style={getImageStyle()}
              className={`transition-transform duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={() => setIsZoomed(!isZoomed)}
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="text-center p-8">
              <MdImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No image selected</p>
            </div>
          )}
        </div>

        {/* File Information */}
        {showFileInfo && fileName && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <MdCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium text-gray-900 truncate">
                  {formatFileName(fileName)}
                </span>
              </div>
              {showValidation && !hasError && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Valid
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Size:</span> {formatFileSize(fileSize)}
              </div>
              <div>
                <span className="font-medium">Type:</span> {getFileExtension()}
              </div>
            </div>

            {/* Replace Button */}
            {onReplace && (
              <button
                onClick={onReplace}
                className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
              >
                <MdFileUpload className="mr-2" />
                Replace Image
              </button>
            )}
          </div>
        )}

        {/* Rotation Indicator */}
        {rotation !== 0 && (
          <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {rotation}°
          </div>
        )}
      </div>
    </>
  );
};

export default ImagePreview;