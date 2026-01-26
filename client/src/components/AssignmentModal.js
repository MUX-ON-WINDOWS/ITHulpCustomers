import React, { useState, useEffect } from 'react';
import './Modal.css';

const AssignmentModal = ({ assignment, customerId, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    titel: '',
    beschrijving: '',
    start_datum: '',
    eind_datum: '',
    status: 'voltooid',
    kosten: ''
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        customer_id: assignment.customer_id || customerId || '',
        titel: assignment.titel || '',
        beschrijving: assignment.beschrijving || '',
        start_datum: assignment.start_datum ? assignment.start_datum.split('T')[0] : '',
        eind_datum: assignment.eind_datum ? assignment.eind_datum.split('T')[0] : '',
        status: assignment.status || 'voltooid',
        kosten: assignment.kosten || ''
      });
    } else {
      setFormData(prev => ({ ...prev, customer_id: customerId || '' }));
    }
  }, [assignment, customerId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      kosten: formData.kosten ? parseFloat(formData.kosten) : null
    });
  };

  const handleDelete = () => {
    if (assignment && window.confirm('Weet je zeker dat je deze opdracht wilt verwijderen?')) {
      onDelete(assignment.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{assignment ? 'Opdracht Bewerken' : 'Nieuwe Opdracht'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
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
              <label>Eind Datum</label>
              <input
                type="date"
                value={formData.eind_datum}
                onChange={(e) => setFormData({ ...formData, eind_datum: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="voltooid">Voltooid</option>
                <option value="bezig">Bezig</option>
                <option value="geannuleerd">Geannuleerd</option>
              </select>
            </div>
            <div className="form-group">
              <label>Kosten (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.kosten}
                onChange={(e) => setFormData({ ...formData, kosten: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="modal-actions">
            {assignment && (
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

export default AssignmentModal;
