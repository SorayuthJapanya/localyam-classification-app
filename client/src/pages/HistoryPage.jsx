import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Edit, Loader, Loader2, MapPin, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import MapConponent from "../components/MapComponent";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const HistoryPage = () => {
  const queryClient = useQueryClient();
  const [isDeleted, setIsDeleted] = useState(null);
  const [historiesData, setHistoriesData] = useState([]);

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
  });

  const {
    data: authHistory,
    isLoading: isHistoryLoading,
    isRefetching: isHistoryRefetching,
    error: historiesError,
    refetch,
  } = useQuery({
    queryKey: ["authHistory", authUser?._id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/history/get-history/${authUser._id}`
      );
      return res.data;
    },
  });

  const { mutate: deleteHistory } = useMutation({
    mutationFn: async (historyId) => {
      setIsDeleted(true);
      await axiosInstance.delete(`history/delete-history/${historyId}`);
    },
    onSuccess: (response, historyId) => {
      toast.success("History deleted successfully");
      setIsDeleted(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete history.");
    },
    onSettled: () => {
      setIsDeleted(null);
    },
  });

  const { mutate: updateHistory } = useMutation({
    mutationFn: async ({ historyId, latitude, longitude }) => {
      const res = await axiosInstance.put(
        `/history/update-history/${historyId}`,
        {
          latitude,
          longitude,
        }
      );
      return res.data;
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Updated GPS successfully");
      queryClient.invalidateQueries({ queryKey: ["authHistory"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update history.");
    },
  });

  const handleDeleteHistory = async (historyId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete your history?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, I do!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      setIsDeleted(historyId);
      deleteHistory(historyId);
    }
  };

  const handleDeleteAllHistory = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete all your history?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, I do!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        setIsDeleted(true);
        await axiosInstance.delete(
          `/history/delete-all-history/${authUser._id}`
        );
        toast.success("All history deleted successfully");
        setIsDeleted(false);
        queryClient.invalidateQueries({ queryKey: ["authHistory"] });
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete all history."
        );
      } finally {
        refetch();
      }
    }
  };

  const handleUpdateHistory = async (
    historyId,
    currentLatitude,
    currentLongitude
  ) => {
    let selectedLatitude = currentLatitude;
    let selectedLongitude = currentLongitude;
    const mapId = `map-${historyId}`;

    const result = await Swal.fire({
      title: "Choose a Location",
      html: `
        <input id="location-search" type="text" placeholder="Search location" class="swal2-input" />
        <div id="map" style="width: 100%; height: 400px; margin-top: 10px;"></div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      didOpen: () => {
        const map = L.map("map").setView(
          [selectedLatitude, selectedLongitude],
          8
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const marker = L.marker([selectedLatitude, selectedLongitude], {
          draggable: true,
        }).addTo(map);

        // Update location when marker is clicked
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          selectedLatitude = lat;
          selectedLongitude = lng;
          marker.setLatLng([lat, lng]);
        });

        // Update location when marker is dragged
        marker.on("dragend", () => {
          const { lat, lng } = marker.getLatLng();
          selectedLatitude = lat;
          selectedLongitude = lng;
        });
        // Add search functionality
        const searchInput = document.getElementById("location-search");
        searchInput.addEventListener("change", async () => {
          const query = searchInput.value;
          if (query) {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  query
                )}`
              );
              const data = await response.json();
              if (data.length > 0) {
                const { lat, lon } = data[0];
                selectedLatitude = parseFloat(lat);
                selectedLongitude = parseFloat(lon);
                map.setView([selectedLatitude, selectedLongitude], 13);
                marker.setLatLng([selectedLatitude, selectedLongitude]);
              } else {
                Swal.fire(
                  "Location not found",
                  "Please try a different search query.",
                  "error"
                );
              }
            } catch (error) {
              Swal.fire("Error", "Failed to fetch location data.", "error");
            } finally {
              refetch();
            }
          }
        });
      },
    });

    if (result.isConfirmed) {
      updateHistory({
        historyId,
        latitude: selectedLatitude,
        longitude: selectedLongitude,
      });
    }
  };

  const handleOpenMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const parseExifDate = (exifString) => {
    if (
      !exifString ||
      typeof exifString !== "string" ||
      !exifString.includes(" ")
    ) {
      return null;
    }

    try {
      const [datePart, timePart] = exifString.split(" ");
      const [year, month, day] = datePart.split(":");
      const [hours, minutes, seconds] = timePart.split(":");

      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (error) {
      console.error("Invalid EXIF date format:", exifString, error);
      return null;
    }
  };

  useEffect(() => {
    if (authHistory && authHistory.length > 0) {
      setHistoriesData(authHistory);
    }
  }, [authHistory]);

  if (isLoading) {
    return (
      <div className="w-full h-160 flex items-center justify-center">
        <Loader className="size-5 animate-spin" />
      </div>
    );
  }

  if (
    !authHistory ||
    historiesData.length === 0 ||
    authHistory.length === 0 ||
    historiesError
  ) {
    return (
      <div className="w-full h-160 flex justify-center items-center">
        <p>No history found</p>
      </div>
    );
  }

  if (isHistoryRefetching) {
    return (
      <div className="w-full h-160 flex items-center justify-center">
        <Loader className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <header className="text-center mb-6 space-y-2">
        <h1 className="text-5xl font-bold text-indigo-800">Your History</h1>
        <p className="text-gray-600">View your classification history</p>
      </header>

      <div className="space-y-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-end space-y-4 mb-6 ">
            <button
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 transition-all ease-in-out hover:-translate-y-1"
              onClick={handleDeleteAllHistory}
            >
              <Trash2 className="size-5" />
              Delete All History
            </button>
          </div>
        </div>

        {historiesData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((history, index) => (
            <div
              key={history._id}
              className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 flex flex-col gap-4 relative"
            >
              {isDeleted === history._id && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-100">
                  <Loader2 className="animate-spin size-8" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="flex justify-center items-center w-full h-auto p-6">
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}/uploads/${
                      history.imageUrl
                    }`}
                    alt={history.bestpredicted}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Info Section */}
                <div className="flex flex-row md:flex-col px-6 text-center md:text-left justify-center">
                  {/* Top Info */}
                  <div className="mb-4 border-r md:border-r-white md:border-b border-gray-600 pb-4 pr-2 md:pr-0">
                    <h2 className="text-2xl font-semibold text-indigo-800">
                      Best Prediction: {history.bestpredicted}
                    </h2>
                    <div className="space-y-2">
                      <p className="text-indigo-800 text-lg font-semibold ">
                        Confidence Score: {history.confidenceScore}%
                      </p>
                      <p className="text-gray-800 text-lg font-semibold text-center md:text-left">
                        All Predictions (Top 5 Score)
                        <div className="pl-2 gap-y-1">
                          {history.top5
                            .sort((a, b) => b.probability - a.probability)
                            .slice(0, 10)
                            .map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start text-gray-500 text-base"
                              >
                                <span className="mr-1">•</span>
                                <span className="break-words">
                                  {item.class} {item.probability}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </p>
                      <p className="text-gray-800 text-base font-semibold">
                        Date:{" "}
                        {parseExifDate(history.datetime_taken)?.toLocaleString(
                          "en-EN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        ) ||
                          new Date(history.createdAt).toLocaleString("en-EN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                  </div>
                  {/* Bottom Info */}
                  <div>
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-2">
                      Best filter Prediction: {history.bestfilterpredicted}
                    </h2>
                    <div className="space-y-2">
                      <p className="text-gray-800 text-lg font-semibold">
                        All Filter Predictions
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2">
                        {history.allfilterpredicted
                          .slice(0, 10)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="flex items-start text-gray-500 text-base font-semibold"
                            >
                              <span className="mr-1">•</span>
                              <span className="break-words">{item.class}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleOpenMap(history.latitude, history.longitude);
                    }}
                    className="px-2 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 cursor-pointer duration-300 transition-all ease-in-out hover:-translate-y-0.5"
                  >
                    <MapPin className="size-5" />
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateHistory(
                        history._id,
                        history.latitude,
                        history.longitude
                      )
                    }
                    className="px-2 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 cursor-pointer duration-300 transition-all ease-in-out hover:-translate-y-0.5"
                  >
                    <Edit className="size-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteHistory(history._id)}
                    className="px-2 py-2 text-white bg-red-500 rounded-full hover:bg-red-700 cursor-pointer duration-300 transition-all ease-in-out hover:-translate-y-0.5"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>

              {/* Map Section */}
              {/* Map Section */}
              {history.latitude && history.longitude && (
                <div className="w-full h-85 mt-4 z-1">
                  <MapConponent
                    key={`${history.latitude}-${history.longitude}`}
                    latitude={history.latitude}
                    longitude={history.longitude}
                  />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default HistoryPage;
