'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale/hr';
import type { StaffProfile, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { List, Calendar, Plus, X } from 'lucide-react';
import CreateBookingForm from './CreateBookingForm';
import AdvancedCalendar from './AdvancedCalendar';

interface StaffAvailabilityViewProps {
  userRole: 'owner' | 'staff' | null;
  currentStaffId?: string;
  currentStaffName?: string;
}

export default function StaffAvailabilityView({
  userRole,
  currentStaffId,
  currentStaffName,
}: StaffAvailabilityViewProps) {
  const [staffMembers, setStaffMembers] = useState<StaffProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quickBookingData, setQuickBookingData] = useState<{
    staffId?: string;
    date?: Date;
    time?: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Allow both admin and staff to select any staff member
    // Only auto-select if staff member and no selection made yet
    if (userRole === 'staff' && currentStaffId && !selectedStaffId) {
      setSelectedStaffId(currentStaffId);
    }
  }, [userRole, currentStaffId]);

  useEffect(() => {
    // Reload bookings when staff selection changes or userRole is set
    // For owner: load all bookings (even if no staff selected)
    // For staff: only load if staff is selected
    // Only load if userRole is set (not null) and we're not still loading initial data
    if (!loading && userRole) {
      if (userRole === 'owner' || selectedStaffId) {
        loadBookings();
      }
    }
  }, [selectedStaffId, userRole, loading]);

  // Removed service filtering - no longer needed

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load staff members (for both admin and staff)
      const staffResponse = await fetch('/api/admin/staff', {
        credentials: 'include',
      });
      
      if (!staffResponse.ok) {
        const errorText = await staffResponse.text();
        throw new Error(`Failed to load staff: ${staffResponse.status} ${errorText}`);
      }
      
      const staffData = await staffResponse.json();
      
      if (!staffData.success) {
        throw new Error(staffData.error || 'Failed to load staff members');
      }
      
      if (staffData.data && staffData.data.length > 0) {
        setStaffMembers(staffData.data);
        // Auto-select first staff if no selection yet and user is owner
        if (!selectedStaffId && userRole === 'owner') {
          setSelectedStaffId(staffData.data[0].id);
        }
      } else {
        setError('Nema dostupnih djelatnika');
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      setError(null);
      
      console.log('📥 Loading bookings for availability view...', {
        selectedStaffId,
        userRole,
      });
      
      const response = await fetch('/api/admin/bookings', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Failed to load bookings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Bookings API response:', {
        success: data.success,
        count: data.data?.length || 0,
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load bookings');
      }
      
      const bookingsArray = data.data || [];
      console.log('📋 Raw bookings array:', bookingsArray.length, 'bookings');
      
      const transformedBookings = bookingsArray.map((booking: any) => ({
        ...booking,
        startAt: booking.startAt ? new Date(booking.startAt) : new Date(),
        endAt: booking.endAt ? new Date(booking.endAt) : new Date(),
        createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date(),
      }));
      
      console.log('✅ Transformed bookings:', transformedBookings.length);
      setBookings(transformedBookings);
    } catch (err: any) {
      console.error('❌ Error loading bookings:', err);
      setError(err.message || 'Greška pri učitavanju rezervacija');
      setBookings([]); // Reset bookings on error
    } finally {
      setLoadingBookings(false);
    }
  };

  // Old calendar functions removed - AdvancedCalendar handles everything now

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Učitavanje...</p>
      </div>
    );
  }

  if (error && !loadingBookings) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-800 font-semibold">Greška</p>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadData();
            }}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Pokušaj ponovno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Staff selection - both admin and staff can select any staff */}
          <div>
            <Label htmlFor="staff">Djelatnik {userRole === 'owner' ? '(opcionalno)' : '*'}</Label>
            <select
              id="staff"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required={userRole !== 'owner'}
            >
              {userRole === 'owner' && <option value="">Svi djelatnici (sve rezervacije)</option>}
              {userRole !== 'owner' && <option value="">Odaberi djelatnika</option>}
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName || staff.email}
                </option>
              ))}
            </select>
            {userRole === 'owner' && !selectedStaffId && (
              <p className="mt-1 text-xs text-gray-500">
                Odaberite djelatnika za filtriranje ili ostavite prazno da vidite sve rezervacije
              </p>
            )}
          </div>

        </div>
      </Card>

      {/* Toggle između liste i kalendara + gumb za dodavanje */}
      {/* Show controls even if no staff selected (for admin to see all bookings) */}
      {(selectedStaffId || userRole === 'owner') && (
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova rezervacija</span>
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center space-x-2"
            >
              <List className="w-4 h-4" />
              <span>Lista</span>
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Kalendar</span>
            </Button>
          </div>
        </div>
      )}

      {/* Forma za kreiranje rezervacije */}
      {showCreateForm && !quickBookingData && (
        <CreateBookingForm
          userRole={userRole}
          currentStaffId={selectedStaffId || currentStaffId}
          currentStaffName={
            userRole === 'owner' && selectedStaffId
              ? staffMembers.find((s) => s.id === selectedStaffId)?.fullName ||
                staffMembers.find((s) => s.id === selectedStaffId)?.email
              : currentStaffName
          }
          onSuccess={() => {
            setShowCreateForm(false);
            loadBookings();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Prikaz liste ili kalendara */}
      {/* Show calendar/list even if no staff selected (for admin to see all bookings) */}
      {loadingBookings && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Učitavanje rezervacija...</p>
        </div>
      )}
      {(selectedStaffId || userRole === 'owner') && !loadingBookings && (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {bookings
                .filter((b) => {
                  // For owner: show all bookings if no staff selected, or bookings for selected staff
                  // For staff: show only their bookings
                  if (userRole === 'owner') {
                    if (!selectedStaffId) {
                      // Show all bookings if no staff selected
                      return b.status !== 'CANCELED';
                    }
                    // Show bookings for selected staff (including those without staffId if selectedStaffId is empty)
                    return (b.staffId === selectedStaffId || !b.staffId) && b.status !== 'CANCELED';
                  } else {
                    // Staff can only see their own bookings
                    return b.staffId === selectedStaffId && b.status !== 'CANCELED';
                  }
                })
                .map((booking) => (
                  <Card
                    key={booking.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.clientName}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>
                            <strong>Email:</strong> {booking.clientEmail}
                          </p>
                          {booking.clientPhone && (
                            <p>
                              <strong>Telefon:</strong> {booking.clientPhone}
                            </p>
                          )}
                          <p>
                            <strong>Usluga:</strong> {booking.service?.name || 'N/A'}
                          </p>
                          <p>
                            <strong>Termin:</strong>{' '}
                            {booking.startAt instanceof Date && !isNaN(booking.startAt.getTime())
                              ? format(booking.startAt, 'EEEE, dd.MM.yyyy. u HH:mm', { locale: hr })
                              : 'N/A'}
                          </p>
                          {booking.service && (
                            <p>
                              <strong>Trajanje:</strong> {booking.service.duration} min
                            </p>
                          )}
                          {userRole === 'owner' && booking.staff && (
                            <p>
                              <strong>Djelatnik:</strong>{' '}
                              {booking.staff?.fullName || booking.staff?.email || (
                                <span className="text-gray-400 italic">Nije dodijeljen</span>
                              )}
                            </p>
                          )}
                          {booking.notes && (
                            <p>
                              <strong>Napomena:</strong> {booking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              {bookings.filter((b) => {
                if (userRole === 'owner') {
                  if (!selectedStaffId) {
                    return b.status !== 'CANCELED';
                  }
                  return (b.staffId === selectedStaffId || !b.staffId) && b.status !== 'CANCELED';
                } else {
                  return b.staffId === selectedStaffId && b.status !== 'CANCELED';
                }
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {!selectedStaffId && userRole === 'owner' 
                    ? 'Nema rezervacija u sustavu'
                    : 'Nema rezervacija za odabranog djelatnika'}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm text-gray-600">
                {selectedStaffId 
                  ? `Ukupno ${bookings.length} rezervacija u sustavu (filtrirano po djelatniku)`
                  : `Ukupno ${bookings.length} rezervacija u sustavu (sve rezervacije)`}
              </div>
              <AdvancedCalendar
            bookings={bookings}
            selectedStaffId={selectedStaffId}
            selectedServiceId={undefined}
            onDateClick={(date) => {
              setSelectedDate(date);
              const timeStr = format(date, 'HH:mm');
              setQuickBookingData({
                staffId: selectedStaffId,
                date,
                time: timeStr,
              });
              setShowCreateForm(true);
            }}
            onBookingClick={(booking) => {
              setSelectedBooking(booking);
            }}
          />
            </>
          )}
        </>
      )}

      {/* Quick booking form */}
      {showCreateForm && quickBookingData && (
        <CreateBookingForm
          userRole={userRole}
          currentStaffId={quickBookingData.staffId}
          currentStaffName={
            userRole === 'owner'
              ? staffMembers.find((s) => s.id === quickBookingData.staffId)?.fullName ||
                staffMembers.find((s) => s.id === quickBookingData.staffId)?.email
              : currentStaffName
          }
          prefillData={quickBookingData}
          onSuccess={() => {
            setShowCreateForm(false);
            setQuickBookingData(null);
            loadBookings(); // Reload bookings after creating a new one
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setQuickBookingData(null);
          }}
        />
      )}

      {/* Modal za detalje rezervacije */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalji rezervacije
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedBooking(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedBooking.clientName}
                  </h3>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Email:</strong> {selectedBooking.clientEmail}
                  </p>
                  {selectedBooking.clientPhone && (
                    <p>
                      <strong>Telefon:</strong> {selectedBooking.clientPhone}
                    </p>
                  )}
                  <p>
                    <strong>Usluga:</strong> {selectedBooking.service?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Termin:</strong>{' '}
                    {selectedBooking.startAt instanceof Date &&
                    !isNaN(selectedBooking.startAt.getTime())
                      ? format(
                          selectedBooking.startAt,
                          'EEEE, dd.MM.yyyy. u HH:mm',
                          { locale: hr }
                        )
                      : 'N/A'}
                  </p>
                  {selectedBooking.service && (
                    <p>
                      <strong>Trajanje:</strong> {selectedBooking.service.duration} min
                    </p>
                  )}
                  {userRole === 'owner' && selectedBooking.staff && (
                    <p>
                      <strong>Djelatnik:</strong>{' '}
                      {selectedBooking.staff.fullName || selectedBooking.staff.email}
                    </p>
                  )}
                  {selectedBooking.notes && (
                    <p>
                      <strong>Napomena:</strong> {selectedBooking.notes}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  {selectedBooking.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await updateBookingStatus(selectedBooking.id, 'CONFIRMED');
                          setSelectedBooking(null);
                        }}
                        disabled={updatingBookingId === selectedBooking.id}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        {updatingBookingId === selectedBooking.id
                          ? 'Ažuriranje...'
                          : 'Potvrdi'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await updateBookingStatus(selectedBooking.id, 'CANCELED');
                          setSelectedBooking(null);
                        }}
                        disabled={updatingBookingId === selectedBooking.id}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {updatingBookingId === selectedBooking.id
                          ? 'Ažuriranje...'
                          : 'Otkaži'}
                      </Button>
                    </>
                  )}
                  {selectedBooking.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await updateBookingStatus(selectedBooking.id, 'CANCELED');
                        setSelectedBooking(null);
                      }}
                      disabled={updatingBookingId === selectedBooking.id}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {updatingBookingId === selectedBooking.id
                        ? 'Ažuriranje...'
                        : 'Otkaži'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      CONFIRMED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      CONFIRMED: 'Potvrđeno',
      PENDING: 'Na čekanju',
      CANCELED: 'Otkazano',
      NO_SHOW: 'Nije došao',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      setUpdatingBookingId(bookingId);
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh bookings list
        await loadBookings();
      } else {
        console.error('Error updating booking:', data.error);
      }
    } catch (err) {
      console.error('Update booking error:', err);
    } finally {
      setUpdatingBookingId(null);
    }
  };
}

