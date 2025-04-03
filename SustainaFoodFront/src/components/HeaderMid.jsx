import { useNavigate, Link , NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useNotifications } from "../context/NotificationContext";
import axiosInstance from "../config/axiosInstance";

function HeaderMid() {
  const navigate = useNavigate();
  const {
    user,
    notifications,
    unreadCount,
    setNotifications,
  } = useNotifications();

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-primary font-semibold"
      : "text-gray-700 hover:text-gray-900";

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/userLogout");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const clearAll = async () => {
    try {
      await axiosInstance.delete(`/notification/clear-all/${user._id}`);
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Error clearing notifications");
    }
  };

  const deleteOne = async (id) => {
    try {
      await axiosInstance.delete(`/notification/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        <NavLink to="/home" className="text-2xl font-bold text-gray-900">
          SustainaFood
        </NavLink>

        <nav className="hidden md:flex space-x-6">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/features" className={linkClass}>Features</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>

          {/* Role-based links */}
          {user?.role === "charity" && (
            <>
              <NavLink to="/donationForm" className={linkClass}>Create Campaign</NavLink>
              <NavLink to="/my-campaigns" className={linkClass}>My Campaigns</NavLink>
            </>
          )}

          {user?.role === "volunteer" && (
            <NavLink to="/volunteer" className={linkClass}>Volunteer Dashboard</NavLink>
          )}

          {user?.role === "restaurant" && (
            <NavLink to="/donations" className={linkClass}>Donate</NavLink>
          )}

          {user?.role === "supermarket" && (
            <NavLink to="/my-pickups" className={linkClass}>Confirm Pickups</NavLink>
          )}
        </nav>

        <div className="hidden md:flex space-x-4 items-center">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <div className="indicator">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C8.67 6.165 8 7.388 8 8.75V14.158c0 .538-.214 1.055-.595 1.437L6 17h5m0 0v1a3 3 0 006 0v-1m-6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="badge badge-xs badge-error indicator-item">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg">Notifications</span>
                      {notifications.length > 0 && (
                        <button className="btn btn-xs btn-error" onClick={clearAll}>Clear All</button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.slice(0, 5).map((n, i) => (
                        <div key={i} className={`text-sm p-2 rounded flex justify-between items-center ${n.read ? "bg-gray-50" : "bg-blue-50 font-semibold"}`}>
                          <span className="truncate max-w-[200px]">{n.message}</span>
                          <button className="text-red-500 text-xs ml-2" onClick={() => deleteOne(n._id)} title="Delete notification">❌</button>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-sm text-gray-400">No notifications</p>
                      )}
                    </div>
                    <div className="card-actions mt-2">
                      <Link to="/notifications" className="btn btn-sm btn-primary btn-block">View All</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar dropdown */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  <li><Link to="/profile">Profile</Link></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log In</Link>
              <Link to="/role" className="btn btn-secondary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderMid;
