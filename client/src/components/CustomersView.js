import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomersView.css';
import CustomerModal from './CustomerModal';
import CustomerDetail from './CustomerDetail';
import { FaUsers, FaSearch, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const CustomersView = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Fout bij laden klanten:', error);
      alert('Kon klanten niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = async (customer) => {
    try {
      const response = await axios.get(`/api/customers/${customer.id}`);
      setSelectedCustomer(response.data);
      setShowDetail(true);
    } catch (error) {
      console.error('Fout bij laden klant details:', error);
      alert('Kon klant details niet laden');
    }
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (selectedCustomer) {
        await axios.put(`/api/customers/${selectedCustomer.id}`, customerData);
      } else {
        await axios.post('/api/customers', customerData);
      }
      await loadCustomers();
      setShowModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Fout bij opslaan klant:', error);
      alert('Kon klant niet opslaan');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      return;
    }
    try {
      await axios.delete(`/api/customers/${id}`);
      await loadCustomers();
      setShowModal(false);
      setShowDetail(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Fout bij verwijderen klant:', error);
      alert('Kon klant niet verwijderen');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.bedrijf && customer.bedrijf.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="customers-view">
      <div className="customers-header">
        <h2>
          <FaUsers className="header-icon" />
          Klantenbestand
        </h2>
        <button className="btn-primary" onClick={handleNewCustomer}>
          <span className="btn-icon">+</span>
          Nieuwe Klant
        </button>
      </div>

      <div className="search-bar">
        <div className="search-icon-wrapper">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Zoek op naam, email of bedrijf..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Laden...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="no-customers">
          {searchTerm ? 'Geen klanten gevonden' : 'Nog geen klanten toegevoegd'}
        </div>
      ) : (
        <div className="customers-grid">
          {filteredCustomers.map(customer => (
            <div
              key={customer.id}
              className="customer-card"
              onClick={() => handleCustomerClick(customer)}
            >
              <div className="customer-card-header">
                <h3>{customer.naam}</h3>
                {customer.bedrijf && (
                  <span className="customer-company">{customer.bedrijf}</span>
                )}
              </div>
              <div className="customer-card-body">
                {customer.email && (
                  <div className="customer-info">
                    <FaEnvelope className="info-icon" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.telefoon && (
                  <div className="customer-info">
                    <FaPhone className="info-icon" />
                    <span>{customer.telefoon}</span>
                  </div>
                )}
                {customer.adres && (
                  <div className="customer-info">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{customer.adres}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowModal(false);
            setSelectedCustomer(null);
          }}
          onSave={handleSaveCustomer}
          onDelete={handleDeleteCustomer}
        />
      )}

      {showDetail && selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => {
            setShowDetail(false);
            setSelectedCustomer(null);
          }}
          onEdit={() => {
            setShowDetail(false);
            setShowModal(true);
          }}
          onRefresh={loadCustomers}
        />
      )}
    </div>
  );
};

export default CustomersView;
