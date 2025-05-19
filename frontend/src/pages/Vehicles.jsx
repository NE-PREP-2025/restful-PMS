"use client"

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "use-debounce"
import { getVehicles } from "../utils/api"
import Pagination from "../components/common/Pagination"

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 })
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await getVehicles(page, limit, debouncedSearch)
      setVehicles(response.data.data)
      setMeta(response.data.meta)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch vehicles")
    }
    setLoading(false)
  }, [page, limit, debouncedSearch])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Get size badge
  const getSizeBadge = (size) => {
    const colors = {
      small: "bg-blue-100 text-blue-800",
      medium: "bg-purple-100 text-purple-800",
      large: "bg-yellow-100 text-yellow-800",
    }
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                colors[size] || "bg-gray-100 text-gray-800"
            }`}
        >
        {size.charAt(0).toUpperCase() + size.slice(1)}
      </span>
    )
  }

  // Get vehicle type icon
  const getVehicleTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "car":
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
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
        )
      case "truck":
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
        )
      case "taxi":
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
        )
      default:
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
        )
    }
  }

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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h1 className="text-3xl font-bold text-blue-800">Vehicles</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-blue-100 p-6 mb-6">
          <div className="mb-6">
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                  type="text"
                  placeholder="Search by plate number"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
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
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-blue-600 font-medium">Loading vehicles...</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead>
                  <tr>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Plate Number
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Vehicle Type
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Size
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      User ID
                    </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                  {vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
                          <p className="text-lg font-medium">No vehicles found</p>
                          <p className="text-sm mt-1">Try changing your search criteria</p>
                        </td>
                      </tr>
                  ) : (
                      vehicles.map((vehicle) => (
                          <tr key={vehicle.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-medium text-sm">
                              {vehicle.plate_number.substring(0, 2)}
                            </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{vehicle.plate_number}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getVehicleTypeIcon(vehicle.vehicle_type)}
                                <span className="ml-2 text-sm text-gray-700 capitalize">{vehicle.vehicle_type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getSizeBadge(vehicle.size)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vehicle.user_id}</td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        <Pagination meta={meta} setPage={setPage} />
      </div>
  )
}

export default Vehicles
