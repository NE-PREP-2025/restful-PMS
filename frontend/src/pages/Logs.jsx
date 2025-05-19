"use client"

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "use-debounce"
import { getLogs } from "../utils/api"
import Pagination from "../components/common/Pagination"
import { isAdmin, getToken } from "../utils/auth"

const Logs = () => {
    const [logs, setLogs] = useState([])
    const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 })
    const [search, setSearch] = useState("")
    const [debouncedSearch] = useDebounce(search, 500)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Retrieve user info from token
    const token = getToken()
    const userRole = JSON.parse(atob(token.split(".")[1])).role
    const userId = JSON.parse(atob(token.split(".")[1])).id

    // Fetch logs based on role
    const fetchLogs = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const response = await getLogs(page, limit, debouncedSearch, userRole === "admin" ? null : userId)
            setLogs(response.data.data)
            setMeta(response.data.meta)
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch logs")
        }
        setLoading(false)
    }, [page, limit, debouncedSearch, userRole, userId])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    // Format timestamp to a more readable format
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp)
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    // Get status badge color based on action
    const getActionBadgeColor = (action) => {
        if (action.includes("create") || action.includes("add")) return "bg-green-100 text-green-800"
        if (action.includes("update") || action.includes("edit")) return "bg-blue-100 text-blue-800"
        if (action.includes("delete") || action.includes("remove")) return "bg-red-100 text-red-800"
        if (action.includes("login") || action.includes("logout")) return "bg-purple-100 text-purple-800"
        return "bg-gray-100 text-gray-800"
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
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h1 className="text-3xl font-bold text-blue-800">{isAdmin() ? "All Activity Logs" : "My Activity Logs"}</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-blue-100 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
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
                            placeholder="Search logs by action or user ID"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="text-gray-600">
                        <span className="font-medium">{meta.totalItems}</span> logs found
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
                        <p className="text-blue-600 font-medium">Loading logs...</p>
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
                                    User ID
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                                >
                                    Action
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                                >
                                    Timestamp
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
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
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="text-lg font-medium">No logs available</p>
                                        <p className="text-sm mt-1">Try changing your search criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-blue-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.user_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(
                                log.action,
                            )}`}
                        >
                          {log.action}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {formatTimestamp(log.timestamp)}
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
        </div>
    )
}

export default Logs
