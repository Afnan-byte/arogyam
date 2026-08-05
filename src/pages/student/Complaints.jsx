import React, { useState, useEffect } from 'react';
import { PlusCircle, MessageSquareWarning, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Complaints = () => {
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();

  // Form State
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const categories = [
    'Stray Dogs', 'Water Issue', 'Mosquitoes', 'Cleanliness', 'Infrastructure', 'Other'
  ];

  useEffect(() => {
    if (currentUser) {
      fetchComplaints();
    }
  }, [currentUser]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'complaints'), where('studentId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setComplaints(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !location || !description) return toast.error('Please fill all required fields');
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        studentId: currentUser.uid,
        reportedBy: currentUser.email,
        category,
        location,
        description,
        status: 'Pending',
        date: new Date().toISOString()
      });
      toast.success('Complaint submitted successfully');
      setShowForm(false);
      setCategory('');
      setLocation('');
      setDescription('');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Register</h1>
          <p className="text-gray-500 mt-1">Report campus issues directly to administration.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : <><PlusCircle className="h-4 w-4 mr-2" /> New Complaint</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-yellow-50/50 px-6 py-4 border-b border-yellow-100 flex items-center">
            <AlertCircle className="w-5 h-5 text-accent mr-2" />
            <h2 className="text-lg font-semibold text-yellow-900">File a Complaint</h2>
          </div>
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm border p-2">
                  <option value="">Select a category</option>
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-500" /> Exact Location
                </label>
                <input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Block C, near entrance" className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm border p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Describe the issue in detail..." className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm border p-2"></textarea>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={submitting || !category || !location || !description}
                className="bg-accent hover:bg-yellow-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints History */}
      {loading ? (
        <div className="py-10 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm border border-gray-100">
          No complaints reported by you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map(cmp => (
            <div key={cmp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900 capitalize">{cmp.status}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cmp.status)}`}>
                  {cmp.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{cmp.category}</h3>
              <p className="text-sm text-gray-500 flex items-center mb-3">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {cmp.location}
              </p>
              <div className="text-xs text-gray-400 pt-3 border-t border-gray-100">
                Reported on {new Date(cmp.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Complaints;
