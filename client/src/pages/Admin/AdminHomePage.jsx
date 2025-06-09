import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  LabelList,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { all } from "axios";

const AdminHomePage = () => {
  const [usersData, setUsersData] = useState([]);
  const [speciesData, setSpeciesData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [historyStatData, setHistoryStatData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("day");

  // -------------------- Chart Data Start -----------------------

  const userRoleData = [
    {
      name: "USER",
      value: usersData.totalRoleUser,
    },
    {
      name: "ADMIN",
      value: usersData.totalRoleAdmin,
    },
  ];

  const COLORS = {
    USER: "#6366f1",
    ADMIN: "#f59e0b",
  };

  // -------------------- Chart Data End -----------------------

  const { data: allHistoryData, isLoading: dataHistoryLoading } = useQuery({
    queryKey: ["getAllHostory"],
    queryFn: async () => {
      const res = await axiosInstance.get("/history/get-history");
      return res.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to get histories");
    },
  });

  const {
    data: allUsersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useQuery({
    queryKey: ["getAllUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/allclient");
      return res.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to get users");
    },
  });

  const {
    data: allSpeciesData,
    isLoading: isSpeciesLoading,
    isError: isSpeciesError,
  } = useQuery({
    queryKey: ["getAllSpecies"],
    queryFn: async () => {
      const res = await axiosInstance.get("/species/all");
      return res.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to get species");
    },
  });

  const { data: historiesStat, isLoading: infoLoading } = useQuery({
    queryKey: ["historiesStat", selectedRange],
    queryFn: async () => {
      const res = await axiosInstance("/history/stat", {
        params: {
          range: selectedRange,
        }
      });
      return res.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to get species");
    },
  });

  useEffect(() => {
    if (allUsersData) {
      setUsersData(allUsersData);
    }
    if (allSpeciesData) {
      setSpeciesData(allSpeciesData.species);
    }
    if (allHistoryData) {
      setHistoryData(allHistoryData);
    }
    if (historiesStat) {
      setHistoryStatData(historiesStat.data);
    }
  }, [allUsersData, allSpeciesData, allHistoryData, historiesStat]);

  if (dataHistoryLoading || isUsersLoading || isSpeciesLoading || infoLoading) {
    return (
      <div className="w-full min-h-160 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  console.log("History Stat Data:", historyStatData);

  return (
    <div className="min-h-screen p-6">
      {/* Page Header */}
      <header className="flex flex-col items-center mt-2 mb-10">
        <h1 className="text-3xl font-bold text-indigo-800">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage users, species data, and view dashboard analytics.
        </p>
      </header>

      {/* Dashboard Analysis */}
      <div className="max-w-5xl w-full mx-auto">
        {/* Stats Cards */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
              <h3 className="text-lg font-medium text-indigo-800 mb-2">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-indigo-900">
                {usersData.totalRoleUser}
              </p>
            </div>

            <div className="bg-amber-50 p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
              <h3 className="text-lg font-medium text-amber-800 mb-2">
                Total Admins
              </h3>
              <p className="text-3xl font-bold text-amber-900">
                {usersData.totalRoleAdmin}
              </p>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
              <h3 className="text-lg font-medium text-emerald-800 mb-2">
                Total Species
              </h3>
              <p className="text-3xl font-bold text-emerald-900">
                {speciesData.length}
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg font-medium text-purple-800 mb-2">
                Total Classifications
              </h3>
              <p className="text-3xl font-bold text-purple-900">
                {historyData.totalHistories}
              </p>
            </div>
          </div>
        </div>

        {/* User Role Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            User Role Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userRoleData}
                margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={true}
                  vertical={false}
                />

                <XAxis
                  type="number"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                  width={80}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                  cursor={{ fill: "rgba(79, 70, 229, 0.1)" }}
                  formatter={(value) => [`${value}`, "Count"]}
                />

                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "13px",
                  }}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ color: "#4b5563", marginLeft: "4px" }}>
                      {value}
                    </span>
                  )}
                />

                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || "#4f46e5"}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  ))}
                </Bar>

                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value) => `${value}`}
                  style={{
                    fill: "#6b7280",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistics Classifier Line Chart */}
        <div className="bg-white p-6 min-h-120 rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Statistics Classifier
            </h3>
            <div className="flex space-x-2 mb-4">
              {["day", "week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-4 py-2 rounded ${
                    selectedRange === range
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1 hover:bg-gray-400"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={historyStatData.map((state) => ({
                  date: new Date(state.updatedAt).toISOString(),
                  classification: state.totalHistories,
                }))}
                margin={{ top: 25, right: 30, left: 30, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  label={{
                    value: "Last Modified",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#6b7280",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "#d1d5db" }}
                />

                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  label={{
                    value: "Total Classifications",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#6b7280",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "#d1d5db" }}
                  domain={[0, (dataMax) => dataMax * 2]}
                />

                <Tooltip
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  formatter={(value) => [`${value} classifications`, "Total"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "white",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="classification"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: "#4f46e5", strokeWidth: 1 }}
                  activeDot={{
                    fill: "#ffffff",
                    stroke: "#4f46e5",
                    strokeWidth: 1,
                    r: 6,
                  }}
                  animationDuration={500}
                />

                <ReferenceLine y={0} stroke="#e5e7eb" />

                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => (
                    <span style={{ color: "#4b5563" }}>{value}</span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Classifier */}
          <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-indigo-500 hover:shadow-xl transition-all">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Species Classifier
            </h2>
            <p className="text-gray-600 mb-4">
              View and export data classifier
            </p>
            <Link
              to="/admin/history"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-block transition-all w-full text-center tranform hover:-translate-y-1 duraiton-200 ease-in-out"
            >
              Go to Classifier
            </Link>
          </div>

          {/* Manage Users */}
          <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500 hover:shadow-xl transition-all">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Manage Users
            </h2>
            <p className="text-gray-600 mb-4">
              View, edit, or delete user accounts.
            </p>
            <Link
              to="/admin/manage-admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block transition-all w-full text-center tranform hover:-translate-y-1 duraiton-200 ease-in-out"
            >
              Go to User Management
            </Link>
          </div>

          {/* Manage Species */}
          <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-emerald-500 hover:shadow-xl transition-all">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Manage Species
            </h2>
            <p className="text-gray-600 mb-4">
              Add, edit, or delete species information.
            </p>
            <Link
              to="/admin/manage-species"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg inline-block transition-all w-full text-center tranform hover:-translate-y-1 duraiton-200 ease-in-out"
            >
              Go to Species Management
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
