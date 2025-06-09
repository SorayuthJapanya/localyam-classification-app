import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-500 text-white p-6 mt-auto">
      <div className="text-center white">
        <p>
          &copy; {new Date().getFullYear()} Development of a Local Yam Variety
          Classification System from Leaf Images Using Convolutional Neural
          Networks
        </p>
      </div>
    </footer>
  );
};

export default Footer;
