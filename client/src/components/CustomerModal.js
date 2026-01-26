import React, { useState, useEffect } from 'react';
import './Modal.css';

const CustomerModal = ({ customer, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: '',
    adres: '',
    bedrijf: '',
    opmerkingen: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        naam: customer.naam || '',
        email: customer.email || '',
        telefoon: customer.telefoon || '',
        adres: customer.adres || '',
        bedrijf: customer.bedrijf || '',
        opmerkingen: customer.opmerkingen || ''
      });
    }
  }, [customer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (customer && window.confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      onDelete(customer.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{customer ? 'Klant Bewerken' : 'Nieuwe Klant'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Naam *</label>
            <input
              type="text"
              value={formData.naam}
              onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Telefoon</label>
              <input
                type="tel"
                value={formData.telefoon}
                onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bedrijf</label>
            <input
              type="text"
              value={formData.bedrijf}
              onChange={(e) => setFormData({ ...formData, bedrijf: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Adres</label>
            <textarea
              value={formData.adres}
              onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Opmerkingen</label>
            <textarea
              value={formData.opmerkingen}
              onChange={(e) => setFormData({ ...formData, opmerkingen: e.target.value })}
              rows="4"
            />
          </div>

          <div className="modal-actions">
            {customer && (
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

export default CustomerModal;
