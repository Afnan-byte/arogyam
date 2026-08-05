import React from 'react';
import { Users, AlertTriangle, Droplet, Activity } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Campus healthcare system analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="2,450" icon={Users} color="bg-primary" />
        <StatCard title="Active Patients" value="34" icon={Activity} color="bg-secondary" />
        <StatCard title="Open Complaints" value="12" icon={AlertTriangle} color="bg-accent" />
        <StatCard title="Filters Maintenance" value="5" icon={Droplet} color="bg-blue-500" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80 flex items-center justify-center">
          <p className="text-gray-500">Disease Analytics Chart Placeholder (Recharts)</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80 flex items-center justify-center">
          <p className="text-gray-500">Complaint Distribution Chart Placeholder (Recharts)</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
