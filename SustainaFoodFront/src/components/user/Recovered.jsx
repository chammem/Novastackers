import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Recovered() {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [countdown, setCountdown] = useState(5); // Pour afficher le décompte avant redirection

  // Démarre un timer pour rediriger automatiquement
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      navigate("/login");
    }, 5000); // Redirection après 5 secondes

    // Décompte visible pour l'utilisateur
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-wrap justify-center items-center w-full max-w-4xl bg-white shadow-lg rounded-lg p-8 dark:bg-gray-800">
        {/* Image Section */}
        <div className="w-full md:w-1/2 p-4">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            className="w-full"
            alt="Success"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Password successfully set
          </h1>
          <div className="my-4 border-t border-gray-300"></div>

          {/* Décompte avant la redirection */}
          <h2
            className="text-lg text-gray-600 dark:text-gray-300"
            role="alert"
            aria-live="polite"
          >
            Redirecting to Login in <span className="font-bold">{countdown}</span> seconds...
          </h2>

          {/* Bouton pour rediriger immédiatement */}
          <button
            onClick={() => {
              clearTimeout(timeoutRef.current); // Annule le timer si on clique
              navigate("/login");
            }}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    </div>
  );
}
