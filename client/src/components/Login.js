import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [gebruikersnaam, setGebruikersnaam] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📝 Form submit:', { gebruikersnaam, wachtwoordLengte: wachtwoord?.length });
    
    const result = await login(gebruikersnaam, wachtwoord);
    
    if (!result.success) {
      console.error('❌ Login mislukt:', result.error);
      setError(result.error);
      setLoading(false);
    } else {
      console.log('✅ Login succesvol!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>
            IT Hulp <span className="logo-accent">aan Huis</span>
          </h1>
          <p>Log in om verder te gaan</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Gebruikersnaam of Email</label>
            <input
              type="text"
              value={gebruikersnaam}
              onChange={(e) => setGebruikersnaam(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Wachtwoord</label>
            <input
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="login-footer">
          <p>Standaard admin: gebruikersnaam <strong>admin</strong>, wachtwoord <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
