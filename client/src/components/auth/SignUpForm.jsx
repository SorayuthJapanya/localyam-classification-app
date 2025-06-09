import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  // set all fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";

  //   call backend useMutation ( POST, PUT, DELETE )
  const { mutate: signUpMutation, isLoading } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      navigate("/login");
    },
    onError: (err) =>
      toast.error(err.response.data.message || "Something went wrong!!"),
  });

  //   when click submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return toast.error("Password do not match");
    signUpMutation({ name, email, role, password, confirmPassword });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-6 my-6 w-full realative"
    >
      {isAdmin && (
        <div className="flex justify-end items-center">
          <button
            onClick={() => history.back()}
            className="flex gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-md cursor-pointer tansition-all duration-300 ease-in-out hover:-translate-y-1"
          >
            <span>&larr; </span>
            <p>Go back</p>
          </button>
        </div>
      )}

      {/* Title */}
      <div
        className={`text-center text-3xl md:text-3xl lg:text-4xl font-semibold pb-6 ${
          isAdmin && "text-amber-800"
        }`}
      >
        {isAdmin ? <h2>Add New User</h2> : <h2>Sign Up</h2>}
      </div>

      {/* Input */}
      <div className="w-full">
        <input
          type="text"
          placeholder="Username"
          value={name}
          id="name"
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 border-gray-400 rounded-lg w-full"
          required
        />
      </div>
      <div className="w-full">
        <input
          type="email"
          placeholder="Email"
          value={email}
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 border-gray-400 rounded-lg w-full"
          required
        />
      </div>
      {isAdmin && (
        <div className="w-full">
          <select
            value={role}
            id="role"
            onChange={(e) => setRole(e.target.value)}
            className="border px-3 py-2 border-gray-400 rounded-lg w-full"
            required
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      )}
      <div className="w-full relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 border-gray-400 rounded-lg w-full"
          aria-label="Password"
        />
        <div
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-[7px] cursor-pointer py-1 px-1 rounded-md hover:bg-gray-200 transition-all duration-200 ease-in-out hover:active:translate-y-0.5"
        >
          {!showPassword ? (
            <Eye className="size-5 text-gray-500" />
          ) : (
            <EyeOff className="size-5 text-gray-500 " />
          )}
        </div>
      </div>
      <div className="w-full relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          id="confirmPassword"
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border px-3 py-2 border-gray-400 rounded-lg w-full"
          required
        />
        <div
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-2 top-[7px] cursor-pointer py-1 px-1 rounded-md hover:bg-gray-200 transition-all duration-200 ease-in-out hover:active:translate-y-0.5"
        >
          {!showConfirmPassword ? (
            <Eye className="size-5 text-gray-500" />
          ) : (
            <EyeOff className="size-5 text-gray-500 " />
          )}
        </div>
      </div>

      {/* Button */}
      <button
        type="submit"
        className="bg-main px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-700 text-white text-lg cursor-pointer duration-200 transition-all ease-in-out hover:-translate-y-0.5"
        disabled={isLoading}
      >
        {isLoading ? <Loader className="size-5 animate-spin " /> : "Sign Up"}
      </button>
    </form>
  );
};

export default SignupForm;
