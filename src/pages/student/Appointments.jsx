import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronRight, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:00 PM'];

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Doctors
      const qDoc = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const docSnap = await getDocs(qDoc);
      const docsData = [];
      docSnap.forEach(doc => docsData.push({ id: doc.id, ...doc.data() }));
      setDoctors(docsData);

      // Fetch My Appointments
      const qApt = query(collection(db, 'appointments'), where('studentId', '==', currentUser.uid));
      const aptSnap = await getDocs(qApt);
      const aptData = [];
      aptSnap.forEach(doc => aptData.push({ id: doc.id, ...doc.data() }));
      aptData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAppointments(aptData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedTime) {
      return toast.error('Please select doctor, date, and time');
    }
    
    const docObj = doctors.find(d => d.id === selectedDoctor);
    
    try {
      await addDoc(collection(db, 'appointments'), {
        studentId: currentUser.uid,
        patientName: currentUser.displayName || currentUser.email,
        doctorId: selectedDoctor,
        doctorName: docObj.name,
        date,
        time: selectedTime,
        status: 'Pending',
        type: 'General Checkup',
        createdAt: new Date().toISOString()
      });
      toast.success('Appointment booked successfully!');
      setSelectedDoctor(null);
      setDate('');
      setSelectedTime('');
      fetchData();
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 mt-1">Schedule a consultation with campus doctors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Doctor</h2>
          <div className="space-y-3">
            {doctors.length === 0 && !loading && (
              <p className="text-sm text-gray-500">No doctors available.</p>
            )}
            {doctors.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc.id)}
                className={`p-4 rounded-xl border ${selectedDoctor === doc.id ? 'border-primary ring-1 ring-primary bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'} cursor-pointer transition-all`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 bg-primary`}>
                    {doc.name?.charAt(0)?.toUpperCase() || 'D'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{doc.name}</h3>
                    <p className="text-xs text-gray-500">General Physician</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${selectedDoctor === doc.id ? 'text-primary' : 'text-gray-400'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduling Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Select Date & Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2 text-primary" /> Pick a Date
                </label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!selectedDoctor}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-3 disabled:bg-gray-50 disabled:text-gray-400" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-secondary" /> Available Slots
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedTime(slot)}
                      disabled={!selectedDoctor || !date}
                      className={`py-2 px-3 text-sm border rounded-md focus:outline-none transition-colors ${
                        selectedTime === slot 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-gray-200 hover:border-primary hover:text-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 flex justify-end">
              <button 
                onClick={handleBook}
                disabled={!selectedDoctor || !date || !selectedTime}
                className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Appointment
              </button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">My Appointments</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                You have no upcoming appointments.
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {appointments.map(apt => (
                  <div key={apt.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-primary text-center min-w-[70px]">
                      <span className="block text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="block text-xl font-bold">{new Date(apt.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{apt.type}</h4>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <User className="w-3 h-3 mr-1" /> {apt.doctorName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {apt.time}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        apt.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Appointments;
