import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";

  const navigate = useNavigate();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (error) {
        if (error.response && error.response.status === 401) return null;
        toast.error(error.response.data.message || "Something went wrong");
      }
    },
  });

  if (!authUser) return navigate("/login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      {isAdmin ? (
        <Link
          to="/admin"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        >
          Go Back to Admin Home Page
        </Link>
      ) : (
        <Link
          to="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        >
          Go Back to Home
        </Link>
      )}
    </div>
  );
};

export default NotFoundPage;
