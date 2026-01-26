import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import nl from 'date-fns/locale/nl';
import { useAuth } from '../context/AuthContext';
import './CustomerDetail.css';
import AssignmentModal from './AssignmentModal';
import AppointmentModal from './AppointmentModal';
import UserAssignmentModal from './UserAssignmentModal';

const CustomerDetail = ({ customer, onClose, onEdit, onRefresh }) => {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadAssignedUsers();
    if (isAdmin()) {
      loadAllUsers();
    }
  }, [customer.id, isAdmin]);

  const handleNewAssignment = () => {
    setSelectedAssignment(null);
    setShowAssignmentModal(true);
  };

  const handleAssignmentClick = async (assignment) => {
    // Show detail view first
    if (assignment.source === 'appointment' && assignment.appointment_id) {
      try {
        const response = await axios.get(`/api/appointments`);
        const appointment = response.data.find(apt => apt.id === assignment.appointment_id);
        if (appointment) {
          setSelectedAppointment(appointment);
          setSelectedAssignmentDetail({ ...assignment, appointment: appointment });
          setShowAssignmentDetail(true);
        } else {
          alert('Afspraak niet gevonden');
        }
      } catch (error) {
        console.error('Fout bij laden afspraak:', error);
        alert('Kon afspraak niet laden');
      }
      return;
    }
    // Regular assignment - show detail
    setSelectedAssignmentDetail(assignment);
    setShowAssignmentDetail(true);
  };

  const handleEditFromDetail = () => {
    setShowAssignmentDetail(false);
    if (selectedAssignmentDetail.source === 'appointment' && selectedAssignmentDetail.appointment) {
      setSelectedAppointment(selectedAssignmentDetail.appointment);
      setShowAppointmentModal(true);
    } else {
      setSelectedAssignment(selectedAssignmentDetail);
      setShowAssignmentModal(true);
    }
  };

  const handleSaveAssignment = async (assignmentData) => {
    try {
      if (selectedAssignment) {
        await axios.put(`/api/assignments/${selectedAssignment.id}`, assignmentData);
      } else {
        await axios.post('/api/assignments', {
          ...assignmentData,
          customer_id: customer.id
        });
      }
      await onRefresh();
      const response = await axios.get(`/api/customers/${customer.id}`);
      Object.assign(customer, response.data);
      setShowAssignmentModal(false);
      setShowAssignmentDetail(false);
      setSelectedAssignment(null);
      setSelectedAssignmentDetail(null);
    } catch (error) {
      console.error('Fout bij opslaan opdracht:', error);
      alert('Kon opdracht niet opslaan');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze opdracht wilt verwijderen?')) {
      return;
    }
    try {
      await axios.delete(`/api/assignments/${id}`);
      await onRefresh();
      const response = await axios.get(`/api/customers/${customer.id}`);
      Object.assign(customer, response.data);
      setShowAssignmentModal(false);
      setShowAssignmentDetail(false);
      setSelectedAssignment(null);
      setSelectedAssignmentDetail(null);
    } catch (error) {
      console.error('Fout bij verwijderen opdracht:', error);
      alert('Kon opdracht niet verwijderen');
    }
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (selectedAppointment) {
        await axios.put(`/api/appointments/${selectedAppointment.id}`, appointmentData);
      } else {
        await axios.post('/api/appointments', appointmentData);
      }
      await onRefresh();
      const response = await axios.get(`/api/customers/${customer.id}`);
      Object.assign(customer, response.data);
      setShowAppointmentModal(false);
      setShowAssignmentDetail(false);
      setSelectedAppointment(null);
      setSelectedAssignmentDetail(null);
    } catch (error) {
      console.error('Fout bij opslaan afspraak:', error);
      alert('Kon afspraak niet opslaan');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) {
      return;
    }
    try {
      await axios.delete(`/api/appointments/${id}`);
      await onRefresh();
      const response = await axios.get(`/api/customers/${customer.id}`);
      Object.assign(customer, response.data);
      setShowAppointmentModal(false);
      setShowAssignmentDetail(false);
      setSelectedAppointment(null);
      setSelectedAssignmentDetail(null);
    } catch (error) {
      console.error('Fout bij verwijderen afspraak:', error);
      alert('Kon afspraak niet verwijderen');
    }
  };

  const loadAssignedUsers = async () => {
    try {
      const response = await axios.get(`/api/customers/${customer.id}/users`);
      setAssignedUsers(response.data);
    } catch (error) {
      console.error('Fout bij laden toegewezen gebruikers:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Fout bij laden gebruikers:', error);
    }
  };

  const handleAssignUsers = async (userIds) => {
    try {
      await axios.post(`/api/customers/${customer.id}/assign`, {
        user_ids: userIds
      });
      await loadAssignedUsers();
    } catch (error) {
      console.error('Fout bij toewijzen gebruikers:', error);
      alert('Kon gebruikers niet toewijzen');
    }
  };

  return (
    <div className="customer-detail-overlay" onClick={onClose}>
      <div className="customer-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="customer-detail-header">
          <h2>{customer.naam}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="customer-detail-body">
          <div className="detail-section">
            <h3>Contactgegevens</h3>
            <div className="detail-info">
              {customer.email && (
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.telefoon && (
                <div className="detail-item">
                  <span className="detail-label">Telefoon:</span>
                  <span>{customer.telefoon}</span>
                </div>
              )}
              {customer.bedrijf && (
                <div className="detail-item">
                  <span className="detail-label">Bedrijf:</span>
                  <span>{customer.bedrijf}</span>
                </div>
              )}
              {customer.adres && (
                <div className="detail-item">
                  <span className="detail-label">Adres:</span>
                  <span>{customer.adres}</span>
                </div>
              )}
              {customer.opmerkingen && (
                <div className="detail-item">
                  <span className="detail-label">Opmerkingen:</span>
                  <span>{customer.opmerkingen}</span>
                </div>
              )}
            </div>
          </div>

          {isAdmin() && (
            <div className="detail-section">
              <div className="section-header">
                <h3>Toegewezen Gebruikers</h3>
              </div>
              <div className="assigned-users">
                {assignedUsers.length > 0 ? (
                  <div className="users-list">
                    {assignedUsers.map(user => (
                      <span key={user.id} className="user-tag">
                        {user.voornaam && user.achternaam
                          ? `${user.voornaam} ${user.achternaam}`
                          : user.gebruikersnaam}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-assignments">Geen gebruikers toegewezen</p>
                )}
                <UserAssignmentModal
                  assignedUsers={assignedUsers}
                  allUsers={allUsers}
                  onAssign={handleAssignUsers}
                />
              </div>
            </div>
          )}

          <div className="detail-section">
            <div className="section-header">
              <h3>Vorige Opdrachten</h3>
              <button className="btn-primary btn-small" onClick={handleNewAssignment}>
                <span className="btn-icon">+</span>
                Nieuwe Opdracht
              </button>
            </div>
            {customer.assignments && customer.assignments.length > 0 ? (
              <div className="assignments-list">
                {customer.assignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="assignment-card"
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <div className="assignment-header">
                      <h4 className="assignment-title">{assignment.titel}</h4>
                      <span className={`assignment-status status-${assignment.status}`}>
                        {assignment.status}
                      </span>
                    </div>
                    {assignment.beschrijving && (
                      <p className="assignment-description">{assignment.beschrijving}</p>
                    )}
                    <div className="assignment-footer">
                      <span className="assignment-date">
                        {format(new Date(assignment.start_datum), 'd MMMM yyyy', { locale: nl })}
                        {assignment.eind_datum && 
                          ` - ${format(new Date(assignment.eind_datum), 'd MMMM yyyy', { locale: nl })}`
                        }
                      </span>
                      {assignment.kosten && (
                        <span className="assignment-cost">
                          €{parseFloat(assignment.kosten).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-assignments">Nog geen opdrachten</p>
            )}
          </div>
        </div>

        <div className="customer-detail-actions">
          <button className="btn-secondary" onClick={onEdit}>
            Bewerken
          </button>
          <button className="btn-primary" onClick={onClose}>
            Sluiten
          </button>
        </div>
      </div>

      {showAssignmentModal && (
        <AssignmentModal
          assignment={selectedAssignment}
          customerId={customer.id}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedAssignment(null);
          }}
          onSave={handleSaveAssignment}
          onDelete={handleDeleteAssignment}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}

      {showAssignmentDetail && selectedAssignmentDetail && (
        <div className="modal-overlay" onClick={() => setShowAssignmentDetail(false)}>
          <div className="modal-content assignment-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Opdracht Details</h2>
              <button className="modal-close" onClick={() => setShowAssignmentDetail(false)}>×</button>
            </div>

            <div className="assignment-detail-content">
              <div className="detail-section">
                <h3>Titel</h3>
                <p className="detail-value">{selectedAssignmentDetail.titel}</p>
              </div>

              {selectedAssignmentDetail.beschrijving && (
                <div className="detail-section">
                  <h3>Beschrijving</h3>
                  <p className="detail-value">{selectedAssignmentDetail.beschrijving}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Datum</h3>
                <p className="detail-value">
                  {format(new Date(selectedAssignmentDetail.start_datum), 'EEEE d MMMM yyyy', { locale: nl })}
                  {selectedAssignmentDetail.eind_datum && 
                    ` - ${format(new Date(selectedAssignmentDetail.eind_datum), 'EEEE d MMMM yyyy', { locale: nl })}`
                  }
                </p>
              </div>

              <div className="detail-section">
                <h3>Status</h3>
                <span className={`assignment-status status-${selectedAssignmentDetail.status}`}>
                  {selectedAssignmentDetail.status}
                </span>
              </div>

              {selectedAssignmentDetail.kosten && (
                <div className="detail-section">
                  <h3>Kosten</h3>
                  <p className="detail-value">€{parseFloat(selectedAssignmentDetail.kosten).toFixed(2)}</p>
                </div>
              )}

              {selectedAssignmentDetail.source === 'appointment' && selectedAssignmentDetail.appointment && (
                <div className="detail-section">
                  <h3>Tijd</h3>
                  <p className="detail-value">
                    {format(new Date(selectedAssignmentDetail.appointment.start_datum), 'HH:mm')}
                    {selectedAssignmentDetail.appointment.eind_datum && 
                      ` - ${format(new Date(selectedAssignmentDetail.appointment.eind_datum), 'HH:mm')}`
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAssignmentDetail(false)}>
                Sluiten
              </button>
              <button className="btn-primary" onClick={handleEditFromDetail}>
                Bewerken
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
