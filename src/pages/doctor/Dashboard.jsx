import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock, FileText, Check, X, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
    <div className={`p-4 rounded-lg ${color} mr-4`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [illnessReports, setIllnessReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchIllnessReports();
  }, []);

  const fetchIllnessReports = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'illness_reports'));
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setIllnessReports(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    const doctorName = currentUser?.displayName || currentUser?.email || 'Dr. Smith';
    setIllnessReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus, doctor: doctorName } : r));
    toast.success(`Report marked as ${newStatus}`);

    try {
      await updateDoc(doc(db, 'illness_reports', reportId), {
        status: newStatus,
        doctor: doctorName
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to sync status change');
      fetchIllnessReports();
    }
  };

  const pendingCount = illnessReports.filter(r => r.status === 'Pending').length;
  const approvedCount = illnessReports.filter(r => r.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage patient medical leave requests and appointments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Appointments" value="8" icon={Calendar} color="bg-primary" />
        <StatCard title="Total Patients" value="124" icon={Users} color="bg-secondary" />
        <StatCard title="Pending Leave Approvals" value={pendingCount.toString()} icon={Clock} color="bg-accent" />
        <StatCard title="Approved Leave Requests" value={approvedCount.toString()} icon={CheckCircle} color="bg-emerald-600" />
      </div>

      {/* Student Illness Reports for Approval */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Student Illness Leave Requests</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-primary">
            {pendingCount} Pending Approval
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Course / Branch</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Symptoms</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Classes Missed</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Onset Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : illnessReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500 text-sm">
                    No student illness reports submitted yet.
                  </td>
                </tr>
              ) : (
                illnessReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{report.studentName || 'Student'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{report.courseDetails || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{report.symptoms}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-medium">{report.classesMissed || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{report.date}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {report.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'Rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Reviewed by {report.doctor || 'Doctor'}</span>
                      )}
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

export default Dashboard;
