import React from "react";
import InputImg from "../InputImg";

const HeroClassification = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40rem] ">
      {/* Text Content Section */}
      <div className="w-full px-6 py-12 lg:px-12 lg:py-0 flex flex-col items-center lg:items-start">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 text-center lg:text-left">
          Get Your Images{" "}
          <span className="block md:inline mt-3 px-8 py-2 rounded-full font-normal text-white bg-gradient-to-r from-blue-400 to-blue-700">
            For Classification
          </span>
        </h1>
      </div>

      {/* Image Input Section */}
      <div className="flex items-center justify-center w-full p-8 lg:p-12">
        <div className="w-full max-w-md flex flex-col items-center mt-2 md:mt-10">
          <InputImg />
        </div>
      </div>
    </div>
  );
};

export default HeroClassification;
