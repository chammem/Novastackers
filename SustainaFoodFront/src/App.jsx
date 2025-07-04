import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import AdminNavbar from "./components/AdminNavbar";
// import Sidebar from "./components/Sidebar";
//  import Header from "./components/Header";
// import TabArea from "./components/user/TabArea";
import { Outlet } from 'react-router-dom';


const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div>
    {/* Add header/navigation here if needed */}
    <Outlet /> {/* This renders child routes (Home, Login, etc.) */}
  </div>
    // <Router>
    //   <div style={{ display: "flex" }}>
    //   {/* Sidebar */}
    //   <Sidebar isOpen={isSidebarOpen} />

    //   {/* Contenu principal */}
    //   <div
    //     className="main-content"
    //     style={{
    //       flex: 1,
    //       marginLeft: isSidebarOpen ? "250px" : "60px",
    //       transition: "margin-left 0.3s ease",
    //       padding: "20px",
    //     }}
    //   >
    //       {/* Header avec bouton pour ouvrir/fermer le sidebar */}
    //       <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

    //       <div className="p-6">
    //         <Routes>
    //           <Route path="/" element={<h1>Bienvenue sur l'application</h1>} />
    //           <Route path="/TabArea" element={<TabArea />} />
    //         </Routes>
    //       </div>
    //     </div>
    //   </div>
    // </Router>
    
  );
};

export default App;