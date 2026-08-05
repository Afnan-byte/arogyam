import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Menu, 
  X, 
  Bell, 
  LogOut,
  Home,
  Calendar,
  FileText,
  Pill,
  MessageSquareWarning,
  Users,
  Settings,
  Activity,
  Droplet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define navigation items based on role
const getNavigation = (role) => {
  const common = [];
  
  if (role === 'student') {
    return [
      { name: 'Dashboard', href: '/student', icon: Home },
      { name: 'Health Profile', href: '/student/profile', icon: Activity },
      { name: 'Ill Register', href: '/student/ill-register', icon: FileText },
      { name: 'Appointments', href: '/student/appointments', icon: Calendar },
      { name: 'Medicines', href: '/student/medicines', icon: Pill },
      { name: 'Complaints', href: '/student/complaints', icon: MessageSquareWarning },
      { name: 'Community', href: '/student/community', icon: Users },
    ];
  }
  
  if (role === 'doctor') {
    return [
      { name: 'Dashboard', href: '/doctor', icon: Home },
      { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
      { name: 'Patients', href: '/doctor/patients', icon: Users },
      { name: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
    ];
  }
  
  if (role === 'admin') {
    return [
      { name: 'Dashboard', href: '/admin', icon: Home },
      { name: 'Students', href: '/admin/students', icon: Users },
      { name: 'Doctors', href: '/admin/doctors', icon: Activity },
      { name: 'Complaints', href: '/admin/complaints', icon: MessageSquareWarning },
      { name: 'Water Filters', href: '/admin/water-filters', icon: Droplet },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];
  }
  
  return common;
};

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  const navigation = getNavigation(role);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <Link to={`/${role}`} className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="Arogyam Logo" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
              <span className="font-bold text-2xl text-gray-900 tracking-tight">Arogya</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-900">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-900 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center justify-end flex-1 space-x-4">
            <button className="p-2 text-gray-400 hover:text-primary relative transition-colors rounded-full hover:bg-gray-100">
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : role.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 capitalize">{role} User</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
