import React, { useRef, useState, useEffect } from "react";
import { useUpload } from "../context/UploadContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const InputImg = () => {
  const fileInputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const { images, setImages } = useUpload();
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

  const validTypes = ["image/png", "image/jpg", "image/jpeg"];

  const addFilesToList = (newFiles) => {
    if (!authUser) {
      toast.error("Please logged in first!!");
      navigate("/login");
      return;
    }

    try {
      const filesArray = Array.from(newFiles);

      // filter before keepfile
      const existingNames = new Set(filesList.map((file) => file.name));
      const filteredFiles = filesArray.filter(
        (file) =>
          validTypes.includes(file.type) && !existingNames.has(file.name)
      );

      if (filteredFiles.length === 0) {
        toast.error("No valid new files to add");
        return;
      }

      // Generate preview URLs & keep file
      const newImageObjects = filteredFiles.map((file) => ({
        file: file,
        preview: URL.createObjectURL(file),
      }));

      setImages((prevImages) => [...prevImages, ...newImageObjects]);

      navigate("/preview");
    } catch (error) {
      console.log("Error adding file", error);
      toast.error("Failed to add files");
    }
  };

  // Click input file hidden when click button
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // when choose file
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    addFilesToList(newFiles);
  };

  // Dragging file
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Leave Dradding file
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // When drop file
  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFilesToList(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropFile}
      className={`w-80 h-80 ${
        isDragging ? "bg-blue-100 border-2 border-blue-400" : "bg-white/20"
      } flex flex-col justify-center items-center rounded-4xl shadow-[0px_0px_59px_-16px_rgba(0,_0,_0,_0.8)]`}
    >
      <div className="w-full h-full flex justify-center flex-col items-center">
        <button
          type="button"
          onClick={handleButtonClick}
          className="text-center px-20 py-3 hover:bg-blue-700 active:bg-blue-900 cursor-pointer duration-200 bg-blue-500 text-white rounded-full font-[600] transition-all ease-in-out hover:-translate-y-1"
        >
          UPLOAD IMAGE
        </button>
        <p className="text-md mt-2 text-gray-500">
          or drop any: png, jpg, jpeg
        </p>
      </div>
      <input
        type="file"
        name="imges"
        id="images"
        multiple
        accept="image/png, image/jpg, image/jpeg"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
};

export default InputImg;
