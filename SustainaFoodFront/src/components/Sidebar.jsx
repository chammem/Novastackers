import React from "react";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from "cdbreact";
import { NavLink } from "react-router-dom";
import { MdDashboard } from "react-icons/md"; // Icône Dashboard
import { FaUsers } from "react-icons/fa";

const Sidebar = ({ isOpen }) => {
  return (
    <div
    style={{
      position: "fixed",
      height: "100vh",
      transition: "width 0.3s ease",
      overflowX: "hidden",
      zIndex: 1000,
    }}
  >
      <CDBSidebar textColor="#fff" backgroundColor="black">
        {/* En-tête Sidebar */}
        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
          {isOpen && (
            <a href="/" className="text-decoration-none" style={{ color: "inherit" }}>
              Sidebar
            </a>
          )}
        </CDBSidebarHeader>

        {/* Contenu Sidebar */}
        <CDBSidebarContent>
          <CDBSidebarMenu>
          <NavLink to="/" className={({ isActive }) => (isActive ? "activeClicked" : "")}>
  <CDBSidebarMenuItem>
    <MdDashboard size={20} className="me-2" />
    {isOpen && "Dashboard"} {/* Masquer texte si fermé */}
  </CDBSidebarMenuItem>
</NavLink>

<NavLink to="/TabArea" className={({ isActive }) => (isActive ? "activeClicked" : "")}>
  <CDBSidebarMenuItem>
    <FaUsers size={20} className="me-2" />
    {isOpen && "User"} 
  </CDBSidebarMenuItem>
</NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>
      </CDBSidebar>
    </div>
  );
};

export default Sidebar;
