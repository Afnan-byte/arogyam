import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, MapPin, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'complaints'));
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setComplaints(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!newStatus || newStatus === 'Update Status') return;
    try {
      await updateDoc(doc(db, 'complaints', id), { status: newStatus });
      toast.success('Complaint updated');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</span>;
      case 'In Progress': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'Pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" /> Pending</span>;
      default: return null;
    }
  };

  const filteredComplaints = complaints.filter(cmp => 
    cmp.category?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cmp.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
          <p className="text-gray-500 mt-1">Review and assign campus maintenance issues.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Search complaints..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-accent focus:border-accent text-sm shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reporter</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Loading complaints...</p>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">{new Date(cmp.date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{cmp.category}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {cmp.location}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{cmp.reportedBy}</td>
                    <td className="py-4 px-6">
                      {getStatusBadge(cmp.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select 
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                        value={cmp.status}
                        onChange={(e) => updateStatus(cmp.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
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

export default AdminComplaints;
