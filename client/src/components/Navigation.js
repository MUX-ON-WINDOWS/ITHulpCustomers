import React from 'react';
import { FaCalendarAlt, FaUsers, FaUserCog } from 'react-icons/fa';
import './Navigation.css';

const Navigation = ({ activeView, setActiveView, isAdmin }) => {
  return (
    <nav className="navigation">
      <button
        className={`nav-button ${activeView === 'calendar' ? 'active' : ''}`}
        onClick={() => setActiveView('calendar')}
      >
        <FaCalendarAlt className="nav-icon" />
        Agenda
      </button>
      <button
        className={`nav-button ${activeView === 'customers' ? 'active' : ''}`}
        onClick={() => setActiveView('customers')}
      >
        <FaUsers className="nav-icon" />
        Klantenbestand
      </button>
      {isAdmin && (
        <button
          className={`nav-button ${activeView === 'users' ? 'active' : ''}`}
          onClick={() => setActiveView('users')}
        >
          <FaUserCog className="nav-icon" />
          Gebruikersbeheer
        </button>
      )}
    </nav>
  );
};

export default Navigation;
