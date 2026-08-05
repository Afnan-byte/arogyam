import React from 'react';
import { FileText, Calendar, Pill, Activity } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Student</h1>
        <p className="text-gray-500 mt-1">Here is your campus health overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Upcoming Appointments" value="1" icon={Calendar} color="bg-primary" />
        <StatCard title="Active Prescriptions" value="2" icon={Pill} color="bg-secondary" />
        <StatCard title="Pending Leaves" value="0" icon={FileText} color="bg-accent" />
        <StatCard title="Health Status" value="Good" icon={Activity} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">No recent activity.</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 text-sm">Flu Vaccine Drive</h4>
              <p className="text-blue-700 text-sm mt-1">Campus health center is organizing a flu vaccine drive this weekend.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
