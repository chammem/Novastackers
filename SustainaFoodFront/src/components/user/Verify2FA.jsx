import React, { useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons'; // Icône clé

const Verify2FA = ({ userId, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/verify-2fa', { userId, code });
      if (res.data.success) {
        onSuccess(); // Rediriger vers la page d’accueil
      } else {
        setError('Code incorrect ou expiré');
      }
    } catch (err) {
      setError('Erreur lors de la vérification');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <label className="block text-sm font-medium">
        <FontAwesomeIcon icon={faKey} className="mr-2" />
        Code de vérification
      </label>
      <input
        type="text"
        className="input input-bordered w-full"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Entrez le code 2FA"
      />
      <button type="submit" className="btn btn-primary w-full">
        Vérifier le code
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default Verify2FA;
