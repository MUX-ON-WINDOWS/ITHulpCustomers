import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './Modal.css';

const AppointmentModal = ({ appointment, onClose, onSave, onDelete }) => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    titel: '',
    beschrijving: '',
    start_datum: '',
    start_tijd: '',
    eind_datum: '',
    eind_tijd: '',
    status: 'gepland'
  });

  useEffect(() => {
    loadCustomers();
    if (appointment) {
      const startDate = new Date(appointment.start_datum);
      const endDate = appointment.eind_datum ? new Date(appointment.eind_datum) : null;
      setFormData({
        customer_id: appointment.customer_id || '',
        titel: appointment.titel || '',
        beschrijving: appointment.beschrijving || '',
        start_datum: format(startDate, 'yyyy-MM-dd'),
        start_tijd: format(startDate, 'HH:mm'),
        eind_datum: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        eind_tijd: endDate ? format(endDate, 'HH:mm') : '',
        status: appointment.status || 'gepland'
      });
    }
  }, [appointment]);

  const loadCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Fout bij laden klanten:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const start_datum = `${formData.start_datum} ${formData.start_tijd}:00`;
    const eind_datum = formData.eind_datum && formData.eind_tijd 
      ? `${formData.eind_datum} ${formData.eind_tijd}:00`
      : null;

    onSave({
      ...formData,
      start_datum,
      eind_datum
    });
  };

  const handleDelete = () => {
    if (appointment && window.confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) {
      onDelete(appointment.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{appointment ? 'Afspraak Bewerken' : 'Nieuwe Afspraak'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Klant *</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              required
            >
              <option value="">Selecteer klant</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.naam}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Titel *</label>
            <input
              type="text"
              value={formData.titel}
              onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Beschrijving</label>
            <textarea
              value={formData.beschrijving}
              onChange={(e) => setFormData({ ...formData, beschrijving: e.target.value })}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Datum *</label>
              <input
                type="date"
                value={formData.start_datum}
                onChange={(e) => setFormData({ ...formData, start_datum: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Tijd *</label>
              <input
                type="time"
                value={formData.start_tijd}
                onChange={(e) => setFormData({ ...formData, start_tijd: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Eind Datum</label>
              <input
                type="date"
                value={formData.eind_datum}
                onChange={(e) => setFormData({ ...formData, eind_datum: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Eind Tijd</label>
              <input
                type="time"
                value={formData.eind_tijd}
                onChange={(e) => setFormData({ ...formData, eind_tijd: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="gepland">Gepland</option>
              <option value="voltooid">Voltooid</option>
              <option value="afgezegd">Afgezegd</option>
            </select>
          </div>

          <div className="modal-actions">
            {appointment && (
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

export default AppointmentModal;
