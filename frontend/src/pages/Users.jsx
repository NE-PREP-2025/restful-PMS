"use client"

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "use-debounce"
import { getUsers, deleteUser } from "../utils/api"
import Pagination from "../components/common/Pagination"

const Users = () => {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 })
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await getUsers(page, limit, debouncedSearch)
      setUsers(response.data.data)
      setMeta(response.data.meta)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users")
    }
    setLoading(false)
  }, [page, limit, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id)
        alert("User deleted")
        fetchUsers()
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete user")
      }
    }
  }

  // Get verification badge
  const getVerificationBadge = (isVerified) => {
    if (isVerified) {
      return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Verified
        </span>
      )
    } else {
      return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <svg className="mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Not Verified
        </span>
      )
    }
  }

  // Get role badge
  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      user: "bg-blue-100 text-blue-800",
    }
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                colors[role] || "bg-gray-100 text-gray-800"
            }`}
        >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-blue-800">Users</h1>
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
                  placeholder="Search by name or email"
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
                <p className="text-blue-600 font-medium">Loading users...</p>
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
                      Name
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Verified
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Role
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
                  {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm mt-1">Try changing your search criteria</p>
                        </td>
                      </tr>
                  ) : (
                      users.map((user) => (
                          <tr key={user.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getVerificationBadge(user.is_verified)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                  onClick={() => handleDelete(user.id)}
                                  className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                  disabled={user.role === "admin"}
                                  title={user.role === "admin" ? "Cannot delete admin users" : "Delete user"}
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
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

export default Users
