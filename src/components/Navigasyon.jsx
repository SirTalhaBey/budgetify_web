// src/components/Navigasyon.jsx

import React from 'react';
import { FiHome, FiPlusCircle, FiPieChart, FiList } from 'react-icons/fi';
import Logo from './Logo';

const Navigasyon = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <FiHome /> },
    { id: 'add', name: 'Gelir/Gider Ekle', icon: <FiPlusCircle /> },
    { id: 'charts', name: 'Grafikler', icon: <FiPieChart /> },
    { id: 'categories', name: 'Kategori Yönetimi', icon: <FiList /> },
  ];

  return (
    <div className="sidebar">
      <div className="brand-mark brand-mark-sidebar">
        <Logo size={26} className="brand-logo" />
        <h2>Budgetify</h2>
      </div>
      <nav>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            aria-label={tab.name}
          >
            <span style={{display:'inline-flex',alignItems:'center',fontSize:18}}>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Navigasyon;