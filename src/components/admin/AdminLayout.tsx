import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { StaffProfile } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Helper to get current path
const getCurrentPath = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '/admin';
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/admin');

  useEffect(() => {
    checkSession();
    setCurrentPath(getCurrentPath());
    
    // Update path on navigation
    const handleLocationChange = () => {
      setCurrentPath(getCurrentPath());
    };
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProfile(data.data.profile);
        } else {
          window.location.href = '/admin/login';
        }
      } else {
        window.location.href = '/admin/login';
      }
    } catch (err) {
      console.error('Session check error:', err);
      window.location.href = '/admin/login';
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Panel
              </h1>
              {profile && (
                <p className="text-sm text-gray-600 mt-1">
                  {profile.fullName || profile.email} ({profile.role === 'owner' ? 'Vlasnik' : 'Osoblje'})
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Početna stranica
              </a>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Odjavi se
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/admin"
              className={`border-b-2 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium ${
                currentPath === '/admin'
                  ? 'border-rose-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Rezervacije
            </a>
            {profile?.role === 'owner' && (
              <>
            <a
              href="/admin/services"
              className={`border-b-2 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium ${
                currentPath === '/admin/services'
                  ? 'border-rose-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Usluge
            </a>
            <a
              href="/admin/staff"
              className={`border-b-2 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium ${
                currentPath === '/admin/staff'
                  ? 'border-rose-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Osoblje
            </a>
            <a
              href="/admin/settings"
              className={`border-b-2 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium ${
                currentPath === '/admin/settings'
                  ? 'border-rose-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Postavke
            </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

