import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-base-200 shadow-md p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-4">Restaurant Charity</h2>
      <ul className="menu space-y-2">
        <li>
          <Link to="/donations" className="btn btn-outline w-full">
            🍽️ View Donations
          </Link>
        </li>
        <li>
          <Link to="/restaurant/donate-food" className="btn btn-outline w-full">
            ➕ Donate Food
          </Link>
        </li>
        <li>
          <Link to="/restaurant/contributions" className="btn btn-outline w-full">
            📊 Your Contributions
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
