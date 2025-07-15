import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";
import UserSearch from "../../components/search/UserSearch";
import Predictedfilter from "../../components/filter/Predictedfilter";
import { Eye, MapPin, X } from "lucide-react";

const HistoryAdminPage = () => {
  const [allClassifier, setAllClassifier] = useState([]);
  const [Classifier, setClassifier] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [allFilter, setAllfilter] = useState([]);
  const [filterSpecies, setFilterSpecies] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedHistories, setSelectedHistories] = useState([]);
  const [showSelectedData, setShowSelectedData] = useState([]);
  const [historySelectedAction, setHistorySelectedAction] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [showSelctedSideBar, setshowSelectedSideBar] = useState(false);
  const [isOpenInfo, setIsOpenInfo] = useState(false);
  const [selectedClassifier, setSelectedClassifier] = useState(null);

  const { data: getAllClassifier } = useQuery({
    queryKey: [
      "getAllClassifier",
      { name: selectedUser, species: filterSpecies.toString(), currentPage },
    ],
    queryFn: async () => {
      const res = await axiosInstance.get("/history/get-history", {
        params: {
          name: selectedUser,
          species: filterSpecies.toString(),
          page: currentPage,
        },
      });
      return res.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to get histories");
    },
  });

  const { data: getFilterSpecies } = useQuery({
    queryKey: ["getAllFilter"],
    queryFn: async () => {
      const res = await axiosInstance.get("/species/all");
      return res.data;
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response?.data?.message);
    },
  });

  const parseExifDate = (exifString) => {
    if (!exifString || typeof exifString !== "string") {
      return null;
    }

    // ถ้า string มี format EXIF จริง ๆ แบบ "YYYY:MM:DD HH:MM:SS"
    if (exifString.includes(" ")) {
      const [datePart, timePart] = exifString.split(" ");
      if (datePart.includes(":")) {
        try {
          const [year, month, day] = datePart.split(":");
          const [hours, minutes, seconds] = timePart.split(":");
          return new Date(year, month - 1, day, hours, minutes, seconds);
        } catch (error) {
          console.error("Invalid EXIF date format:", exifString, error);
          return null;
        }
      }
    }

    // ถ้าไม่ใช่ format EXIF ก็ลองแปลงเป็น Date ปกติ
    const parsedDate = new Date(exifString);
    return isNaN(parsedDate) ? null : parsedDate;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const handleCheckBoxSelecedHistoryChange = (id) => {
    setSelectedHistories((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const handleExportPDF = () => {
    localStorage.setItem("historySelected", JSON.stringify(selectedHistories));
    window.open("/preview-report", "_blank");
  };

  useEffect(() => {
    if (getFilterSpecies) {
      setFilterData(getFilterSpecies.species);
    }
  }, [getFilterSpecies]);

  useEffect(() => {
    if (getAllClassifier?.histories) {
      setAllClassifier(getAllClassifier.histories);
      setClassifier(getAllClassifier);
    }

    if (filterData && filterData.length > 0) {
      const predictedValue = filterData.map((item) => item.scientificName);
      const uniquePredicted = [...new Set(predictedValue)];

      setAllfilter(uniquePredicted);
    }
  }, [getAllClassifier, filterData]);

  return (
    <div className="min-h-160 p-6 flex flex-col justify-center items-center">
      <header className="text-center flex flex-col gap-2 mt-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl  font-bold text-amber-600">
          Species Classifier
        </h1>
        <p className="text-gray-600">View and export data classifier</p>
      </header>

      {/* container */}
      <div className="flex justify-center w-full max-w-7xl mx-auto mt-6 mb-20 gap-4">
        <div className="bg-white shadow-md rounded-lg p-6 w-full">
          {/* Filter */}
          <nav className="flex flex-col sm:flex-row gap-4 justify-end items-center mb-4">
            <UserSearch
              onUserSelected={(name) => {
                setSelectedUser(name);
              }}
            />
            <button
              onClick={() => {
                setShowFilterSidebar(!showFilterSidebar);
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer duration-200"
            >
              Filter
            </button>
            <button
              onClick={() => {
                setshowSelectedSideBar(!showSelctedSideBar);
                setHistorySelectedAction(!historySelectedAction);
              }}
              className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 cursor-pointer duration-200"
            >
              Export
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer duration-200"
            >
              Reset
            </button>
          </nav>

          {/* Table */}
          {!allClassifier || allClassifier.length === 0 ? (
            <div className="w-full flex items-center justify-center my-10">
              <p className="text-md text-red-500">No history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-center">
                  <tr className="hover:bg-gray-100 border-b-2 font-medium text-gray-700 border-gray-300">
                    <td className="px-4 py-2 w-[10%]">Name</td>
                    <td className="px-4 py-2 w-[20%]">Image</td>
                    <td className="px-4 py-2 w-[15%]">Predicted</td>
                    <td className="px-4 py-2 w-[5%]">Confidence</td>
                    <td className="px-4 py-2 w-[20%]">Top 5</td>
                    <td className="px-4 py-2 w-[10%]">Process Time</td>
                    <td className="px-4 py-2 w-[10%]">Date Time</td>
                    <td className="text-center px-4 py-2 w-[5%]">Actions</td>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {allClassifier
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((classifier, index) => {
                      const isSelected = selectedHistories.includes(
                        classifier._id
                      );

                      return (
                        <tr
                          key={classifier._id}
                          onClick={() => {
                            if (historySelectedAction) {
                              setShowSelectedData((prev) => {
                                return isSelected
                                  ? prev.filter(
                                      (item) => item._id !== classifier._id
                                    )
                                  : [...prev, classifier];
                              });
                              handleCheckBoxSelecedHistoryChange(
                                classifier._id
                              );
                            }
                          }}
                          className={`hover:bg-gray-100 text-gray-600  ${
                            index !== allClassifier.length - 1
                              ? "border-b border-gray-300 "
                              : ""
                          }`}
                        >
                          <td className="px-4 py-4">{classifier.userName}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center items-center w-full h-50">
                              {classifier.imageUrl ? (
                                <img
                                  src={`${
                                    import.meta.env.VITE_SERVER_URL
                                  }/uploads/${classifier.imageUrl}`}
                                  alt={classifier.bestpredicted}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <p>No Image</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {classifier.bestpredicted}
                          </td>
                          <td className="px-4 py-4">
                            {classifier.confidenceScore.toFixed(2)}%
                          </td>
                          <td className="px-4 py-4">
                            {classifier.allpredicted
                              .sort((a, b) => b.probability - a.probability)
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div key={idx} className="mb-2 text-start">
                                  {item.class} ({item.probability}%)
                                </div>
                              ))}
                          </td>
                          <td className="px-4 py-4">
                            {classifier.process_time > 1000
                              ? `${(classifier.process_time / 1000).toFixed(
                                  2
                                )} s`
                              : `${classifier.process_time} ms`}
                          </td>
                          <td className="px-4 py-4">
                            <p>
                              {(() => {
                                const exifDate = parseExifDate(
                                  classifier.datetime_taken
                                );
                                const createdDate = classifier.createdAt
                                  ? new Date(classifier.createdAt)
                                  : null;
                                const dateToShow = exifDate ?? createdDate;
                                return dateToShow
                                  ? dateToShow.toLocaleString("en-EN", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-";
                              })()}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                              {historySelectedAction ? (
                                <div
                                  className="flex justify-center items-center gap-2"
                                  onClick={(e) => e.stopPropagation()} // ป้องกัน trigger แถว
                                >
                                  <input
                                    type="checkbox"
                                    name={`selected-${classifier._id}`}
                                    checked={isSelected}
                                    onChange={() => {
                                      setShowSelectedData((prev) => {
                                        return isSelected
                                          ? prev.filter(
                                              (item) =>
                                                item._id !== classifier._id
                                            )
                                          : [...prev, classifier];
                                      });
                                      handleCheckBoxSelecedHistoryChange(
                                        classifier._id
                                      );
                                    }}
                                    className="size-5 cursor-pointer"
                                  />
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedClassifier(classifier);
                                      setIsOpenInfo(true);
                                    }}
                                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-700 duration-200 cursor-pointer transition-all ease-in-out hover:-translate-y-1"
                                  >
                                    <Eye className="size-5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenMap(
                                        classifier.latitude,
                                        classifier.longitude
                                      );
                                    }}
                                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 duration-200 cursor-pointer transition-all ease-in-out hover:-translate-y-1"
                                  >
                                    <MapPin className="size-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          <footer>
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-gray-600">
                  Showing{" "}
                  <span className="font-medium">{allClassifier.length}</span>{" "}
                  out of{" "}
                  <span className="font-medium">
                    {Classifier.totalHistories}
                  </span>{" "}
                  entries
                </p>
              </div>
              <div className="flex gap-2">
                <Pagination
                  totalPages={Classifier.totalPages}
                  currentPage={Classifier.page}
                  handlePageChange={handlePageChange}
                />
              </div>
            </div>
          </footer>
        </div>

        {/* Filter */}
        <div className="flex flex-col space-y-4">
          {showFilterSidebar && (
            <div className="bg-white shadow-md rounded-lg p-6 h-content w-60">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-amber-600 font-semibold">
                  Filter By Species
                </h2>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-gray-800 hover:text-red-500 py-1 px-2 rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300"
                >
                  ✕
                </button>
              </div>
              <Predictedfilter
                predicted={allFilter}
                filterPredicted={filterSpecies}
                setFilterPredicted={setFilterSpecies}
              />
            </div>
          )}
          {showSelctedSideBar && (
            <div className="bg-white shadow-md rounded-lg p-6 h-content w-60">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-amber-800 font-semibold">
                  Selected species
                </h2>
                <button
                  onClick={() => {
                    setshowSelectedSideBar(false);
                    setHistorySelectedAction(false);
                  }}
                  className="text-gray-800 hover:text-red-500 py-1 px-2 rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                {showSelectedData.length > 0 ? (
                  showSelectedData.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="bg-gray-50 p-2 rounded-md border border-gray-200"
                    >
                      <p className="text-sm text-gray-700 font-medium">
                        {index + 1}. {item.bestpredicted}
                      </p>
                      <p className="text-xs text-gray-600">
                        ชื่อ: {item.userName}
                      </p>
                      <p className="text-xs text-gray-600">
                        ความมั่นใจ: {item.confidenceScore}%
                      </p>
                      <p className="text-xs text-gray-600">
                        วันที่:{" "}
                        {new Date(item.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    ยังไม่มีรายการที่เลือก
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-sm cursor-pointer transition-all duration-200"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    setSelectedHistories([]);
                    setShowSelectedData([]);
                  }}
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded-sm cursor-pointer transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {isOpenInfo && selectedClassifier && (
            <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50 p-4">
              {/* Main Card */}
              <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header Section */}
                <div className="sticky top-0 bg-white z-10 p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-amber-600">
                    Classification Details
                  </h2>
                  <button
                    onClick={() => {
                      setIsOpenInfo(false);
                      setSelectedClassifier(null);
                    }}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[35%_30%_30%] gap-8">
                    {/* Left Column - Image Preview */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}/uploads/${
                            selectedClassifier.imageUrl
                          }`}
                          alt={selectedClassifier.bestpredicted}
                          className="w-full h-auto max-h-[400px] object-contain"
                        />
                      </div>

                      {/* Image Metadata */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="font-semibold text-lg text-gray-800">
                          Image Infomation
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Username</p>
                            <p>{selectedClassifier.userName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Date</p>
                            <p>
                              {parseExifDate(
                                selectedClassifier.datetime_taken
                              )?.toLocaleString() ||
                                new Date(
                                  selectedClassifier.createdAt
                                ).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Process time</p>
                            <p>
                              {selectedClassifier.process_time > 1000
                                ? `${(
                                    selectedClassifier.process_time / 1000
                                  ).toFixed(2)} sec`
                                : `${selectedClassifier.process_time} ms`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location (Conditional) */}
                      {selectedClassifier.latitude &&
                        selectedClassifier.longitude && (
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <h3 className="font-semibold text-lg p-4 bg-gray-50">
                              Location
                            </h3>
                            <div className="p-4 flex justify-between items-center">
                              <div>
                                <p className="text-gray-600">
                                  Latitude: {selectedClassifier.latitude}
                                </p>
                                <p className="text-gray-600">
                                  Longitude: {selectedClassifier.longitude}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleOpenMap(
                                    selectedClassifier.latitude,
                                    selectedClassifier.longitude
                                  )
                                }
                                className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all duraiton-200 cursor-pointer "
                              >
                                <MapPin className="w-5 h-5" />
                                Google Maps
                              </button>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Middle Column - Prediction Results */}
                    <div className="space-y-6">
                      {/* Best Prediction Card */}
                      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                        <h3 className="font-semibold text-lg text-amber-600 mb-3">
                          Best Prediction
                        </h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-indigo-700">
                              {selectedClassifier.bestpredicted}
                            </p>
                            <p className="text-indigo-600">
                              Confidence:{" "}
                              {selectedClassifier.confidenceScore.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* All Predictions */}
                      <div className="bg-white rounded-lg overflow-hidden">
                        <h3 className="font-semibold text-lg p-4 bg-gray-50">
                          All Prediction
                        </h3>
                        <div className="">
                          {selectedClassifier.allpredicted
                            .sort((a, b) => b.probability - a.probability)
                            .map((prediction, idx) => (
                              <div
                                key={idx}
                                className={`flex justify-between items-center p-3 ${
                                  idx < 3 ? "bg-blue-50" : "bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    {idx + 1}.
                                  </span>
                                  <span>{prediction.class}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    {prediction.probability.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Filter Prediction Results */}
                    <div className="space-y-6">
                      {/* Best Prediction Card */}
                      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                        <h3 className="font-semibold text-lg text-amber-600 mb-3">
                          Best Filter Prediction
                        </h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-indigo-700">
                              {selectedClassifier.bestfilterpredicted}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* All Predictions */}
                      <div className="bg-white rounded-lg overflow-hidden">
                        <h3 className="font-semibold text-lg p-4 bg-gray-50">
                          All Filter Prediction
                        </h3>
                        <div className="">
                          {selectedClassifier.allfilterpredicted.map(
                            (prediction, idx) => (
                              <div
                                key={idx}
                                className={`flex justify-between items-center p-3 ${
                                  idx < 3 ? "bg-blue-50" : "bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    {idx + 1}.
                                  </span>
                                  <span>{prediction.class}</span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryAdminPage;
