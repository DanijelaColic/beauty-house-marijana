'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfDay, addDays, isBefore, isAfter } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { Service, StaffProfile, TimeSlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CreateBookingFormProps {
  userRole: 'owner' | 'staff' | null;
  currentStaffId?: string;
  currentStaffName?: string;
  prefillData?: {
    staffId?: string;
    serviceId?: string;
    date?: Date;
    time?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateBookingForm({
  userRole,
  currentStaffId,
  currentStaffName,
  prefillData,
  onSuccess,
  onCancel,
}: CreateBookingFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set current staff for staff members
    if (userRole === 'staff' && currentStaffId) {
      setSelectedStaffId(currentStaffId);
    }
    
    // Pre-fill form data if provided
    if (prefillData) {
      if (prefillData.staffId) {
        setSelectedStaffId(prefillData.staffId);
      }
      if (prefillData.serviceId) {
        setSelectedServiceId(prefillData.serviceId);
      }
      if (prefillData.date) {
        setSelectedDate(prefillData.date);
      }
      if (prefillData.time) {
        setSelectedTime(prefillData.time);
      }
    }
  }, [userRole, currentStaffId, prefillData]);

  // Load availability when service, staff, or date changes
  useEffect(() => {
    if (selectedServiceId && selectedDate) {
      loadAvailability();
    } else {
      setAvailableSlots([]);
      setSelectedTime('');
    }
  }, [selectedServiceId, selectedStaffId, selectedDate]);

  const loadAvailability = async () => {
    if (!selectedServiceId || !selectedDate) return;

    try {
      setLoadingAvailability(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const finalStaffId = selectedStaffId || undefined;

      const response = await fetch('/api/availability', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          staffId: finalStaffId,
          date: dateStr,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.slots) {
        setAvailableSlots(data.data.slots);
        // Reset selected time if it's no longer available
        if (selectedTime) {
          const slot = data.data.slots.find((s: TimeSlot) => s.time === selectedTime);
          if (!slot || !slot.available) {
            setSelectedTime('');
          }
        }
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Error loading availability:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load services
      const servicesResponse = await fetch('/api/services', {
        credentials: 'include',
      });
      const servicesData = await servicesResponse.json();
      if (servicesData.success) {
        setServices(servicesData.data || []);
      }

      // Load staff members (for both admin and staff)
      const staffResponse = await fetch('/api/admin/staff', {
        credentials: 'include',
      });
      const staffData = await staffResponse.json();
      if (staffData.success) {
        setStaffMembers(staffData.data || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!selectedServiceId || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      setError('Molimo popunite sva obavezna polja');
      return;
    }

    // Both admin and staff can create bookings for anyone
    const finalStaffId = selectedStaffId || undefined;

    try {
      setSubmitting(true);

      // Combine date and time
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startAt = `${dateStr}T${selectedTime}:00`;

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          staffId: finalStaffId,
          clientName,
          clientEmail,
          clientPhone: clientPhone || undefined,
          startAt,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Greška pri kreiranju rezervacije');
      }

      // Success - refresh bookings and close form
      onSuccess();
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Greška pri kreiranju rezervacije');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate disabled dates for calendar
  const disabledDates = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      before: today, // Disable all dates before today
      // Disable Sundays (day 0) - adjust if your business hours allow Sundays
      // You can customize this based on your business hours
    };
  }, []);

  // Custom function to disable specific days (e.g., Sundays)
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    // Disable past dates
    if (isBefore(date, today)) {
      return true;
    }
    // Disable Sundays (day 0) - salon is closed on Sundays
    if (date.getDay() === 0) {
      return true;
    }
    return false;
  };

  // Get available time slots from API or generate default ones
  const timeSlots = useMemo(() => {
    if (availableSlots.length > 0) {
      return availableSlots;
    }
    // Default slots if availability not loaded yet
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: false,
        reason: 'Učitavanje...',
      });
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:30`,
        available: false,
        reason: 'Učitavanje...',
      });
    }
    return slots;
  }, [availableSlots]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Učitavanje...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onCancel}
    >
      <Card
        className="max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nova rezervacija</h2>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usluga */}
            <div>
              <Label htmlFor="service">Usluga *</Label>
              <select
                id="service"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              >
                <option value="">Odaberi uslugu</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Djelatnik (svi mogu odabrati bilo kog djelatnika) */}
            <div>
              <Label htmlFor="staff">Djelatnik</Label>
              <select
                id="staff"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">Nije dodijeljen</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName || staff.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Datum i vrijeme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Datum *</Label>
                <div className="mt-1">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDates}
                    modifiers={{
                      disabled: (date) => isDateDisabled(date),
                    }}
                    locale={hr}
                    className="mx-auto"
                    classNames={{
                      months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                      month: 'space-y-4',
                      caption: 'flex justify-center pt-1 relative items-center',
                      caption_label: 'text-sm font-medium text-gray-900',
                      nav: 'space-x-1 flex items-center',
                      nav_button:
                        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-900',
                      nav_button_previous: 'absolute left-1',
                      nav_button_next: 'absolute right-1',
                      table: 'w-full border-collapse space-y-1',
                      head_row: 'flex',
                      head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                      row: 'flex w-full mt-2',
                      cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-rose-500 [&:has([aria-selected])]:text-white first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                      day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-rose-100 rounded-md transition-colors',
                      day_selected:
                        'bg-rose-500 text-white hover:bg-rose-600 hover:text-white focus:bg-rose-500 focus:text-white',
                      day_today: 'bg-rose-50 text-gray-900 font-semibold',
                      day_outside: 'text-gray-400 opacity-50',
                      day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed',
                      day_range_middle: 'aria-selected:bg-rose-500 aria-selected:text-white',
                      day_hidden: 'invisible',
                    }}
                    components={{
                      IconLeft: () => <span>←</span>,
                      IconRight: () => <span>→</span>,
                    }}
                  />
                </div>
                {selectedDate && isBefore(selectedDate, startOfDay(new Date())) && (
                  <p className="mt-1 text-sm text-red-600">
                    Ne možete odabrati prošli datum
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="time">Vrijeme *</Label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!selectedServiceId || !selectedDate || loadingAvailability}
                >
                  <option value="">
                    {loadingAvailability
                      ? 'Učitavanje dostupnosti...'
                      : !selectedServiceId
                        ? 'Prvo odaberite uslugu'
                        : !selectedDate
                          ? 'Prvo odaberite datum'
                          : 'Odaberi vrijeme'}
                  </option>
                  {timeSlots.map((slot) => {
                    const slotValue = typeof slot === 'string' ? slot : slot.time;
                    const isAvailable = typeof slot === 'object' ? slot.available : false;
                    const reason = typeof slot === 'object' ? slot.reason : undefined;

                    return (
                      <option
                        key={slotValue}
                        value={slotValue}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {slotValue}
                        {reason && !isAvailable ? ` - ${reason}` : ''}
                      </option>
                    );
                  })}
                </select>
                {loadingAvailability && (
                  <p className="mt-1 text-sm text-gray-500">
                    Provjera dostupnosti termina...
                  </p>
                )}
                {!loadingAvailability &&
                  selectedServiceId &&
                  selectedDate &&
                  availableSlots.length > 0 &&
                  availableSlots.filter((s) => s.available).length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      Nema dostupnih termina za ovaj datum
                    </p>
                  )}
              </div>
            </div>

            {/* Podaci o klijentu */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Podaci o klijentu</h3>

              <div>
                <Label htmlFor="clientName">Ime i prezime *</Label>
                <Input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Telefon</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Napomena</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Odustani
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Kreiranje...' : 'Kreiraj rezervaciju'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

