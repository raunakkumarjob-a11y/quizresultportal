import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StudentResultForm from './components/StudentResultForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { initializeData } from './utils/storage';
import { Settings, User } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<'student' | 'admin-login' | 'admin-dashboard'>('student');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    initializeData();
    if (isAuthenticated) {
      setCurrentView('admin-dashboard');
    }
  }, [isAuthenticated]);

  const handleAdminLogin = () => {
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setCurrentView('student');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      {currentView !== 'admin-dashboard' && (
        <nav className="absolute top-4 right-4 z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'student'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-sm border border-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              Student Portal
            </button>
            
            <button
              onClick={() => setCurrentView('admin-login')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'admin-login'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-sm border border-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Admin Login
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      {currentView === 'student' && <StudentResultForm />}
      {currentView === 'admin-login' && <AdminLogin onLogin={handleAdminLogin} />}
      {currentView === 'admin-dashboard' && <AdminDashboard onLogout={handleLogout} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;