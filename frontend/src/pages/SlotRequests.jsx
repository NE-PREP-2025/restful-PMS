"use client"

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "use-debounce"
import { getSlotRequests, approveRequest, rejectRequest } from "../utils/api"
import Pagination from "../components/common/Pagination"

const SlotRequests = () => {
  const [requests, setRequests] = useState([])
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 })
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await getSlotRequests(page, limit, debouncedSearch)
      setRequests(response.data.data)
      setMeta(response.data.meta)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch requests")
    }
    setLoading(false)
  }, [page, limit, debouncedSearch])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleApprove = async (id) => {
    try {
      const response = await approveRequest(id)
      alert(`Request approved. Slot: ${response.data.slot?.slot_number || "N/A"}. Email: ${response.data.emailStatus}`)
      fetchRequests()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve request")
    }
  }

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please provide a reason for rejection")
      return
    }
    try {
      const response = await rejectRequest(selectedRequestId, rejectReason)
      alert(`Request rejected. Email: ${response.data.emailStatus}`)
      setRejectReason("")
      setSelectedRequestId(null)
      fetchRequests()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject request")
    }
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Approved
          </span>
        )
      case "rejected":
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Rejected
          </span>
        )
      case "pending":
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <svg className="mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Pending
          </span>
        )
      default:
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequestDetails(request)
  }

  const closeDetailsModal = () => {
    setSelectedRequestDetails(null)
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h1 className="text-3xl font-bold text-blue-800">Slot Requests</h1>
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
                  placeholder="Search by plate number or status"
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
                <p className="text-blue-600 font-medium">Loading requests...</p>
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
                      Status
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                  {requests.length === 0 ? (
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <p className="text-lg font-medium">No slot requests found</p>
                          <p className="text-sm mt-1">Try changing your search criteria</p>
                        </td>
                      </tr>
                  ) : (
                      requests.map((req) => (
                          <tr key={req.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.plate_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                              {req.vehicle_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(req.request_status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {req.request_status.toLowerCase() === "pending" ? (
                                  <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                    >
                                      <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 mr-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Approve
                                    </button>
                                    <button
                                        onClick={() => setSelectedRequestId(req.id)}
                                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                    >
                                      <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 mr-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                      >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                      Reject
                                    </button>
                                  </div>
                              ) : (
                                  <button
                                      onClick={() => handleViewDetails(req)}
                                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                    View Details
                                  </button>
                              )}
                            </td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        <Pagination meta={meta} setPage={setPage} />

        {/* Reject Request Modal */}
        {selectedRequestId && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800">Reject Request #{selectedRequestId}</h2>
                  <button
                      onClick={() => {
                        setRejectReason("")
                        setSelectedRequestId(null)
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-blue-800 font-medium mb-2" htmlFor="rejectReason">
                    Reason for Rejection
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-blue-400">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <textarea
                        id="rejectReason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection"
                        className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows="4"
                        required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                      onClick={() => {
                        setRejectReason("")
                        setSelectedRequestId(null)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* View Details Modal */}
        {selectedRequestDetails && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800">Request Details #{selectedRequestDetails.id}</h2>
                  <button onClick={closeDetailsModal} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="space-y-4">
                    <div className="flex border-b border-blue-200 pb-2">
                      <div className="w-1/3 font-medium text-blue-800">Plate Number:</div>
                      <div className="w-2/3 text-gray-700">{selectedRequestDetails.plate_number}</div>
                    </div>
                    <div className="flex border-b border-blue-200 pb-2">
                      <div className="w-1/3 font-medium text-blue-800">Vehicle Type:</div>
                      <div className="w-2/3 text-gray-700 capitalize">{selectedRequestDetails.vehicle_type}</div>
                    </div>
                    <div className="flex border-b border-blue-200 pb-2">
                      <div className="w-1/3 font-medium text-blue-800">Status:</div>
                      <div className="w-2/3">{getStatusBadge(selectedRequestDetails.request_status)}</div>
                    </div>
                    {selectedRequestDetails.request_status.toLowerCase() === "rejected" &&
                        selectedRequestDetails.rejection_reason && (
                            <div className="flex border-b border-blue-200 pb-2">
                              <div className="w-1/3 font-medium text-blue-800">Rejection Reason:</div>
                              <div className="w-2/3 text-gray-700">{selectedRequestDetails.rejection_reason}</div>
                            </div>
                        )}
                    {selectedRequestDetails.request_status.toLowerCase() === "approved" && selectedRequestDetails.slot && (
                        <div className="flex border-b border-blue-200 pb-2">
                          <div className="w-1/3 font-medium text-blue-800">Assigned Slot:</div>
                          <div className="w-2/3 text-gray-700">{selectedRequestDetails.slot.slot_number}</div>
                        </div>
                    )}
                    <div className="flex">
                      <div className="w-1/3 font-medium text-blue-800">Request Date:</div>
                      <div className="w-2/3 text-gray-700">
                        {new Date(selectedRequestDetails.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                      onClick={closeDetailsModal}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export default SlotRequests
