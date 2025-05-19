"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { getToken } from "../../utils/auth"

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()

    const token = getToken()
    if (!token) return null

    const payload = JSON.parse(atob(token.split(".")[1]))
    const userRole = payload.role
    const userName = payload.name || "User"

    // Check if current route matches the link
    const isActive = (path) => {
        return location.pathname === path
    }

    // Toggle sidebar collapse
    const toggleSidebar = () => {
        setCollapsed(!collapsed)
    }

    return (
        <div
            className={`${
                collapsed ? "w-20" : "w-64"
            } bg-gradient-to-b from-blue-800 to-blue-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out shadow-xl z-40`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-blue-700">
                {!collapsed && <h1 className="text-xl font-bold text-white">Vehicle Parking</h1>}
                <button
                    onClick={toggleSidebar}
                    className={`${collapsed ? "mx-auto" : ""} p-2 rounded-md hover:bg-blue-700 transition-colors duration-200`}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={collapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
                        />
                    </svg>
                </button>
            </div>

            {/* User Profile */}
            <div className={`p-4 border-b border-blue-700 ${collapsed ? "text-center" : ""}`}>
                <div className="flex items-center mb-2">
                    <div
                        className={`${collapsed ? "mx-auto" : "mr-3"} h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-semibold`}
                    >
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="font-medium">{userName}</p>
                            <p className="text-xs text-blue-200 capitalize">{userRole}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="py-4 overflow-y-auto h-[calc(100vh-160px)]">
                <ul className="space-y-1">
                    {/* Admin Links */}
                    {userRole === "admin" && (
                        <>
                            <li className="px-3">
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/dashboard")
                                            ? "bg-blue-700 text-white"
                                            : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
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
                                    {!collapsed && <span>Dashboard</span>}
                                </Link>
                            </li>
                            <li className="px-3">
                                <Link
                                    to="/slot-requests"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/slot-requests")
                                            ? "bg-blue-700 text-white"
                                            : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
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
                                    {!collapsed && <span>Slot Requests</span>}
                                </Link>
                            </li>
                            <li className="px-3">
                                <Link
                                    to="/users"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/users") ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
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
                                    {!collapsed && <span>Manage Users</span>}
                                </Link>
                            </li>
                            <li className="px-3">
                                <Link
                                    to="/parking-slots"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/parking-slots")
                                            ? "bg-blue-700 text-white"
                                            : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
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
                                    {!collapsed && <span>Manage Parking</span>}
                                </Link>
                            </li>
                            <li className="px-3">
                                <Link
                                    to="/logs"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/logs") ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
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
                                    {!collapsed && <span>View Logs</span>}
                                </Link>
                            </li>
                        </>
                    )}

                    {/* User Links */}
                    {userRole === "user" && (
                        <>
                            <li className="px-3">
                                <Link
                                    to="/vehicles"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/vehicles")
                                            ? "bg-blue-700 text-white"
                                            : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
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
                                    {!collapsed && <span>My Vehicles</span>}
                                </Link>
                            </li>
                            <li className="px-3">
                                <Link
                                    to="/add-vehicle"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/add-vehicle")
                                            ? "bg-blue-700 text-white"
                                            : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {!collapsed && <span>Add Vehicle</span>}
                                </Link>
                            </li>
                            <li className="px-3">
                                <Link
                                    to="/my-slot-requests"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/my-slot-requests")
                                            ? "bg-blue-700 text-white"
                                            : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {!collapsed && <span>My Slot Requests</span>}
                                </Link>
                            </li>
                            <li className="px-3">
                                <Link
                                    to="/my-logs"
                                    className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors duration-200 ${
                                        isActive("/my-logs") ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
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
                                    {!collapsed && <span>My Logs</span>}
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {/* Footer */}
            <div className={`absolute bottom-0 w-full p-4 border-t border-blue-700 ${collapsed ? "text-center" : ""}`}>
                <div className={`flex items-center ${collapsed ? "justify-center" : ""} text-sm text-blue-200`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${collapsed ? "" : "mr-2"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    {!collapsed && <span>Help & Support</span>}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
