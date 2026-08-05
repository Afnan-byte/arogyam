import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPatients(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Database</h1>
          <p className="text-gray-500 mt-1">Search and view student medical records.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-secondary focus:border-secondary text-sm shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Loading patients...</p>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-10 text-center text-gray-500">
                    No patients found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold mr-3">
                          {patient.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{patient.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{patient.email}</td>
                    <td className="py-4 px-6 text-sm text-right">
                      <button className="text-secondary hover:text-green-700 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
