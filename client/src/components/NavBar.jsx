import React, { useEffect, useRef, useState } from "react";
import rmutllogo from "/rmutl_logo.png";
import plantlogo from "/plant_logo.png";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, MenuIcon } from "lucide-react";
import "./NavBarCSS.css";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = localStorage.getItem("userRole") === "ADMIN";

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

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onMutate: async () => {
      queryClient.setQueriesData(["authUser"], null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
      localStorage.removeItem("userRole");
      setIsMenuOpen(false);
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Logout failed");
    },
  });

  const handleMenuClickOutside = (event) => {
    if (event.defaultPrevented) return;

    setTimeout(() => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }, 300);
  };

  const handleProfileClickOutside = (event) => {
    if (event.defaultPrevented) return;

    setTimeout(() => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }, 300);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleMenuClickOutside);
    } else {
      document.removeEventListener("mousedown", handleMenuClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleMenuClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleProfileClickOutside);
    } else {
      document.removeEventListener("mousedown", handleProfileClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleProfileClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <nav className="h-25 flex items-center justify-center relative">
      <div className="w-full h-full shadow-md">
        {/* container */}
        <div className="lg:max-w-[1280px] px-4 w-full mx-auto h-full flex justify-center items-center lg:justify-between">
          {/* Logo */}
          {isAdmin ? (
            <Link to="/admin">
              <div className="flex gap-4">
                <img src={rmutllogo} alt="logo" className="w-10 h-18" />
                <img src={plantlogo} alt="logo" className="w-12 h-18" />
              </div>
            </Link>
          ) : (
            <Link to="/">
              <div className="flex gap-4">
                <img src={rmutllogo} alt="logo" className="w-10 h-18" />
                <img src={plantlogo} alt="logo" className="w-12 h-18" />
              </div>
            </Link>
          )}

          {/* Hambergur Menu for responsive web */}
          <button
            className="group absolute right-8 duration-300 px-2 py-2 rounded-full hover:bg-gray-100 active:bg-gray-200 lg:hidden text-gray-700 focus:outline-none cursor-pointer"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <MenuIcon className="size-8" />
          </button>
          {/* Menu */}
          <div
            ref={menuRef}
            className={`
              absolute top-20 right-8 z-50 w-64 bg-white rounded-lg shadow-[0px_0px_10px_-5px_rgba(0,_0,_0,_0.8)] py-4 font-medium text-lg
              transition-all duration-300 ease-in-out transform origin-top-right 
              ${
                isMenuOpen
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-3 scale-95 pointer-events-none"
              }
              lg:static lg:flex lg:flex-row lg:items-center lg:justify-center
              lg:bg-transparent lg:shadow-none lg:opacity-100 lg:translate-y-0 lg:scale-100 lg:pointer-events-auto 
              ${authUser ? "lg:w-auto w-xs" : "lg:w-0"} lg:p-0 
            `}
          >
            {/* Profile (for mobile)*/}
            {authUser && (
              <div className="w-full lg:hidden">
                <div
                  onClick={() => {
                    navigate(`/profile/${authUser._id}`);
                    setIsMenuOpen(false);
                  }}
                  className="flex flex-col gap-2 px-4 items-center justify-center hover:bg-gray-100 py-4 border-b border-gray-500 mb-2 cursor-pointer lg:hidden"
                >
                  <label
                    htmlFor="Profile-info"
                    className="flex flex-col gap-2 "
                  >
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-[2px] bg-gray-600 rounded-full cursor-pointer"
                    >
                      <img
                        src={
                          authUser.profilePic
                            ? `${import.meta.env.VITE_SERVER_URL}/uploads/${
                                authUser.profilePic
                              }`
                            : "/avatar.png"
                        }
                        alt="profile"
                        className="size-15"
                      />
                    </button>
                  </label>
                  <div className="flex gap-2">
                    <h4 className="font-semibold">{authUser.name}</h4>
                    <span>&gt;</span>
                  </div>
                  <p className="font-normal">{authUser.email}</p>
                </div>
              </div>
            )}

            {/* Menu */}
            <ul className="w-full">
              {isAdmin ? (
                <div className="w-full">
                  <div className="w-full flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/admin");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200"
                    >
                      Home
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/admin/history");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200"
                    >
                      Classifier
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/admin/manage-admin");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200"
                    >
                      Manage Users
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/admin/manage-species");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200 mb-2 lg:mb-0"
                    >
                      Manage Species
                    </li>
                  </div>
                </div>
              ) : authUser ? (
                <div className="w-full">
                  <div className="w-full flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200"
                    >
                      Home
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/classification");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200"
                    >
                      Classification
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/preview");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200"
                    >
                      Preview
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/history");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200"
                    >
                      History
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/species");
                      }}
                      className="hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-500 px-4 py-3 cursor-pointer duration-200 mb-2 lg:mb-0"
                    >
                      Species
                    </li>
                  </div>
                </div>
              ) : (
                <div className="w-full]">
                  <div className="w-full flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-[2rem] lg:justify-end">
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/login");
                      }}
                      className="px-4 py-3 cursor-pointer duration-300 hover:bg-gray-100 hover:text-gray-800 lg:hover:text-white hover:text-blue-500 lg:hover:bg-blue-500 lg:active:bg-blue-700 lg:px-4 lg:py-3 lg:shadow-md lg:rounded-lg transition-all ease-in-out lg:hover:-translate-y-1"
                    >
                      Login
                    </li>
                    <li
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/signup");
                      }}
                      className="px-4 py-3 cursor-pointer duration-300 hover:bg-gray-100 hover:text-gray-800 lg:hover:text-white hover:text-blue-500 lg:hover:bg-blue-500 lg:active:bg-blue-700 lg:px-4 lg:py-3 lg:shadow-md lg:rounded-lg transition-all ease-in-out lg:hover:-translate-y-1"
                    >
                      Signup
                    </li>
                  </div>
                </div>
              )}

              {authUser && (
                <li
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full lg:hidden hover:bg-gray-100 px-4 py-3 border-t border-gray-500 cursor-pointer duration-200"
                >
                  <button className="flex items-center gap-4 cursor-pointer">
                    <LogOut className="size-5 text-gray-500" />
                    <span>Logout</span>
                  </button>
                </li>
              )}
            </ul>

            <div className={`hidden lg:block lg:w-52`}>
              {/* User Info and Logout */}
              {authUser && (
                <div className="flex items-center gap-2 mt-4 lg:mt-0">
                  <p className="font-normal">{authUser.name}</p>
                  <div className="p-3 hover:bg-gray-100 rounded-full flex items-center transition-all ease-in-out hover:-translate-y-[1px] duration-300 ">
                    <button
                      onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                      }}
                      className="p-[2px] bg-gray-600 rounded-full cursor-pointer group relative"
                    >
                      <img
                        src={
                          authUser.profilePic
                            ? `${import.meta.env.VITE_SERVER_URL}/uploads/${
                                authUser.profilePic
                              }`
                            : "/avatar.png"
                        }
                        alt="profile"
                        className="size-10 object-cover rounded-full"
                      />

                      {/* Dropdown profile menu */}
                      <div
                        ref={profileRef}
                        className={`
      absolute right-0 top-[60px] z-50 w-52 shadow-[0px_0px_10px_-5px_rgba(0,_0,_0,_0.8)]
      transition-all duration-300 ease-in-out origin-top-right transform
      ${
        isProfileOpen
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }
    `}
                      >
                        <div className="bg-white py-2 rounded-md shadow-lg">
                          <ul className="flex flex-col gap-4 py-2">
                            <li
                              onClick={() => {
                                navigate(`/profile/${authUser._id}`);
                                setIsProfileOpen(false);
                              }}
                              className="hover:bg-gray-100 px-4 py-3 cursor-pointer"
                            >
                              <div className="flex gap-4 items-center">
                                <img
                                  src={
                                    authUser.profilePic
                                      ? `${
                                          import.meta.env.VITE_SERVER_URL
                                        }/uploads/${authUser.profilePic}`
                                      : "/avatar.png"
                                  }
                                  alt="profile"
                                  className="size-8 rounded-full"
                                />
                                <p>View Profile</p>
                              </div>
                            </li>

                            <li
                              onClick={() => {
                                logout();
                                setIsProfileOpen(false);
                              }}
                              className="hover:bg-gray-100 px-4 py-3 cursor-pointer"
                            >
                              <div className="flex items-center gap-4">
                                <LogOut className="size-6 text-gray-500" />
                                <span>Logout</span>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
