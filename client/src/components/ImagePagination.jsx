import React, { useState } from "react";
import image1 from "../assets/1.jpg";
import image2 from "../assets/2.jpg";
import image3 from "../assets/3.jpg";
import image4 from "../assets/4.jpg";
import image5 from "../assets/5.jpg";
import image6 from "../assets/6.jpg";
import image7 from "../assets/7.jpg";
import image8 from "../assets/8.jpg";
import image9 from "../assets/9.jpg";
import image10 from "../assets/10.jpg";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ImagePagination = ({ openInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10,
  ];

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setSelectedImage(
      images[currentIndex === images.length - 1 ? 0 : currentIndex + 1]
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setSelectedImage(
      images[currentIndex === 0 ? images.length - 1 : currentIndex - 1]
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="relative w-full max-w-6xl mx-auto h-[90vh] p-4">
        <button
          onClick={openInfo}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/30 hover:bg-white/40 transition-all hover:-translate-y-1 text-white cursor-pointer z-100"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main Image Display */}
        <div className="h-[78vh] flex items-center justify-center relative">
          {selectedImage || images[currentIndex] ? (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 p-2 rounded-full bg-white/30 hover:bg-white/40 transition-all text-white z-100 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={selectedImage || images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />

              <button
                onClick={handleNext}
                className="absolute right-4 p-2 rounded-full bg-white/30 hover:bg-white/40 transition-all text-white z-100 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          ) : (
            <p className="text-gray-400">No image selected</p>
          )}
        </div>

        {/* Thumbnails */}
        <div className="mt-4 flex justify-center gap-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 ${
                index === currentIndex ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="h-16 w-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImagePagination;
