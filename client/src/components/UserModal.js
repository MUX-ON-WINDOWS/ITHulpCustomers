import React, { useState, useEffect } from 'react';
import './Modal.css';

const UserModal = ({ user, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    gebruikersnaam: '',
    email: '',
    wachtwoord: '',
    voornaam: '',
    achternaam: '',
    werkadres: '',
    rol: 'gebruiker',
    actief: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        gebruikersnaam: user.gebruikersnaam || '',
        email: user.email || '',
        wachtwoord: '',
        voornaam: user.voornaam || '',
        achternaam: user.achternaam || '',
        werkadres: user.werkadres || '',
        rol: user.rol || 'gebruiker',
        actief: user.actief !== undefined ? user.actief : true
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (user && window.confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      onDelete(user.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? 'Gebruiker Bewerken' : 'Nieuwe Gebruiker'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Voornaam</label>
              <input
                type="text"
                value={formData.voornaam}
                onChange={(e) => setFormData({ ...formData, voornaam: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Achternaam</label>
              <input
                type="text"
                value={formData.achternaam}
                onChange={(e) => setFormData({ ...formData, achternaam: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Gebruikersnaam *</label>
            <input
              type="text"
              value={formData.gebruikersnaam}
              onChange={(e) => setFormData({ ...formData, gebruikersnaam: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Werkadres</label>
            <input
              type="text"
              value={formData.werkadres}
              onChange={(e) => setFormData({ ...formData, werkadres: e.target.value })}
              placeholder="Bijv. Rosariopark 38, 3541, Utrecht"
            />
          </div>

          <div className="form-group">
            <label>Wachtwoord {user ? '(laat leeg om niet te wijzigen)' : '*'}</label>
            <input
              type="password"
              value={formData.wachtwoord}
              onChange={(e) => setFormData({ ...formData, wachtwoord: e.target.value })}
              required={!user}
              minLength={6}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rol</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <option value="gebruiker">Gebruiker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.actief ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, actief: e.target.value === 'true' })}
              >
                <option value="true">Actief</option>
                <option value="false">Inactief</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            {user && (
              <button type="button" className="btn-danger" onClick={handleDelete}>
                Verwijderen
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Annuleren
              </button>
              <button type="submit" className="btn-primary">
                Opslaan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
