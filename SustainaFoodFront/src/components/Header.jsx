import React, { useState } from "react";
import { Navbar, Nav, Dropdown } from "react-bootstrap";
import { FaBars, FaBell, FaUser } from "react-icons/fa"; // Import des icônes

const Header = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <Navbar
      bg="light"
      expand="lg"
      className="shadow-sm header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Bouton Menu Sidebar */}
      <Navbar.Brand onClick={toggleSidebar} style={{ cursor: "pointer" }}>
        <FaBars size={20} />
      </Navbar.Brand>

      {/* Espacement pour centrer les éléments à droite */}
      <div style={{ flex: 1 }}></div>

      {/* Icône Notifications */}
      <Nav className="mr-3">
        <Nav.Link href="#" className="position-relative">
          <FaBell size={20} />
          {/* Badge de notification */}
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              fontSize: "12px",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </span>
        </Nav.Link>
      </Nav>

      {/* Menu utilisateur avec Logout */}
      <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
        <Dropdown.Toggle
          as="div"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaUser size={20} />
        </Dropdown.Toggle>

        <Dropdown.Menu align="end">
          <Dropdown.Item href="#">Profile</Dropdown.Item>
          <Dropdown.Item href="#">Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => alert("Déconnexion")}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Navbar>
  );
};

export default Header;


