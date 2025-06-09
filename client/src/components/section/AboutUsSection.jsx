import React from "react";
import rmutlLogo from "/rmutl_logo.png";
import plantLogo from "/plant_logo.png";
import engineerLogo from "/engineer_logo.png";

const AboutUsSection = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-50 py-10 gap-20">
      {/* Section 1: RMUTL Info */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-6">
        {/* Left: RMUTL Logo */}
        <div className="order-2 lg:order-1 flex justify-center items-center">
          <img
            src={rmutlLogo}
            alt="RMUTL Logo"
            className="w-32 h-auto lg:w-48"
          />
        </div>
        {/* Right: RMUTL Info */}
        <div className="order-1 md:order-2 text-gray-700 text-base lg:text-lg leading-relaxed">
          <h2 className="text-3xl lg:text-4xl font-semibold text-gray-800 mb-6">
            Faculty of Engineering, Rajamangala University of Technology Lanna
          </h2>
          <p>
            The Faculty of Engineering, Department of Computer Engineering,
            focuses on developing technology and innovations that meet the needs
            of society, especially in the field of natural resource
            conservation.
          </p>
        </div>
      </div>

      {/* Section 2: Plant Conservation Project */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-6 lg:px-20 mt-10">
        {/* Left: Project Info */}
        <div className="order-1 text-gray-700 text-base lg:text-lg leading-relaxed">
          <h2 className="text-3xl lg:text-4xl font-semibold text-green-700 mb-6">
            Plant Genetic Conservation Project under the Royal Initiative
          </h2>
          <p>
            The Plant Genetic Conservation Project (RSPG) aims to conserve plant
            genetics to ensure the sustainability of natural resources and
            promote the use of technology for conservation.
          </p>
        </div>
        {/* Right: Plant Logo */}
        <div className="order-2 flex justify-center items-center">
          <img
            src={plantLogo}
            alt="Plant Conservation Logo"
            className="w-42 h-auto lg:w-48"
          />
        </div>
      </div>

      {/* Section 3: About the Project */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-6 lg:px-20 mt-10">
        {/* Left: Project Images */}
        <div className="order-2 lg:order-1 flex justify-center items-center ">
          <img
            src={engineerLogo}
            alt="ENGINEER Logo"
            className="w-32 h-auto lg:w-52"
          />

        </div>
        {/* Right: Project Info */}
        <div className="order-1 md:order-2 text-gray-700 text-base lg:text-lg leading-relaxed">
          <h2 className="text-3xl lg:text-4xl font-semibold text-blue-600 mb-6">
            About the Project
          </h2>
          <p>
            This project is a collaboration between the Faculty of Engineering
            and the Plant Genetic Conservation Project (RSPG) to develop
            technology that supports conservation and raises awareness about the
            importance of natural resources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsSection;
