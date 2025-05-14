import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiLock, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const TwoFactorAuth = () => {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [userToken, setUserToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  const generate2FA = async () => {
    setMessage('');
    setError(null);
    setVerified(false);
    try {
      const response = await axios.post('http://localhost:8082/api/auth/generate-2fa');
      setSecret(response.data.secret);
      setQrCodeUrl(response.data.qrCodeUrl);
    } catch (error) {
      console.error('Erreur lors de la génération de 2FA', error);
      setError("Échec de la génération du QR code. Veuillez réessayer.");
    }
  };

  const verify2FA = async () => {
    if (!userToken) {
      setError("Veuillez entrer le code de vérification");
      return;
    }

    setLoading(true);
    setMessage('');
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8082/api/auth/verify-2fa', {
        userToken,
        secret,
      });
      setVerified(true);
      setMessage(response.data.message || 'Authentification à deux facteurs activée avec succès');
    } catch (error) {
      setVerified(false);
      setError(error.response?.data?.message || 'Code invalide. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate2FA();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-md mx-auto my-8 px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="mb-6">
            <Link to="/profile" className="inline-flex items-center text-green-600 hover:text-green-700">
              <FiArrowLeft className="mr-2" /> Retour au profil
            </Link>
          </div>

          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <FiLock className="text-green-600 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Authentification à deux facteurs</h1>
              <p className="text-gray-500">Améliorez la sécurité de votre compte</p>
            </div>
          </div>

          {qrCodeUrl ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="text-center mb-4">
                <p className="text-gray-700 mb-2">Scannez ce QR code avec Google Authenticator :</p>
                <div className="flex justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code 2FA" 
                    className="w-48 h-48 border border-gray-200 rounded-lg p-2" 
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ou entrez manuellement ce code : <span className="font-mono font-bold">{secret}</span>
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="token"
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  placeholder="Entrez le code à 6 chiffres"
                  disabled={loading || verified}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={verify2FA}
                  disabled={loading || verified}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                    verified 
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : loading
                        ? 'bg-green-100 text-green-800 cursor-wait'
                        : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" />
                      Vérification...
                    </>
                  ) : verified ? (
                    <>
                      <FiCheckCircle className="mr-2" />
                      Vérifié
                    </>
                  ) : (
                    'Vérifier le code'
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generate2FA}
                  disabled={loading}
                  className="py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <FiRefreshCw className="mr-2" />
                  Régénérer
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}

          {(message || error) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg flex items-start ${
                error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
            >
              {error ? (
                <FiAlertCircle className="flex-shrink-0 mt-1 mr-2 text-red-500" />
              ) : (
                <FiCheckCircle className="flex-shrink-0 mt-1 mr-2 text-green-500" />
              )}
              <div>
                {error || message}
                {verified && (
                  <div className="mt-2">
                    <Link 
                      to="/profile" 
                      className="text-sm font-medium underline hover:text-green-800"
                    >
                      Retour au profil
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Conseils de sécurité :</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Ne partagez jamais votre code 2FA avec qui que ce soit
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Utilisez une application d'authentification officielle
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Sauvegardez vos codes de récupération en lieu sûr
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;