import React, { useState } from 'react';
import './Modal.css';

const UserAssignmentModal = ({ assignedUsers, allUsers, onAssign }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(
    assignedUsers.map(u => u.id)
  );

  const handleOpen = () => {
    setSelectedUserIds(assignedUsers.map(u => u.id));
    setShowModal(true);
  };

  const handleSave = () => {
    onAssign(selectedUserIds);
    setShowModal(false);
  };

  const toggleUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  return (
    <>
      <button className="btn-primary btn-small" onClick={handleOpen}>
        {assignedUsers.length > 0 ? 'Wijzig Toewijzing' : 'Wijs Gebruikers Toe'}
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gebruikers Toewijzen</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Selecteer gebruikers:</label>
                <div className="users-checkbox-list">
                  {allUsers.map(user => (
                    <label key={user.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                      />
                      <span>
                        {user.voornaam && user.achternaam
                          ? `${user.voornaam} ${user.achternaam}`
                          : user.gebruikersnaam}
                        {user.rol === 'admin' && <span className="role-badge role-admin">Admin</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <div className="modal-actions-right">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Annuleren
                  </button>
                  <button type="button" className="btn-primary" onClick={handleSave}>
                    Opslaan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAssignmentModal;
