import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, Upload, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const IllRegister = () => {
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();

  // Form State
  const [symptoms, setSymptoms] = useState([]);
  const [date, setDate] = useState('');
  const [details, setDetails] = useState('');

  const availableSymptoms = ['Fever', 'Cough', 'Headache', 'Stomach ache', 'Body pain', 'Vomiting'];

  useEffect(() => {
    if (currentUser) {
      fetchReports();
    }
  }, [currentUser]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'illness_reports'), where('studentId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReports(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomToggle = (symp) => {
    if (symptoms.includes(symp)) {
      setSymptoms(symptoms.filter(s => s !== symp));
    } else {
      setSymptoms([...symptoms, symp]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (symptoms.length === 0 || !date) return toast.error('Please provide symptoms and date of onset');

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'illness_reports'), {
        studentId: currentUser.uid,
        studentName: currentUser.displayName || currentUser.email,
        symptoms: symptoms.join(', '),
        date,
        details,
        status: 'Pending',
        doctor: 'Unassigned',
        createdAt: new Date().toISOString()
      });
      toast.success('Illness report submitted');
      setShowForm(false);
      setSymptoms([]);
      setDate('');
      setDetails('');
      fetchReports();
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ill Register</h1>
          <p className="text-gray-500 mt-1">Report illness to campus health center and apply for medical leave.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          {showForm ? 'Cancel' : <><PlusCircle className="h-4 w-4 mr-2" /> Report Illness</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-blue-900">New Illness Report</h2>
          </div>
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Symptoms</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableSymptoms.map(symp => (
                    <label key={symp} className="flex items-center space-x-2 text-sm text-gray-600 border rounded-md p-2 hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={symptoms.includes(symp)}
                        onChange={() => handleSymptomToggle(symp)}
                        className="rounded text-primary focus:ring-primary" 
                      />
                      <span>{symp}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Onset</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <textarea value={details} onChange={e=>setDetails(e.target.value)} rows={3} placeholder="Please describe how you are feeling..." className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={submitting || symptoms.length === 0 || !date}
                className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Illness History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Symptoms</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-500">
                    No illness reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-500">{report.date}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{report.symptoms}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{report.doctor}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(report.status)}</td>
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

export default IllRegister;
