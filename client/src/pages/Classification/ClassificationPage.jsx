import React from "react";
import HeroClassification from "../../components/classification/HeroClassification";

const ClassificationPage = () => {
  return (
    <div className="lg:max-w-[1280px] px-4 w-full mx-auto min-h-full my-auto flex flex-col items-center justify-center ">
      <HeroClassification />
    </div>
  );
};

export default ClassificationPage;
