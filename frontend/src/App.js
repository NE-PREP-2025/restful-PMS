import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Sidebar from "./components/common/SideBar"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard" // Admin only
import SlotRequests from "./pages/SlotRequests" // Admin for management, User for their own requests
import Users from "./pages/Users" // Admin
import Vehicles from "./pages/Vehicles" // Shared by both roles
import ParkingSlots from "./pages/ParkingSlots" // Admin only
import Logs from "./pages/Logs" // Admin for all logs, user for their logs
import AddVehicle from "./pages/AddVehicle" // User-specific
import { getToken } from "./utils/auth"
import Navbar from "./components/common/NavBar" // Importing Navbar

// Custom Route components for Admins and Users
const PrivateRoute = ({ children, adminOnly = false }) => {
    const token = getToken()
    if (!token) return <Navigate to="/login" />

    const payload = JSON.parse(atob(token.split(".")[1]))
    const userRole = payload.role

    if (adminOnly && userRole !== "admin") {
        return <Navigate to="/vehicles" />
    }

    return children
}

// Layout to separate admin/user UIs
const Layout = ({ children }) => {
    const location = useLocation()
    const isLoginPage = location.pathname === "/login"

    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-50">
            {/* Render Navbar and Sidebar unless on Login Page */}
            {!isLoginPage && (
                <>
                    {/* Fixed Navbar at the top */}
                    <Navbar />

                    {/* Main content area with sidebar */}
                    <div className="flex h-[calc(100vh-64px)] w-full mt-16">
                        {/* Sidebar - fixed on the left */}
                        <Sidebar />

                        {/* Main content - with overflow hidden to prevent scrolling */}
                        <div
                            className="flex-1 transition-all duration-300 ease-in-out pl-4 md:pl-6 overflow-hidden"
                            style={{
                                marginLeft: "64px" /* Default collapsed sidebar width */,
                            }}
                        >
                            <div className="h-full w-full overflow-hidden py-6 px-4">{children}</div>
                        </div>
                    </div>
                </>
            )}

            {/* Login page doesn't have navbar or sidebar */}
            {isLoginPage && <div className="h-screen w-screen overflow-hidden">{children}</div>}
        </div>
    )
}

// Main App Component
const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Admin routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/slot-requests"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <SlotRequests />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <Users />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/logs"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <Logs />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/parking-slots"
                        element={
                            <PrivateRoute adminOnly={true}>
                                <ParkingSlots />
                            </PrivateRoute>
                        }
                    />

                    {/* User routes */}
                    <Route
                        path="/vehicles"
                        element={
                            <PrivateRoute>
                                <Vehicles />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/add-vehicle"
                        element={
                            <PrivateRoute>
                                <AddVehicle />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/my-logs"
                        element={
                            <PrivateRoute>
                                <Logs userOnly={true} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/my-slot-requests"
                        element={
                            <PrivateRoute>
                                <SlotRequests userOnly={true} />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App
