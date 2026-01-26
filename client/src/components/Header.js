import React from 'react';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <h1>
            IT Hulp <span className="logo-accent">aan Huis</span>
          </h1>
          <p>Klantensysteem</p>
        </div>
        <div className="header-user">
          <span className="user-info">
            {user.voornaam && user.achternaam 
              ? `${user.voornaam} ${user.achternaam}` 
              : user.gebruikersnaam}
            {user.rol === 'admin' && <span className="user-role">Admin</span>}
          </span>
          <button className="btn-logout" onClick={onLogout}>
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
