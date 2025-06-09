import React from "react";
import InputImg from "../InputImg";
import AboutUsSection from "./AboutUsSection";

const HomePageSection = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[30rem] items-center w-full">
        {/* Text Content Section */}
        <div className="w-full px-6 py-12 lg:px-12 lg:py-0 flex flex-col justify-center items-center lg:items-start gap-6">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 text-center lg:text-left">
            Local Yam Variety{" "}
            <span className="block md:inline text-blue-500 mt-4">
              Classification System
            </span>
          </h1>
          <p className="text-xl lg:text-2xl font-medium text-gray-600 text-center lg:text-left max-w-lg">
            Advanced identification using{" "}
            <span className="text-blue-500">
              Image Processing & Machine Learning
            </span>
          </p>
        </div>

        {/* Image Input Section */}
        <div className="flex items-center justify-center h-full p-8 lg:p-12 ">
          <div className="w-full max-w-md h-full flex flex-col justify-center items-center">
            <InputImg />
          </div>
        </div>
      </div>
      {/* About Us Section */}
      <AboutUsSection />


      <div className="w-full flex justify-center my-10" >
        <InputImg />
      </div>
    </>
  );
};

export default HomePageSection;
