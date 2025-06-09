import React from "react";

const PredictedFilter = ({
  predicted,
  filterPredicted,
  setFilterPredicted,
}) => {
  const handleCheckboxChange = (value) => {
    if (filterPredicted.includes(value)) {
      setFilterPredicted(filterPredicted.filter((item) => item !== value));
    } else {
      setFilterPredicted([...filterPredicted, value]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {predicted.map((species) => (
        <div key={species} className="flex items-center hover:bg-gray-100 py-1 px-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterPredicted.includes(species)}
              value={species}
              onChange={() => handleCheckboxChange(species)}
              className="w-4 h-4"
            />
            <span className="text-gray-700 cursor-pointer">{species}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default PredictedFilter;
