import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Camera, Loader, X } from "lucide-react";

const EditSpeciesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    commonName: "",
    localName: "",
    scientificName: "",
    familyName: "",
    description: "",
    propagation: "",
    plantingseason: "",
    harvestingseason: "",
    utilization: "",
    status: "",
    surveysite: "",
  });
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const { isLoading: isFetching, error: fetchError } = useQuery({
    queryKey: ["getSpecies", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/species/${id}`);
      const specie = res.data;
      setFormData({
        commonName: specie.commonName,
        localName: specie.localName,
        scientificName: specie.scientificName,
        familyName: specie.familyName,
        description: specie.description,
        propagation: specie.propagation,
        plantingseason: specie.plantingseason,
        harvestingseason: specie.harvestingseason,
        utilization: specie.utilization,
        status: specie.status,
        surveysite: specie.surveysite,
      });
      setExistingImage(specie.imageUrl);

      return specie;
    },
    onError: () => {
      toast.error("Failed to fetch species data");
    },
  });

  const { mutate: updateSpecies, isLoading: isUpdating } = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      if (data.image) formData.append("image", data.image);
      formData.append("commonName", data.commonName);
      formData.append("localName", data.localName);
      formData.append("scientificName", data.scientificName);
      formData.append("familyName", data.familyName);
      formData.append("description", data.description);
      formData.append("propagation", data.propagation);
      formData.append("plantingseason", data.plantingseason);
      formData.append("harvestingseason", data.harvestingseason);
      formData.append("utilization", data.utilization);
      formData.append("status", data.status);
      formData.append("surveysite", data.surveysite);

      return (
        await axiosInstance.put(`/species/${id}`, formData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    },
    onSuccess: () => {
      toast.success("Species updated successfully");
      navigate("/admin/manage-species");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update data");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSpecies({ ...formData, image });
  };

  if (isFetching) {
    return <p>Loading...</p>;
  }

  if (fetchError) {
    return <p className="text-red-500">Failed to load species data</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 max-w-5xl mx-auto relative"
    >
      <div className="flex justify-end">
        <button
          onClick={() => history.back()}
          className="flex items-center gap-2 px-3 py-2 text-black bg-gray-300 hover:bg-gray-400 cursor-pointer rounded-md duration-200 transitin-all ease-in-out hover:-translate-y-1"
        >
          <p>&larr;</p>
          <p>Go Back</p>
        </button>
      </div>
      {/* Image Upload Section */}
      <div className="flex flex-col items-center gap-4 relative py-2 mb-2">
        <div className="size-70 rounded-xl overflow-hidden border-2 border-gray-500">
          <img
            src={
              image
                ? URL.createObjectURL(image)
                : existingImage
                ? `${import.meta.env.VITE_SERVER_URL}/uploads/${existingImage}`
                : "/leaf.png"
            }
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        {!image && (
          <label
            htmlFor="image-upload"
            className="absolute right-33 bottom-8 cursor-pointer hover:bg-black duration-200 px-2 py-2 bg-black/70 rounded-full transition-all ease-in-out hover:-translate-y-1"
          >
            <Camera className="size-5 text-white" />
          </label>
        )}
        {image && (
          <button
            type="button"
            className="cursor-pointer transition-all ease-in-out hover:-translate-y-1 px-2 py-2 rounded-full bg-red-500/80 absolute bottom-8 right-33 hover:bg-red-700"
            onClick={handleRemoveImage}
          >
            <X className="size-5 text-white" />
          </button>
        )}

        <input
          type="file"
          name="image"
          id="image-upload"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
        />
        <p className="text-sm text-zinc-600">
          {isUpdating ? (
            <Loader className="size-5 animate-spin" />
          ) : (
            "Click the camera to upload an image"
          )}
        </p>
      </div>

      {/* Info Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-3 ">
        {/* Left-section */}
        <div className="space-y-2">
          {/* Common Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ชื่อสามัญ
            </label>
            <input
              type="text"
              name="commonName"
              value={formData.commonName}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full"
              required
            />
          </div>

          {/* Local Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ชื่อท้องถิ่น
            </label>
            <input
              type="text"
              name="localName"
              value={formData.localName}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full"
              required
            />
          </div>

          {/* Scientific Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ชื่อวิทยาศาสตร์
            </label>
            <input
              type="text"
              name="scientificName"
              value={formData.scientificName}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full cursor-not-allowed"
              required
              disabled
            />
          </div>

          {/* Family Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ชื่อวงศ์
            </label>
            <input
              type="text"
              name="familyName"
              value={formData.familyName}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full"
              required
            />
          </div>
        </div>

        {/* Right-section */}
        <div className="space-y-2">
          {/* Propagation */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              การขยายพันธุ์
            </label>
            <input
              type="text"
              name="propagation"
              value={formData.propagation}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full"
            />
          </div>
          {/* Planting Season */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ฤดูกาลปลูก
            </label>
            <input
              type="text"
              name="plantingseason"
              value={formData.plantingseason}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Harvesting Season */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ฤดูกาลเก็บเกี่ยว
            </label>
            <input
              type="text"
              name="harvestingseason"
              value={formData.harvestingseason}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              สถานภาพ
            </label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="border border-gray-400 rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          ลักษณะทั่วไป
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="border border-gray-400 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Utilization */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          การใช้ประโยชน์
        </label>
        <textarea
          type="text"
          name="utilization"
          value={formData.utilization}
          onChange={handleInputChange}
          className="border border-gray-400 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Survey Site */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          แหล่งที่สำรวจ
        </label>
        <textarea
          type="text"
          name="surveysite"
          value={formData.surveysite}
          onChange={handleInputChange}
          className="border border-gray-400 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transitin-all ease-in-out hover:-translate-y-1 duration-200 cursor-pointer"
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Update Species"}
      </button>
    </form>
  );
};

export default EditSpeciesForm;
