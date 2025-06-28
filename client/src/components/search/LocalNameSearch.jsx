import React, { useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const LocalNameSearch = ({ onLocalNameSelected }) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebounvedValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const localNameRef = useRef(null);

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

  const { data: localNames = [], isLoading } = useQuery({
    queryKey: ["searchLocalName", debouncedValue],
    queryFn: async () => {
      const res = await axiosInstance.get("/species/allbyquery", {
        params: {
          local_Name: debouncedValue,
        },
      });
      return res.data?.species || [];
    },
    enabled: (debouncedValue ?? "").length > 0,
    onError: (error) => {
      toast.success(error.response?.data?.message || "User not found");
    },
  });

  const handleSelectedLocalName = (localName) => {
    setInputValue(localName);
    onLocalNameSelected(localName);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        localNameRef.current &&
        !localNameRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={localNameRef} className="relative w-64">
      <input
        type="text"
        value={inputValue}
        placeholder="Search local name..."
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

      {debouncedValue && localNames.length > 0 && isDropdownOpen && (
        <ul className="absolute top-12 w-full bg-white shadow rounded-md max-h-48 overflow-y-auto z-10">
          {localNames.map((local) => (
            <li
              key={local._id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleSelectedLocalName(local.localName);
                setIsDropdownOpen(false);
              }}
            >
              {local.localName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocalNameSearch;
