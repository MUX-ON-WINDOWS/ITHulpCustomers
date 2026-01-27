import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UsersView.css';
import UserModal from './UserModal';
import { FaUserCog } from 'react-icons/fa';

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fout bij laden gebruikers:', error);
      alert('Kon gebruikers niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        await axios.put(`/api/users/${selectedUser.id}`, userData);
      } else {
        await axios.post('/api/auth/register', userData);
      }
      await loadUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Fout bij opslaan gebruiker:', error);
      alert(error.response?.data?.error || 'Kon gebruiker niet opslaan');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      return;
    }
    try {
      await axios.delete(`/api/users/${id}`);
      await loadUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Fout bij verwijderen gebruiker:', error);
      alert('Kon gebruiker niet verwijderen');
    }
  };

  return (
    <div className="users-view">
      <div className="users-header">
        <h2>
          <FaUserCog className="header-icon" />
          Gebruikersbeheer
        </h2>
        <button className="btn-primary" onClick={handleNewUser}>
          <span className="btn-icon">+</span>
          Nieuwe Gebruiker
        </button>
      </div>

      {loading ? (
        <div className="loading">Laden...</div>
      ) : users.length === 0 ? (
        <div className="no-users">Nog geen gebruikers</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Naam</th>
                <th>Gebruikersnaam</th>
                <th>Email</th>
                <th>Werkadres</th>
                <th>Rol</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    {user.voornaam && user.achternaam
                      ? `${user.voornaam} ${user.achternaam}`
                      : '-'}
                  </td>
                  <td>{user.gebruikersnaam}</td>
                  <td>{user.email}</td>
                  <td>{user.werkadres || '-'}</td>
                  <td>
                    <span className={`role-badge role-${user.rol}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.actief ? 'active' : 'inactive'}`}>
                      {user.actief ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditUser(user)}
                    >
                      Bewerken
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default UsersView;
