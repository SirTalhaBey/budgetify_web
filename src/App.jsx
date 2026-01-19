// src/App.jsx

import React, { useState, useEffect } from 'react';
import Navigasyon from './components/Navigasyon';
import Dashboard from './components/Dashboard';
import GelirGiderFormu from './components/GelirGiderFormu';
import Grafikler from './components/Grafikler';
import KategoriYonetimi from './components/KategoriYonetimi';
import GirisEkrani from './components/GirisEkrani';
import { getCurrentUser, logout } from './lib/auth';

import './assets/App.css';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For refreshing data after add

  // Check if user is already logged in on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  // Trigger data refresh (called after adding transaction)
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Navigate to a tab and optionally refresh
  const navigateTo = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      refreshData();
    }
  };

  const renderContent = () => {
    const userId = user?.id;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshKey} userId={userId} setActiveTab={setActiveTab} />;
      case 'add':
        return <GelirGiderFormu userId={userId} onSuccess={() => navigateTo('dashboard')} />;
      case 'charts':
        return <Grafikler key={refreshKey} userId={userId} />;
      case 'categories':
        return <KategoriYonetimi userId={userId} />;
      default:
        return <Dashboard key={refreshKey} userId={userId} setActiveTab={setActiveTab} />;
    }
  };

  // Get user display name
  const userName = user?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const userInitials = userName.substring(0, 2).toUpperCase();

  let content;
  if (!isLoggedIn) {
    content = (
      <div className="auth-page-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#071023,#05101a)' }}>
        <GirisEkrani setIsLoggedIn={handleLoginSuccess} />
      </div>
    );
  } else {
    content = (
      <div className="app-main-layout">
        <a href="#main" className="skip-link">İçeriğe atla</a>
        <Navigasyon activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="main-area">
          <header className="topbar">
            <h1>Budgetify</h1>
            <div className="user-info">
              <div className="small-muted">Hoşgeldin, {userName}</div>
              <div className="avatar">{userInitials}</div>
              <button className="logout-button" onClick={handleLogout} aria-label="Çıkış Yap">Çıkış</button>
            </div>
          </header>

          <main id="main" className="content-area container">
            {renderContent()}
          </main>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {content}
    </ErrorBoundary>
  );
}

export default App;