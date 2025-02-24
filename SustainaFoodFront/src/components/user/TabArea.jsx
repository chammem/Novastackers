import { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
} from "@mui/material";
import { Edit, Delete, ToggleOn, ToggleOff, Search } from "@mui/icons-material";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import userApi from "../../services/userApi";

const TabArea = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // États pour la modale de suppression
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.data || data);
        setFilteredUsers(data.data || data);
      })
      .catch((err) => console.error("Erreur lors de la récupération des utilisateurs:", err));
  }, []);

  useEffect(() => {
    const results = users.filter((user) =>
      ["fullName", "address", "phoneNumber", "email", "role"].some((key) =>
        user[key]?.toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredUsers(results);
    setPage(0);
  }, [search, users]);

  // Ouvrir la modale avec l'ID de l'utilisateur à supprimer
  const handleShowModal = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  // Supprimer l'utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      await userApi.deleteUser(selectedUserId);
      setUsers(users.filter((user) => user._id !== selectedUserId));
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className="flex-1 p-5"
        style={{ marginLeft: isSidebarOpen ? "250px" : "60px", transition: "margin-left 0.3s ease" }}
      >
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Bouton Ajouter */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "20px",
              marginTop: "26px",
              marginBottom: "16px",
              fontWeight: "bold",
              width: "90%",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            + Ajouter un utilisateur !
          </div>
        </div>

        {/* Conteneur principal */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "3px 6px 10px rgba(0, 0, 0, 0.3)",
              width: "90%",
              backgroundColor: "white",
            }}
          >
            <h2 style={{ color: "black", fontSize: "2rem", fontWeight: "bold", marginBottom: "16px", textAlign: "center" }}>
              Liste des utilisateurs
            </h2>

            {/* Barre de recherche */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", borderRadius: "10px", overflow: "hidden", height: "40px", border: "1px solid #ddd", backgroundColor: "white" }}>
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", padding: "0 12px", height: "100%", fontSize: "14px" }}
                />
                <button style={{ backgroundColor: "green", border: "none", padding: "0 12px", cursor: "pointer", height: "100%" }}>
                  <Search style={{ color: "white" }} />
                </button>
              </div>
            </div>

            {/* Tableau des utilisateurs */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>Nom Complet</TableCell>
                    <TableCell>Adresse</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleShowModal(user._id)}>
                          <Delete />
                        </IconButton>
                        <IconButton>
                          {user.isActive ? <ToggleOn color="success" /> : <ToggleOff color="error" />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
              <TablePagination
                component="div"
                count={filteredUsers.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(event, newPage) => setPage(newPage)}
                rowsPerPageOptions={[5, 10, 20]}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modale de confirmation */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Voulez-vous vraiment supprimer cet utilisateur ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Annuler</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
};

export default TabArea;
