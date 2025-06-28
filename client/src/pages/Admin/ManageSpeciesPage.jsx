import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Edit, Trash2, Search, Eye, X } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import LocalNameSearch from "../../components/search/LocalNameSearch";

const ManageSpeciesPage = () => {
  const [speciesData, setSpeciesData] = useState([]);
  const [speciesPages, setSpeciesPages] = useState(1);
  const [selectedLocalName, setSelectedLocalName] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const role = localStorage.getItem("userRole");

  const navigate = useNavigate();

  // Fetch species data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "getAllSpecies",
      { local_Name: selectedLocalName, currentPage, role },
    ],
    queryFn: async () => {
      const res = await axiosInstance.get("/species/allbyquery", {
        params: {
          local_Name: selectedLocalName,
          page: currentPage,
          role: role,
        },
      });
      return res.data;
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to fetch species data"
      );
    },
  });

  // Mutation for deleting a species
  const { mutate: deleteSpecies } = useMutation({
    mutationFn: (speciesId) => axiosInstance.delete(`/species/${speciesId}`),
    onSuccess: () => {
      toast.success("Species deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete species");
    },
  });

  // Handle delete action
  const handleDelete = async (speciesId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this species?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      deleteSpecies(speciesId);
    }
  };

  const handleEdit = (speciesId) => {
    navigate(`/admin/edit-species/${speciesId}`);
  };

  const handleViewSpecies = (speciesId) => {
    navigate(`/specie/${speciesId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (data) {
      setSpeciesData(data.species);
      setSpeciesPages(data);
    }
  }, [data]);

  return (
    <div className="min-h-160 p-6 flex flex-col items-center">
      <header className="text-center flex flex-col gap-4 mt-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600">
          Manage Species
        </h1>
        <p className="text-gray-600">View and manage species data</p>
      </header>

      <div className="flex flex-col justify-center items-center w-full max-w-7xl mx-auto mt-6 mb-20">
        {isLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error.message}</p>
        ) : speciesPages.length === 0 ? (
          <p className="text-gray-600">No species found</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 w-full">
            <nav className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
              <div className="flex items-center gap-2 relative">
                <LocalNameSearch
                  onLocalNameSelected={(localName) => {
                    setSelectedLocalName(localName);
                    setIsSearch(true);
                  }}
                />
                {isSearch && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer active:bg-green-900 duration-200"
                    onClick={() => window.location.reload()}
                  >
                    Reset
                  </button>
                )}
              </div>
              <Link to={"/admin/add-species"}>
                <button
                  type="button"
                  className="text-end px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 cursor-pointer duration-300 transitaion-all ease-in-out hover:-translate-y-1"
                >
                  Add New Species
                </button>
              </Link>
            </nav>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="hover:bg-gray-100 border-b-2 font-medium text-gray-700 border-gray-300 text-center">
                    <td className="px-4 py-2">#</td>
                    <td className="px-4 py-2">Image</td>
                    <td className="px-4 py-2">Common Name</td>
                    <td className="px-4 py-2">Local Name</td>
                    <td className="px-4 py-2">Scientific Name</td>
                    <td className="px-4 py-2">Family Name</td>
                    <td className="px-4 py-2">Created At</td>
                    <td className="px-4 py-2">Actions</td>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {speciesData
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((species, index) => (
                      <tr
                        key={species._id}
                        className={`hover:bg-gray-100 text-gray-600 ${
                          index !== speciesData.length - 1
                            ? "border-b border-gray-300"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4 flex items-center justify-center">
                          {species.imageUrl ? (
                            <img
                              src={`${
                                import.meta.env.VITE_SERVER_URL
                              }/uploads/${species.imageUrl}`}
                              alt={species.commonName}
                              className="size-30 object-cover rounded-md"
                            />
                          ) : (
                            <p>No Image</p>
                          )}
                        </td>
                        <td className="px-4 py-4">{species.commonName}</td>
                        <td className="px-4 py-4">{species.localName}</td>
                        <td className="px-4 py-4">{species.scientificName}</td>
                        <td className="px-4 py-4">{species.familyName}</td>
                        <td className="px-4 py-4">
                          {format(new Date(species.createdAt), "dd MMM yyyy")}
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-full h-full flex gap-2 items-center justify-center">
                            <button className="bg-blue-500 text-white px-2 py-2 rounded-full hover:bg-blue-700 cursor-pointer duration-300 transitaion-all ease-in-out hover:-translate-y-0.5">
                              <Eye
                                onClick={() => handleViewSpecies(species._id)}
                                className="size-5"
                              />
                            </button>
                            <button className="bg-green-600 text-white px-2 py-2 rounded-full hover:bg-green-700 cursor-pointer duration-300 transitaion-all ease-in-out hover:-translate-y-0.5">
                              <Edit
                                onClick={() => handleEdit(species._id)}
                                className="size-5"
                              />
                            </button>
                            <button
                              onClick={() => handleDelete(species._id)}
                              className="bg-red-500 text-white px-2 py-2 rounded-full hover:bg-red-700 cursor-pointer duration-300 transitaion-all ease-in-out hover:-translate-y-0.5"
                            >
                              <Trash2 className="size-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <footer>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {speciesPages?.species?.length ?? 0}
                    </span>{" "}
                    out of{" "}
                    <span className="font-medium">
                      {speciesPages?.totalSpecies ?? 0}
                    </span>{" "}
                    entries
                  </p>
                </div>
                <Pagination
                  totalPages={speciesPages.totalPages}
                  currentPage={speciesPages.currentPage}
                  handlePageChange={handlePageChange}
                />
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSpeciesPage;
