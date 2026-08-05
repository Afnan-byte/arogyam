import React from 'react';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your appointments and patients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Appointments" value="8" icon={Calendar} color="bg-primary" />
        <StatCard title="Total Patients" value="124" icon={Users} color="bg-secondary" />
        <StatCard title="Pending Approvals" value="3" icon={Clock} color="bg-accent" />
        <StatCard title="Completed Consultations" value="45" icon={CheckCircle} color="bg-blue-500" />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Reason</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 text-sm text-gray-900" colSpan="4">No appointments scheduled for today.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
