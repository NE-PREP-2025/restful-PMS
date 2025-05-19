"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getToken, removeToken } from "../../utils/auth"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Extract user role from the token
  const token = getToken()
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null
  const userRole = payload ? payload.role : null
  const userName = payload ? payload.name || "User" : "User"

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    removeToken()
    navigate("/login")
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "bg-blue-700 font-medium" : ""
  }

  return (
      <nav
          className={`bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg fixed top-0 z-50 w-full transition-all duration-300 ${
              isScrolled ? "py-2" : "py-4"
          }`}
      >
        {/* Navbar Container */}
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo / Admin-specific branding */}
          <Link
              to={userRole === "admin" ? "/dashboard" : "/vehicles"}
              className="flex items-center text-white font-bold text-xl md:text-2xl transition-all duration-300 hover:text-blue-200"
          >
            {userRole === "admin" ? (
                <span className="flex items-center">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Admin Access UI
            </span>
            ) : (
                <span className="flex items-center">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 mr-2"
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
              Parking Management
            </span>
            )}
          </Link>

          {/* User Profile for Desktop */}
          <div className="hidden md:flex items-center mr-4">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white mr-2">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-white text-sm">{userName}</span>
          </div>

          {/* Hamburger Menu Button */}
          <button
              onClick={toggleMenu}
              className="text-white focus:outline-none hover:bg-blue-700 p-2 rounded-lg transition-colors duration-200 md:hidden"
              aria-controls="navbar-menu"
              aria-expanded={isOpen}
          >
            <span className="sr-only">Open menu</span>
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Only show the Dashboard link for admins */}
            {userRole === "admin" && (
                <Link
                    to="/dashboard"
                    className={`flex items-center text-blue-100 px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200 ${isActive(
                        "/dashboard",
                    )}`}
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
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
                  Dashboard
                </Link>
            )}

            {userRole === "admin" && (
                <>
                  <Link
                      to="/slot-requests"
                      className={`flex items-center text-blue-100 px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200 ${isActive(
                          "/slot-requests",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
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
                    Slot Requests
                  </Link>
                  <Link
                      to="/users"
                      className={`flex items-center text-blue-100 px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200 ${isActive(
                          "/users",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
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
                    Manage Users
                  </Link>
                  <Link
                      to="/logs"
                      className={`flex items-center text-blue-100 px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200 ${isActive(
                          "/logs",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
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
                    View Logs
                  </Link>
                </>
            )}

            {userRole !== "admin" && (
                <>
                  <Link
                      to="/vehicles"
                      className={`flex items-center text-blue-100 px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200 ${isActive(
                          "/vehicles",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
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
                    My Vehicles
                  </Link>
                  <Link
                      to="/my-slot-requests"
                      className={`flex items-center text-blue-100 px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200 ${isActive(
                          "/my-slot-requests",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
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
                    My Slot Requests
                  </Link>
                </>
            )}

            <button
                onClick={handleLogout}
                className="ml-2 bg-white text-blue-800 px-4 py-2 rounded-md font-medium hover:bg-blue-100 transition-colors duration-200 shadow-sm flex items-center"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Links */}
        <div
            id="navbar-menu"
            className={`transform transition-all duration-300 ease-in-out md:hidden ${
                isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
            }`}
        >
          <div className="flex flex-col space-y-1 bg-blue-900 text-white px-4 py-3">
            {/* User Profile for Mobile */}
            <div className="flex items-center py-2 border-b border-blue-700 mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold mr-2">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-white">{userName}</span>
            </div>

            {/* Only show the Dashboard link for admins */}
            {userRole === "admin" && (
                <Link
                    to="/dashboard"
                    className={`flex items-center px-3 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${isActive(
                        "/dashboard",
                    )}`}
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
                  Dashboard
                </Link>
            )}

            {userRole === "admin" && (
                <>
                  <Link
                      to="/slot-requests"
                      className={`flex items-center px-3 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${isActive(
                          "/slot-requests",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                    Slot Requests
                  </Link>
                  <Link
                      to="/users"
                      className={`flex items-center px-3 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${isActive(
                          "/users",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                    Manage Users
                  </Link>
                  <Link
                      to="/logs"
                      className={`flex items-center px-3 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${isActive(
                          "/logs",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                    View Logs
                  </Link>
                </>
            )}

            {userRole !== "admin" && (
                <>
                  <Link
                      to="/vehicles"
                      className={`flex items-center px-3 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${isActive(
                          "/vehicles",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                    My Vehicles
                  </Link>
                  <Link
                      to="/my-slot-requests"
                      className={`flex items-center px-3 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 ${isActive(
                          "/my-slot-requests",
                      )}`}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                    My Slot Requests
                  </Link>
                </>
            )}

            <button
                onClick={handleLogout}
                className="mt-2 flex items-center bg-white text-blue-800 px-3 py-3 rounded-md font-medium hover:bg-blue-100 transition-colors duration-200"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Blue accent line at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></div>
      </nav>
  )
}

export default Navbar
