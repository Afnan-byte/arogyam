import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser, date]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'appointments'), 
        where('doctorId', '==', currentUser.uid),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Sort by time
      data.sort((a, b) => a.time.localeCompare(b.time));
      setAppointments(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your daily consultation schedule.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-secondary focus:border-secondary shadow-sm text-sm p-2 border"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-secondary" /> Schedule for {date}
          </h2>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{appointments.length} Appointments</span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto" />
              <p className="text-gray-500 mt-2">Loading schedule...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No appointments scheduled for this date.
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex-shrink-0 w-32">
                  <div className="flex items-center text-gray-900 font-bold mb-1">
                    <Clock className="w-4 h-4 mr-1 text-secondary" /> {apt.time}
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${
                    apt.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {apt.status}
                  </div>
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold mr-3">
                      {apt.patientName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{apt.patientName}</h3>
                      <p className="text-sm text-gray-500">{apt.type || 'Consultation'}</p>
                    </div>
                  </div>
                  {apt.notes && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-gray-700 mt-3">
                      <span className="font-semibold text-yellow-800">Notes: </span>{apt.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  {apt.status === 'Pending' ? (
                    <>
                      <button onClick={() => updateStatus(apt.id, 'Completed')} className="bg-secondary hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Mark Completed
                      </button>
                      <button onClick={() => updateStatus(apt.id, 'Cancelled')} className="bg-white border border-gray-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                        <XCircle className="w-4 h-4 mr-1.5" /> Cancel
                      </button>
                    </>
                  ) : (
                    <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
