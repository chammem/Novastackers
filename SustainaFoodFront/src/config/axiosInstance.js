import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';  // Pour la navigation programmatique dans React

const axiosInstance = axios.create({
  baseURL: "http://localhost:8082/api", // Changez ceci avec l'URL de votre API
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Gérer la redirection avec React Router et afficher une erreur utilisateur
const handleUnauthorizedError = (navigate) => {
  toast.error("Session expirée. Vous allez être redirigé vers la page de connexion.");
  navigate("/login");
};

// Interceptor pour les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    // Si la réponse est réussie, retournez-la directement
    return response;
  },
  (error) => {
    const navigate = useNavigate();  // Récupérer le navigate pour les redirections

    if (error.response) {
      // Si l'API répond avec un status code autre que 2xx
      if (error.response.status === 401) {
        // Redirection vers la page de login si non authentifié
        handleUnauthorizedError(navigate);
      } else if (error.response.status === 403) {
        // Gérer l'accès interdit
        toast.error("Vous n'avez pas les droits nécessaires pour effectuer cette action.");
      } else {
        // Gérer d'autres types d'erreurs (par exemple 500)
        toast.error(`Une erreur est survenue : ${error.response.status}`);
      }
    } else {
      // Si aucun réponse n'a été reçue (erreur réseau par exemple)
      toast.error("Erreur de réseau. Veuillez vérifier votre connexion.");
      console.error("Network Error:", error);
    }

    return Promise.reject(error); // Vous pouvez propager l'erreur pour un traitement supplémentaire
  }
);

// Exemple d'une requête GET
export const fetchData = async () => {
  try {
    const response = await axiosInstance.get("/some-endpoint");
    return response.data;
  } catch (error) {
    toast.error("Erreur lors de la récupération des données.");
    console.error("Error fetching data:", error);
    throw error; // Propager l'erreur pour une gestion ultérieure
  }
};

export default axiosInstance;
