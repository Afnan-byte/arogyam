import React, { useState, useEffect } from 'react';
import { Droplet, PlusCircle, Calendar, Trash, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const WaterFilters = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  
  // Form State
  const [filterId, setFilterId] = useState('');
  const [location, setLocation] = useState('');
  const [initialDate, setInitialDate] = useState('');
  const [cycleDays, setCycleDays] = useState(30);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'water_filters'));
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setFilters(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load water filters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!filterId || !location || !initialDate) return toast.error('Please fill all fields');
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'water_filters'), {
        filterId,
        location,
        lastCleaned: initialDate,
        nextCleaning: calculateNextDate(initialDate, cycleDays),
        cycleDays: Number(cycleDays),
        status: 'Clean'
      });
      toast.success('Water filter added');
      setShowForm(false);
      setFilterId('');
      setLocation('');
      setInitialDate('');
      fetchFilters();
    } catch (error) {
      toast.error('Failed to add filter');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateNextDate = (lastDate, days) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + Number(days));
    return date.toISOString().split('T')[0];
  };

  const logCleaning = async (id, currentCycleDays) => {
    setSubmittingId(id);
    try {
      const today = new Date().toISOString().split('T')[0];
      await updateDoc(doc(db, 'water_filters', id), {
        lastCleaned: today,
        nextCleaning: calculateNextDate(today, currentCycleDays),
        status: 'Clean'
      });
      toast.success('Cleaning logged successfully');
      fetchFilters();
    } catch (error) {
      toast.error('Failed to log cleaning');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this filter?')) {
      setSubmittingId(`delete-${id}`);
      try {
        await deleteDoc(doc(db, 'water_filters', id));
        toast.success('Filter removed');
        fetchFilters();
      } catch (error) {
        toast.error('Failed to remove filter');
      } finally {
        setSubmittingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Water Filter Maintenance</h1>
          <p className="text-gray-500 mt-1">Track cleaning schedules to prevent water-borne diseases.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : <><PlusCircle className="h-4 w-4 mr-2" /> Add Filter Location</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center">
            <Droplet className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-blue-900">New Water Filter</h2>
          </div>
          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter ID / Name</label>
                <input type="text" value={filterId} onChange={e=>setFilterId(e.target.value)} placeholder="e.g. WF-04" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Block B, 3rd Floor" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" /> Initial Cleaning Date
                </label>
                <input type="date" value={initialDate} onChange={e=>setInitialDate(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Cycle (Days)</label>
                <input type="number" value={cycleDays} onChange={e=>setCycleDays(e.target.value)} min="1" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={submitting || !filterId || !location || !initialDate}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Filter
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter Location</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Cleaned</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Cleaning</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Loading filters...</p>
                  </td>
                </tr>
              ) : filters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500">
                    No water filters found.
                  </td>
                </tr>
              ) : (
                filters.map((filter) => {
                  const isOverdue = new Date(filter.nextCleaning) < new Date();
                  return (
                    <tr key={filter.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{filter.filterId}</div>
                        <div className="text-sm text-gray-500">{filter.location}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{filter.lastCleaned}</td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{filter.nextCleaning}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue ? 'Overdue' : 'Clean'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button 
                          onClick={() => logCleaning(filter.id, filter.cycleDays)} 
                          disabled={submittingId === filter.id || submittingId === `delete-${filter.id}`}
                          className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-50 mr-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                        >
                          {submittingId === filter.id && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          Log Cleaning
                        </button>
                        <button 
                          onClick={() => handleDelete(filter.id)} 
                          disabled={submittingId === filter.id || submittingId === `delete-${filter.id}`}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 align-middle inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingId === `delete-${filter.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WaterFilters;
