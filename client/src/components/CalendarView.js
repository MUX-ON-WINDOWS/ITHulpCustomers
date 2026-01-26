import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';
import { format } from 'date-fns';
import nl from 'date-fns/locale/nl';
import axios from 'axios';
import AppointmentModal from './AppointmentModal';
import { FaCalendarAlt, FaList, FaUser } from 'react-icons/fa';

const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Fout bij laden afspraken:', error);
      alert('Kon afspraken niet laden');
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => {
      const aptDate = format(new Date(apt.start_datum), 'yyyy-MM-dd');
      return aptDate === dateStr;
    });
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setShowModal(true);
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (selectedAppointment) {
        await axios.put(`/api/appointments/${selectedAppointment.id}`, appointmentData);
      } else {
        await axios.post('/api/appointments', appointmentData);
      }
      await loadAppointments();
      setShowModal(false);
      setSelectedAppointment(null);
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
      await loadAppointments();
      setShowModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Fout bij verwijderen afspraak:', error);
      alert('Kon afspraak niet verwijderen');
    }
  };

  const dayAppointments = getAppointmentsForDate(date);

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>
          <FaCalendarAlt className="header-icon" />
          Agenda
        </h2>
        <button className="btn-primary" onClick={handleNewAppointment}>
          <span className="btn-icon">+</span>
          Nieuwe Afspraak
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dayApps = getAppointmentsForDate(date);
                if (dayApps.length > 0) {
                  return (
                    <div className="calendar-dot">
                      <span className="dot-count">{dayApps.length}</span>
                    </div>
                  );
                }
              }
              return null;
            }}
          />
        </div>

        <div className="appointments-sidebar">
          <h3>
            <FaList className="sidebar-icon" />
            <span>{format(date, 'EEEE d MMMM yyyy', { locale: nl })}</span>
          </h3>
          {loading ? (
            <p>Laden...</p>
          ) : dayAppointments.length === 0 ? (
            <p className="no-appointments">Geen afspraken voor deze dag</p>
          ) : (
            <div className="appointments-list">
              {dayAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="appointment-card"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="appointment-time">
                    {format(new Date(appointment.start_datum), 'HH:mm')}
                    {appointment.eind_datum && 
                      ` - ${format(new Date(appointment.eind_datum), 'HH:mm')}`
                    }
                  </div>
                  <div className="appointment-title">{appointment.titel}</div>
                  {appointment.customer_naam && (
                    <div className="appointment-customer">
                      <FaUser className="customer-icon" />
                      {appointment.customer_naam}
                    </div>
                  )}
                  <div className={`appointment-status status-${appointment.status}`}>
                    {appointment.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          selectedDate={date}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
};

export default CalendarView;
