import React, { useEffect, useRef, useState } from "react";
import { useUpload } from "../../context/UploadContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";
import { BadgeInfo, Crop, Loader, Loader2, Trash2 } from "lucide-react";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ImagePagination from "../../components/ImagePagination";

const PreviewPage = () => {
  const { images, setImages } = useUpload();
  const [isClassificationLoading, setIsClassificationLoading] = useState(null);
  const [isClassificationLoadingAll, setIsClassificationLoadingAll] =
    useState(false);
  const [isCropperLoading, setIsCropperLoading] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const selectInputs = [
    {
      name: "Phyllotaxy",
      label: "การเรียงใบ",
      options: [
        { value: "Alternate", label: "เรียงสลับ" },
        { value: "Oppositee", label: "เรียงตรงข้าม" },
        { value: "Whorl", label: "เรียงวงรอบ" },
      ],
    },
    {
      name: "Stem_Type",
      label: "ลักษณะลำต้น",
      options: [
        { value: "Winged_stem", label: "ลำต้นมีสัน" },
        { value: "No_Winged_stem", label: "ลำต้นไม่มีสัน" },
      ],
    },
    {
      name: "Stem_Color",
      label: "สีของลำต้น",
      options: [
        { value: "Purple", label: "สีม่วง" },
        { value: "Green", label: "สีเขียว" },
      ],
    },
    {
      name: "Thorns",
      label: "หนาม",
      options: [
        { value: "Has_Thorns", label: "มีหนาม" },
        { value: "No_Thorns", label: "ไม่มีหนาม" },
      ],
    },
    {
      name: "Aerial_Tuber",
      label: "หัวมันอากาศ",
      options: [
        { value: "Have_aerial_tuber", label: "มีหัวมันอากาศ" },
        { value: "No_aerial_tuber", label: "ไม่มีหัวมันอากาศ" },
      ],
    },
    {
      name: "Petiolar_base_color",
      label: "สีของฐานก้านใบ",
      options: [
        { value: "Purple", label: "สีม่วง" },
        { value: "Green", label: "สีเขียว" },
      ],
    },
    {
      name: "Petiole_color",
      label: "สีของก้านใบ",
      options: [
        { value: "Purple", label: "สีม่วง" },
        { value: "Green", label: "สีเขียว" },
      ],
    },
    {
      name: "Petiole_apex_color",
      label: "สีของปลายก้าน",
      options: [
        { value: "Purple", label: "สีม่วง" },
        { value: "Green", label: "สีเขียว" },
      ],
    },
    {
      name: "Color_leaf_base",
      label: "สีจุดโคนใบ",
      options: [
        { value: "Purple", label: "สีม่วง" },
        { value: "Green", label: "สีเขียว" },
      ],
    },
  ];

  const cropperRef = useRef(null);
  const [currentCropIndex, setCurrentCropIndex] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);

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

  const [formData, setFormData] = useState(
    images.map(() => ({
      userId: authUser._id,
      userName: authUser.name,
      Phyllotaxy: "",
      Stem_Type: "",
      Stem_Color: "",
      Thorns: "",
      Aerial_Tuber: "",
      Petiolar_base_color: "",
      Petiole_color: "",
      Petiole_apex_color: "",
      Color_leaf_base: "",
    }))
  );

  // Call API
  const { mutate: classificationMutate } = useMutation({
    mutationFn: async (classificationData) => {
      return await axiosInstance.post("/upload", classificationData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Send data completed");
      navigate("/history");
      setIsClassificationLoading(false);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong!!");
    },
  });

  // Crop Function
  const startCropping = async (index) => {
    try {
      const image = images[index];
      if (!image?.preview) {
        toast.error("No image available for cropping");
        return;
      }

      // โหลดภาพจาก preview
      const img = new Image();
      img.src = image.preview;

      img.onload = () => {
        setIsCropperLoading(false);
        const padding = 20;

        const canvas = document.createElement("canvas");
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff"; // พื้นหลังขาว
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // วาดภาพไว้ตรงกลาง
        ctx.drawImage(img, padding, padding);

        // แปลงเป็น base64 แล้วเซ็ตให้ Cropper
        const paddedDataUrl = canvas.toDataURL();
        setCropImageSrc(paddedDataUrl);
        setCurrentCropIndex(index);
      };

      img.onerror = () => {
        toast.error("Failed to load image for padding");
      };
    } catch (error) {
      console.error("Error starting crop:", error);
      toast.error("Failed to start cropping");
    }
  };

  // submit Crop
  const applyCropping = async () => {
    if (currentCropIndex === null) return;

    try {
      const cropper = cropperRef.current?.cropper;
      if (!cropper) {
        toast.error("Cropper not initialized");
        return;
      }

      // ได้รูปที่ถูก crop เป็น Data URL
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
        fillColor: "#fff",
      });

      // เพิ่มการตรวจสอบว่าได้ canvas มาแล้ว
      if (!croppedCanvas) {
        toast.error("Failed to get cropped canvas. Please try cropping again.");
        return;
      }

      const croppedBase64 = croppedCanvas.toDataURL();

      const res = await fetch(croppedBase64);
      const blob = await res.blob();
      const file = new File([blob], `cropped-${Date.now()}.png`, {
        type: "image/png",
      });

      const updatedImages = [...images];
      updatedImages[currentCropIndex] = {
        ...updatedImages[currentCropIndex],
        preview: croppedBase64,
        file: file,
      };

      setImages(updatedImages);
      setCurrentCropIndex(null);
      toast.success("Image cropped successfully");
    } catch (error) {
      console.error("Error applying crop:", error);
      toast.error("Failed to crop image");
    }
  };

  // when Change
  const handleChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index][field] = value;
    setFormData(updatedFormData);
  };

  // when submit
  const handleSubmitHITL = async (e, index) => {
    e.preventDefault();

    if (!images[index]?.file) {
      toast.error("No image file found");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to send the data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setIsClassificationLoading(index);

      const payLoad = new FormData();
      payLoad.append("image", images[index].file);
      payLoad.append("userId", formData[index].userId);
      payLoad.append("userName", formData[index].userName);
      payLoad.append("Petiole_color", formData[index].Petiole_color);
      payLoad.append("Aerial_Tuber", formData[index].Aerial_Tuber);
      payLoad.append(
        "Petiolar_base_color",
        formData[index].Petiolar_base_color
      );
      payLoad.append("Petiole_apex_color", formData[index].Petiole_apex_color);
      payLoad.append("Stem_Type", formData[index].Stem_Type);
      payLoad.append("Thorns", formData[index].Thorns);
      payLoad.append("Stem_Color", formData[index].Stem_Color);
      payLoad.append("Phyllotaxy", formData[index].Phyllotaxy);
      payLoad.append("Color_leaf_base", formData[index].Color_leaf_base);

      classificationMutate(payLoad, {
        onSuccess: () => {
          setIsClassificationLoading(null);
          setImages((prev) => prev.filter((_, i) => i !== index));
          setFormData((prev) => prev.filter((_, i) => i !== index));
        },
        onError: () => {
          setIsClassificationLoading(null);
        },
      });
    }
  };

  const handleSubmitAllForm = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("No images to submit");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to send all data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send it all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Create FormData
      const payload = new FormData();

      // Add valid images and metadata
      const validData = images
        .map((image, index) => {
          if (!image?.file) {
            toast.error(`No file found for image at index ${index}`);
            return null;
          }

          return {
            image: image.file,
            metadata: {
              userId: formData[index].userId,
              userName: formData[index].userName,
              Petiole_color: formData[index].Petiole_color,
              Aerial_Tuber: formData[index].Aerial_Tuber,
              Petiolar_base_color: formData[index].Petiolar_base_color,
              Petiole_apex_color: formData[index].Petiole_apex_color,
              Stem_Type: formData[index].Stem_Type,
              Thorns: formData[index].Thorns,
              Stem_Color: formData[index].Stem_Color,
              Phyllotaxy: formData[index].Phyllotaxy,
              Color_leaf_base: formData[index].Color_leaf_base,
            },
          };
        })
        .filter((item) => item !== null);

      if (validData.length === 0) {
        toast.error("No valid data to submit");
        return;
      }

      // Add images to FormData
      validData.forEach((item, index) => {
        payload.append("image", item.image);
      });

      // Add metadata as JSON string
      payload.append(
        "metadata",
        JSON.stringify(validData.map((item) => item.metadata))
      );

      try {
        setTotalCount(validData.length);
        setCompletedCount(0);
        setIsClassificationLoadingAll(true);

        for (let [key, value] of payload.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value);
        }

        const response = await axiosInstance.post("/upload-all", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setCompletedCount(
              Math.floor((percentCompleted * validData.length) / 100)
            );
          },
        });

        if (response.status === 200) {
          toast.success("All forms submitted successfully");
          navigate("/history");
          setImages([]);
          setFormData([]);
        }
      } catch (error) {
        console.error("Error submitting forms:", error);
        toast.error(error.response?.data?.message || "Failed to submit forms");
      } finally {
        setIsClassificationLoadingAll(false);
      }
    }
  };

  // When click delete
  const handleDeleteForm = (index) => {
    if (currentCropIndex === index) {
      setCurrentCropIndex(null);
      setCropImageSrc(null);
    }

    setImages(images.filter((_, i) => i !== index));
    setFormData(formData.filter((_, i) => i !== index));
  };

  if (isClassificationLoadingAll) {
    const percentage = Math.round((completedCount / totalCount) * 100);

    return (
      <div className="flex flex-col items-center justify-center min-h-160 space-y-6">
        {/* Loading Icon */}
        <div className="flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>

        {/* Progress Bar */}
        <div className="w-80 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          <div className="text-xl font-semibold text-gray-800">
            Processing Images...
          </div>
          <div className="text-sm text-gray-600">
            {completedCount} of {totalCount} images completed
          </div>
          <div className="text-lg font-medium text-blue-600">
            {percentage}% Complete
          </div>
        </div>
      </div>
    );
  }

  if (isInfoOpen) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
        <ImagePagination openInfo={() => setIsInfoOpen(false)} />
      </div>
    );
  }

  return (
    <>
      {images.length === 0 ? (
        <div className="flex items-center justify-center min-h-160">
          No Images Selected
        </div>
      ) : (
        <div className="lg:max-w-[1280px] px-4 w-full mx-auto min-h-[40rem] mb-20 flex flex-col">
          <div className="text-center my-8 mt-10">
            <h1 className="text-4xl font-semibold">Human In The Loop (HITL)</h1>
          </div>

          <div className="w-full lg:max-w-4xl mx-auto flex justify-end mb-2">
            <button
              type="button"
              onClick={handleSubmitAllForm}
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:bg-blue-900 tranform hover:-translate-y-0.5 duration-200 cursor-pointer"
            >
              Submit All
            </button>
          </div>

          {images.map((item, index) => (
            <div
              key={index}
              className="w-full lg:max-w-4xl mx-auto px-8 py-12 mt-6 rounded-xl shadow-[0px_0px_30px_-20px_rgba(0,_0,_0,_0.8)] relative"
            >
              {isClassificationLoading === index ? (
                <div className="w-full h-60 flex items-center justify-center ">
                  <Loader className="size-5 animate-spin duration-200" />
                </div>
              ) : (
                <>
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => setIsInfoOpen(true)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200 text-gray-700 ease-in-out hover:-translate-y-0.5 cursor-pointer"
                    >
                      <BadgeInfo className="size-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 w-full mt-4">
                    <div className="flex flex-col items-center justify-center mb-10 md:mb-0 gap-4">
                      {isCropperLoading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <>
                          <img
                            src={item.preview}
                            alt={`preview-${index}`}
                            className="w-[250px] h-auto rounded-xl"
                          />
                          <button
                            onClick={() => {
                              startCropping(index), setIsCropperLoading(true);
                            }}
                            className="text-blue-500 flex items-center transform hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white duration-200 active:bg-blue-700 cursor-pointer px-3 py-2 rounded-xl shadow-xl"
                          >
                            <Crop className="w-4 h-4 mr-1" /> Crop
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {currentCropIndex === index && (
                        <div className="fixed top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-50">
                          <div className="bg-white p-6 rounded-xl w-[90%] max-w-2xl">
                            <Cropper
                              src={cropImageSrc}
                              style={{ height: 400, width: "100%" }}
                              aspectRatio={1}
                              guides={true}
                              ref={cropperRef}
                              viewMode={0}
                              dragMode="none"
                              autoCropArea={0.7}
                              background={false}
                              responsive={true}
                            />

                            <div className="flex justify-end mt-4 gap-2">
                              <button
                                onClick={() => setCurrentCropIndex(null)}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 cursor-pointer transform hover:-translate-y-0.5 duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={applyCropping}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer transform hover:-translate-y-0.5 duration-200"
                              >
                                Crop
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <form
                        onSubmit={(e) => handleSubmitHITL(e, index)}
                        className="w-full flex flex-col gap-4 justify-center"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectInputs.map((input) => (
                            <select
                              key={input.name}
                              value={formData[index][input.name]}
                              onChange={(e) =>
                                handleChange(index, input.name, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-400 focus:border-blue-400 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">-- {input.label} --</option>
                              {input.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ))}
                        </div>

                        <div className="w-full h-full flex justify-center items-center gap-4">
                          <button
                            type="submit"
                            className={`inline-block py-3 w-full rounded-full text-white font-medium text-md cursor-pointer transition-all duration-300 ${
                              isClassificationLoading
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            }`}
                            disabled={isClassificationLoading}
                          >
                            {isClassificationLoading ? (
                              <div className="flex items-center justify-center">
                                <Loader className="size-5 animate-spin duration-200 mr-2" />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              "Submit"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteForm(index)}
                            className="text-white bg-red-500 p-3 rounded-full cursor-pointer hover:bg-red-600 duration-200 transform hover:-translate-y-0.5 active:bg-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PreviewPage;
