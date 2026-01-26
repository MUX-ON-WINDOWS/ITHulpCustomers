import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import Login from './components/Login';
import Header from './components/Header';
import Navigation from './components/Navigation';
import CalendarView from './components/CalendarView';
import CustomersView from './components/CustomersView';
import UsersView from './components/UsersView';

function AppContent() {
  const [activeView, setActiveView] = useState('calendar');
  const { user, loading, logout, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Laden...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <Header user={user} onLogout={logout} />
      <Navigation activeView={activeView} setActiveView={setActiveView} isAdmin={isAdmin()} />
      <main className="main-content">
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'customers' && <CustomersView />}
        {activeView === 'users' && isAdmin() && <UsersView />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
