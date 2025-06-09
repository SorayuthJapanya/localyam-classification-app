import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";

const ViewProfileUserPage = () => {
  const { id } = useParams();

  console.log("userID: ", id);
  const [userData, setUserData] = useState([]);
  const [selectedProfile, setSelectdProfile] = useState(null);
  const [existingProfile, setExistingProfile] = useState("");
  const fileInputRef = useRef(null);

  const userRole = localStorage.getItem("userRole");
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

  const {
    data: user,
    isLoading: userLoading,
    refetch,
  } = useQuery({
    queryKey: ["getSelectedUser", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/auth/get-user/${id}`);
      return res.data;
    },
  });

  const { mutate: updateProfile, isLoading: isUpdatingProfile } = useMutation({
    mutationFn: async (updateData) => {
      const formData = new FormData();
      if (updateData) formData.append("image", updateData);

      return await axiosInstance.put(`/auth/update-profile/${id}`, formData);
    },
    onSuccess: () => {
      toast.success("Profile updated succesfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update profile failed ");
    },
  });

  const handleImageUpload = (e) => {
    const profile = e.target.files[0];
    if (!profile) return;
    setSelectdProfile(profile);
    updateProfile(profile);
  };

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        position: userData.position,
        department: userData.department,
        organization: userData.organization,
        work_address: userData.work_address,
        phone_number: userData.phone_number,
      });

      setExistingProfile(userData.profilePic);
    }
  }, [userData]);

  const profileData = [
    { label: "Fullname", value: userData?.name || "-", icon: "👤" },
    { label: "Email", value: userData?.email || "-", icon: "✉️" },
    { label: "Role", value: userData?.role || "-", icon: "⭐" },
    { label: "Position", value: userData?.position || "-", icon: "💼" },
    { label: "Department", value: userData?.department || "-", icon: "👥" },
    { label: "Organization", value: userData?.organization || "-", icon: "🏢" },
    {
      label: "Office Address",
      value: userData?.work_address || "-",
      icon: "📍",
    },
    {
      label: "Telephone",
      value: userData?.phone_number || "-",
      icon: "📱",
    },
  ];

  if (userLoading) {
    return (
      <div className="w-full min-h-160 flex items-center justify-center text-red-500">
        Fetch User Data Failed
      </div>
    );
  }

  return (
    <div className="w-full min-h-160">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-white rounded-xl p-6 space-y-4 shadow-[0px_0px_30px_-16px_rgba(0,_0,_0,_0.8)]">
          {/* Menu */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => history.back()}
              className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md transition transition ease-in-out hover:-translate-y-0.5 duration-200 cursor-pointer "
            >
              Back
            </button>

            <button
              onClick={() => navigate(`/admin/edit-user/${userData._id}`)}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition transition ease-in-out hover:-translate-y-0.5 duration-200 cursor-pointer "
            >
              Edit
            </button>
          </div>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-800">
              {userRole === "ADMIN" ? "View Profile" : "Profile"}
            </h1>
            <p className="mt-2 text-gray-600">
              {userRole === "ADMIN"
                ? "View & Edit some information"
                : "Your profile information"}{" "}
            </p>
          </div>

          {/* Avatar Upload Section */}
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
                className="size-32 rounded-full object-cover border-2 border-gray-500"
              />
            </div>
            <p className="text-2xl font-semibold text-zinc-700">
              {userData.name}
            </p>
          </div>
          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 gap-6 my-6">
            {profileData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center space-x-4 p-4 bg-gray-100 rounded-lg shadow-md border border-gray-200"
              >
                <span className="text-xl mt-1">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">
                    {item.label}
                  </h3>
                  <p
                    className={`mt-1 text-gray-800 ${
                      item.value === "-" ? "text-gray-400" : ""
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfileUserPage;
