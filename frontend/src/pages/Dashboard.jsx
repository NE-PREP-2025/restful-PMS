"use client"

import { useState, useEffect } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { getSlotRequests, getUsers, getVehicles, getParkingSlots } from "../utils/api"

ChartJS.register(ArcElement, Tooltip, Legend)

const Dashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalUsers: 0,
    totalVehicles: 0,
    totalSlots: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError("")
      try {
        const [requestsRes, usersRes, vehiclesRes, slotsRes] = await Promise.all([
          getSlotRequests(1, 1000, ""),
          getUsers(1, 1000, ""),
          getVehicles(1, 1000, ""),
          getParkingSlots(1, 1000, ""),
        ])

        const requests = requestsRes.data.data
        const pending = requests.filter((r) => r.request_status === "pending").length
        const approved = requests.filter((r) => r.request_status === "approved").length
        const rejected = requests.filter((r) => r.request_status === "rejected").length

        setStats({
          pending,
          approved,
          rejected,
          totalUsers: usersRes.data.meta.totalItems,
          totalVehicles: vehiclesRes.data.meta.totalItems,
          totalSlots: slotsRes.data.meta.totalItems,
        })
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch stats")
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  const pieData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: ["#3B82F6", "#10B981", "#EF4444"],
        borderColor: ["#2563EB", "#059669", "#DC2626"],
        borderWidth: 1,
      },
    ],
  }

  // Stat card data with icons
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      color: "bg-blue-600",
      icon: (
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
      ),
    },
    {
      label: "Total Vehicles",
      value: stats.totalVehicles,
      color: "bg-blue-700",
      icon: (
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
      ),
    },
    {
      label: "Total Slots",
      value: stats.totalSlots,
      color: "bg-blue-800",
      icon: (
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
      ),
    },
    {
      label: "Pending Requests",
      value: stats.pending,
      color: "bg-blue-500",
      icon: (
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
      ),
    },
  ]

  return (
      <div className="container mx-auto p-6 bg-white min-h-screen">
        <div className="flex items-center mb-6">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h1 className="text-3xl font-bold text-blue-800">Dashboard</h1>
        </div>

        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
        )}

        {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-blue-600 font-medium">Loading dashboard data...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Section */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 h-full">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Slot Request Status
                  </h2>
                  <div className="p-4">
                    <Pie
                        data={pieData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "bottom" },
                            tooltip: { backgroundColor: "#1D4ED8" },
                          },
                        }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Pending: {stats.pending}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Approved: {stats.approved}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Rejected: {stats.rejected}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {statCards.map((item) => (
                      <div key={item.label} className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800">{item.label}</h3>
                            <p className="text-3xl font-bold text-blue-900 mt-2">{item.value}</p>
                          </div>
                          <div className={`${item.color} p-3 rounded-lg shadow-md`}>{item.icon}</div>
                        </div>
                      </div>
                  ))}
                </div>

                {/* Additional Stats Section */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-blue-100">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Request Summary
                  </h2>
                  <div className="overflow-hidden bg-blue-50 rounded-lg">
                    <div className="flex h-4">
                      <div
                          className="bg-blue-500 h-full"
                          style={{
                            width: `${(stats.pending / (stats.pending + stats.approved + stats.rejected || 1)) * 100}%`,
                          }}
                      ></div>
                      <div
                          className="bg-green-500 h-full"
                          style={{
                            width: `${(stats.approved / (stats.pending + stats.approved + stats.rejected || 1)) * 100}%`,
                          }}
                      ></div>
                      <div
                          className="bg-red-500 h-full"
                          style={{
                            width: `${(stats.rejected / (stats.pending + stats.approved + stats.rejected || 1)) * 100}%`,
                          }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Total Requests: {stats.pending + stats.approved + stats.rejected}</span>
                    <span>
                  Approval Rate:{" "}
                      {((stats.approved / (stats.pending + stats.approved + stats.rejected || 1)) * 100).toFixed(1)}%
                </span>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export default Dashboard
