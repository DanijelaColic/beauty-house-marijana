import { useEffect, useState } from 'react';
import StaffAvailabilityView from './StaffAvailabilityView';

export default function BookingsList() {
  const [userRole, setUserRole] = useState<'owner' | 'staff' | null>(null);
  const [currentStaffId, setCurrentStaffId] = useState<string | undefined>();
  const [currentStaffName, setCurrentStaffName] = useState<string | undefined>();

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.profile) {
          setUserRole(data.data.profile.role);
          setCurrentStaffId(data.data.profile.id);
          setCurrentStaffName(data.data.profile.fullName || data.data.profile.email);
        }
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    }
  };

  return (
    <div className="space-y-4" id="bookings-container">
      {/* Prikaz dostupnosti (jedini tab) */}
      <StaffAvailabilityView
        userRole={userRole}
        currentStaffId={currentStaffId}
        currentStaffName={currentStaffName}
      />
    </div>
  );
}
