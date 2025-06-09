import React from "react";
import AddSpeciesForm from "../../components/species/AddSpeciesForm";
import { Link } from "react-router-dom";

const AddSpeciePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 my-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-600">Add New Species</h1>
        <p className="text-gray-600">
          Fill out the form below to add a new species
        </p>
      </header>
      <div className="w-full max-w-2xl bg-white shadow-[0px_0px_30px_-16px_rgba(0,_0,_0,_0.8)] rounded-lg p-6 mb-10">
        <div className="w-full flex justify-end">
          <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 cursor-pointer duration-300 transitaion-all ease-in-out hover:-translate-y-1">
            <div
              onClick={() => history.back()}
              className="flex items-center gap-2"
            >
              <p>&larr;</p>
              <span>Go Back</span>
            </div>
          </button>
        </div>
        <AddSpeciesForm />
      </div>
    </div>
  );
};

export default AddSpeciePage;
