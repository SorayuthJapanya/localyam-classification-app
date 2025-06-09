import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import LocalNameSearch from "../../components/search/LocalNameSearch";

const SpeciesPage = () => {
  const [speciesData, setSpeciesData] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedLocalName, setSelectedLocalName] = useState("");

  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");

  // Fetch species data
  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllSpecies", selectedLocalName, role],
    enabled: true,
    queryFn: async () => {
      const res = await axiosInstance.get("/species/all", {
        params: {
          local_Name: selectedLocalName,
          role: role,
        },
      });
      return res.data;
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to fetch species data"
      );
    },
  });

  useEffect(() => {
    if (data) {
      setSpeciesData(data.species);
    }
  }, [data]);

  const handleRefreshPage = () => {
    setSelectedLocalName("");
  };

  const handleClickImage = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-12 px-30">
      {/* Header */}
      <header className="text-center mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-emerald-600">Explore Species</h1>
        <p className="text-gray-600">
          Discover and learn about various species
        </p>
      </header>

      {/* Search Bar */}
      <div className="flex justify-end items-center mb-6 space-x-4 mr-2">
        <LocalNameSearch
          onLocalNameSelected={(localName) => {
            setSelectedLocalName(localName);
          }}
        />
        <button
          onClick={handleRefreshPage}
          className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 duration-200 cursor-pointer transition-all ease-in-out hover:-translate-y-0.5"
        >
          Reset
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto mt-10">
        {isLoading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">
            {error.message || "An error occurred"}
          </p>
        ) : speciesData.length === 0 ? (
          <p className="text-center text-gray-600">No species found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {speciesData.map((species) => (
              <div
                key={species._id}
                className="bg-white shadow-md rounded-lg p-4  hover:shadow-lg transition duration-200 "
              >
                <div
                  onClick={() =>
                    handleClickImage(
                      species.imageUrl
                        ? `${import.meta.env.VITE_SERVER_URL}/uploads/${
                            species.imageUrl
                          }`
                        : "https://via.placeholder.com/150"
                    )
                  }
                  className="w-full h-48 mb-4 relative  hover:bg-black/10 transition duration-200"
                >
                  <img
                    src={
                      species.imageUrl
                        ? `${import.meta.env.VITE_SERVER_URL}/uploads/${
                            species.imageUrl
                          }`
                        : "https://via.placeholder.com/150"
                    }
                    alt={species.scientificName}
                    className="w-full h-full object-repeat object-cover object-center rounded-md mb-4 hover:cursor-pointer"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {species.scientificName}
                </h2>
                <p className="text-gray-600 italic">{species.localName}</p>
                <button
                  onClick={() => navigate(`/specie/${species._id}`)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 duration-200 cursor-pointer transition-all ease-in-out hover:-translate-y-0.5"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          onClick={handleClosePreview}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-160 rounded-lg"
            />
            <button
              onClick={handleClosePreview}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full px-3 py-[6px] hover:bg-red-700 cursor-pointer transition-all duration-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesPage;
