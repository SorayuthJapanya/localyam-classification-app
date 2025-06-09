import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Buffer } from "buffer";

const ViewInfoSpeciePage = () => {
  const { id } = useParams();
  const [species, setSpecies] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const userRole = localStorage.getItem("userRole") === "ADMIN";

  const { data, isLoading, error } = useQuery({
    queryKey: ["getSpecie", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/species/${id}`);
      return res.data;
    },
    onError: () => {
      toast.error("Failed to fetch species data");
    },
  });

  const handleClickImage = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  useEffect(() => {
    if (data) {
      setSpecies(data);
    }
  }, [data]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">Failed to load species data</p>;
  }

  if (!species) {
    return <p>No species data available</p>;
  }

  return (
    <div className="max-w-2xl w-full mx-auto p-6 min-h-160 ">
      <div className="px-4 py-2 shadow-[0px_0px_30px_-16px_rgba(0,_0,_0,_0.8)] my-4 rounded-xl">
        <div className="flex justify-end items-center my-4 mx-4">
          <div
            onClick={() => history.back()}
            className="flex gap-2 px-3 py-2 mb-2 bg-gray-400 text-white rounded hover:bg-gray-500 duration-300 cursor-pointer transition-all ease-in-out hover:-translate-y-1"
          >
            <p>&larr;</p>
            <button className="cursor-pointer">Go Back</button>
          </div>
        </div>

        {/* Image Section */}
        <div className="mb-10 gap-4 flex flex-col items-center justify-center">
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
            className="w-70 h-full mb-4 relative  transition duration-200"
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
          <h1 className="text-2xl font-medium">{species.commonName}</h1>
        </div>

        <div className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ข้อมูลพื้นฐาน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">ชื่อท้องถิ่น</span>
                <span className="text-lg">{species.localName || "-"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">ชื่อวิทยาศาสตร์</span>
                <span className="text-lg italic">
                  {species.scientificName || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">วงศ์</span>
                <span className="text-lg italic">
                  {species.familyName || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Botanical Characteristics Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ลักษณะทางพฤกษศาสตร์
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {species.description || "ไม่มีข้อมูล"}
            </p>
          </div>

          {/* Propagation Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              การขยายพันธุ์
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {species.propagation || "ไม่มีข้อมูล"}
            </p>
          </div>

          {/* Seasons Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ฤดูกาลปลูกและเก็บเกี่ยว
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">ปลูกช่วง</span>
                <span className="text-lg">
                  {species.plantingseason || "ไม่มีข้อมูล"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">เก็บเกี่ยวช่วง</span>
                <span className="text-lg">
                  {species.harvestingseason || "ไม่มีข้อมูล"}
                </span>
              </div>
            </div>
          </div>

          {/* Utilization Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              การใช้ประโยชน์
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {species.utilization || "ไม่มีข้อมูล"}
            </p>
          </div>

          {/* Market and Status Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ตลาดและสถานภาพ
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {species.status || "ไม่มีข้อมูล"}
            </p>
          </div>

          {/* Survey Sites Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              แหล่งที่สำรวจ
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {species.surveysite || "ไม่มีข้อมูล"}
            </p>
          </div>
        </div>
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

export default ViewInfoSpeciePage;
