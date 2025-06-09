import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Camera, Save, ArrowLeft } from "lucide-react";

const EditProfilePage = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [existingProfile, setExistingProfile] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    organization: "",
    work_address: "",
    phone_number: "",
    profilePic: "",
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["getSelectedUser", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/auth/get-user/${id}`);
      return res.data;
    },
  });

  const { mutate: updateUserInfo, isLoading: isUpdatingInfo } = useMutation({
    mutationFn: async (userData) => {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "profilePic" && value instanceof File) {
          form.append("image", value); // <-- ใช้ key: image
        } else {
          form.append(key, value);
        }
      });

      return await axiosInstance.put(`/auth/update-user/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      navigate(-1);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const handleImageUpload = (e) => {
    const profile = e.target.files[0];
    if (!profile) return;
    setSelectedProfile(profile);
    setFormData((prev) => ({
      ...prev,
      profilePic: profile,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "profilePic" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserInfo(formData);
  };

  useEffect(() => {
    if (user) {
      setUserData(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        position: user.position || "",
        department: user.department || "",
        organization: user.organization || "",
        work_address: user.work_address || "",
        phone_number: user.phone_number || "",
      });
      setExistingProfile(user.profilePic || "");
    }
  }, [user]);

  if (userLoading) {
    return (
      <div className="w-full min-h-160 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-160 bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 space-y-6 shadow-md"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-all duration-200 cursor-pointer ease-in-out hover:-translate-y-1"
          >
            <ArrowLeft className="size-5" />
            Back
          </button>
          {/* Header and Navigation */}
          <div className="flex justify-center items-center">
            <h1 className="text-4xl font-bold text-gray-800">Edit Profile</h1>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={
                  selectedProfile
                    ? URL.createObjectURL(selectedProfile)
                    : existingProfile
                    ? `${
                        import.meta.env.VITE_SERVER_URL
                      }/uploads/${existingProfile}`
                    : "/avatar.png"
                }
                alt="Profile"
                className="size-32 rounded-full object-cover border-2 border-gray-300"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-black/70 hover:bg-black 
                  p-2 rounded-full cursor-pointer 
                  transition-all ease-in-out hover:-translate-y-1 duration-200
                  ${isUpdatingInfo ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="size-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingInfo}
                />
              </label>
            </div>
            <p className="text-sm text-gray-600">
              {isUpdatingInfo
                ? "Uploading..."
                : "Click to change profile photo"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700"
                >
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-gray-700"
              >
                Organization
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="work_address"
                className="block text-sm font-medium text-gray-700"
              >
                Office Address
              </label>
              <textarea
                id="work_address"
                name="work_address"
                value={formData.work_address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="081-234-5678"
                maxLength={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingInfo}
              className="flex items-center justify-center gap-2 px-4 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-200 disabled:bg-blue-400"
            >
              <Save className="size-5" />
              {isUpdatingInfo ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
