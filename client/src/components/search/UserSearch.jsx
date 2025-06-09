import React, { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const UserSearch = ({ onUserSelected }) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebounvedValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userRef = useRef(null);

  const debouncedSearch = useMemo(() =>
    debounce((value) => {
      setDebounvedValue(value);
    }, 500)
  );

  useEffect(() => {
    debouncedSearch(inputValue);
    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["searchUsers", debouncedValue],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/allclient", {
        params: { name: debouncedValue },
      });
      return res.data?.users || [];
    },
    enabled: (debouncedValue ?? "").length > 0,
    onError: (error) => {
      toast.success(error.response?.data?.message || "User not found");
    },
  });

  const handleSelectedUser = (user) => {
    setInputValue(user);
    onUserSelected(user);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={userRef} className="relative w-64">
      <input
        type="text"
        value={inputValue}
        placeholder="Search user..."
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsDropdownOpen(true);
        }}
        className="border px-3 py-2 rounded-md w-full"
      />

      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
        </div>
      )}

      {debouncedValue && users.length > 0 && isDropdownOpen && (
        <ul className="absolute top-12 w-full bg-white shadow rounded-md max-h-48 overflow-y-auto z-10">
          {users.map((user) => (
            <li
              key={user._id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleSelectedUser(user.name);
                setIsDropdownOpen(false);
              }}
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;
