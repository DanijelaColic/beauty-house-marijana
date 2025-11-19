'use client';

// New 5-step booking form component with 2-column layout
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Service, Staff, TimeSlot } from '@/types';

// Booking state interface
interface BookingState {
  // Step 1
  selectedService: Service | null;
  
  // Step 2  
  selectedStaff: Staff | null;
  
  // Step 3
  selectedDate: string;
  selectedTime: string;
  availableSlots: TimeSlot[];
  
  // Step 4
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  
  // Step 5
  bookingId: string;
}

interface BookingFormProps {
  onSuccess?: (bookingId: string) => void;
  onError?: (error: string) => void;
}

export function BookingForm({ onSuccess, onError }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  // Form state
  const [bookingState, setBookingState] = useState<BookingState>({
    selectedService: null,
    selectedStaff: null,
    selectedDate: '',
    selectedTime: '',
    availableSlots: [],
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
    bookingId: '',
  });

  // Load data on mount
  useEffect(() => {
    loadInitialData();
    
    // Auto-scroll to booking root
    const bookingRoot = document.getElementById('booking-root');
    if (bookingRoot) {
      bookingRoot.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Reload slots when returning to step 3 to ensure we have the latest data
  useEffect(() => {
    if (currentStep === 3 && bookingState.selectedService && bookingState.selectedStaff && bookingState.selectedDate) {
      loadAvailableSlots(
        bookingState.selectedService.id,
        bookingState.selectedStaff.id,
        bookingState.selectedDate
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, bookingState.selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [servicesRes, staffRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/staff'),
      ]);

      // Handle services response
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        console.log('Services response:', servicesData);
        
        if (servicesData.success && servicesData.data) {
          setServices(servicesData.data);
        } else if (servicesData.data) {
          // Fallback: if data exists but success is not set
          setServices(servicesData.data);
        } else {
          console.error('Services data is missing:', servicesData);
          setError('Greška pri učitavanju usluga');
        }
      } else {
        const errorText = await servicesRes.text();
        console.error('Services API error:', servicesRes.status, errorText);
        setError('Greška pri učitavanju usluga');
      }

      // Handle staff response
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        console.log('Staff response:', staffData);
        
        if (staffData.success && staffData.data) {
          setStaff(staffData.data);
        } else if (staffData.data) {
          // Fallback: if data exists but success is not set
          setStaff(staffData.data);
        } else {
          console.error('Staff data is missing:', staffData);
        }
      } else {
        const errorText = await staffRes.text();
        console.error('Staff API error:', staffRes.status, errorText);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (serviceId: string, staffId: string, date: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, staffId, date }),
      });

      if (response.ok) {
        const data = await response.json();
        const slots = data.data?.slots || [];
        
        setBookingState(prev => ({
          ...prev,
          availableSlots: slots,
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load available slots:', errorData);
        setError('Greška pri učitavanju dostupnih termina');
        setBookingState(prev => ({ ...prev, availableSlots: [] }));
      }
    } catch (err) {
      console.error('Error loading available slots:', err);
      setError('Greška pri učitavanju dostupnih termina');
      setBookingState(prev => ({ ...prev, availableSlots: [] }));
    } finally {
      setLoading(false);
    }
  };

  const validateAndNextStep = () => {
    setError('');
    
    // Validation for step 4 (customer info)
    if (currentStep === 4) {
      if (!bookingState.clientName || !bookingState.clientEmail) {
        setError('Molimo unesite ime i email');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingState.clientEmail)) {
        setError('Molimo unesite valjan email');
        return;
      }
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const submitBooking = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Parse date and time correctly, ensuring we use local timezone
      // selectedDate is in format 'YYYY-MM-DD', selectedTime is in format 'HH:mm'
      const [year, month, day] = bookingState.selectedDate.split('-').map(Number);
      const [hours, minutes] = bookingState.selectedTime.split(':').map(Number);
      
      // Create date in local timezone, then convert to ISO string
      const localDateTime = new Date(year, month - 1, day, hours, minutes, 0);
      const startAt = localDateTime.toISOString();

      const bookingData = {
        serviceId: bookingState.selectedService!.id,
        staffId: bookingState.selectedStaff?.id || undefined, // Proslijedi staffId samo ako je odabran
        clientName: bookingState.clientName,
        clientEmail: bookingState.clientEmail,
        clientPhone: bookingState.clientPhone || undefined,
        startAt,
        notes: bookingState.notes || undefined,
      };

      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBookingState(prev => ({ ...prev, bookingId: result.data.booking.id }));
        
        // Reload available slots for the selected date to reflect the new booking
        // Wait a bit to ensure the booking is saved in the database
        if (bookingState.selectedService && bookingState.selectedStaff && bookingState.selectedDate) {
          // Use setTimeout to ensure booking is saved before reloading
          // Increased delay to 1000ms to ensure database write is complete
          setTimeout(() => {
            loadAvailableSlots(
              bookingState.selectedService!.id, 
              bookingState.selectedStaff!.id, 
              bookingState.selectedDate!
            );
          }, 1000);
        }
        
        setCurrentStep(5);
        if (onSuccess) {
          onSuccess(result.data.booking.id);
        }
      } else {
        const errorMessage = result.error || 'Greška pri kreiranju rezervacije';
        console.error('Booking creation failed:', errorMessage);
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Exception in submitBooking:', err);
      const errorMessage = 'Greška pri kreiranju rezervacije';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Odaberi uslugu' },
    { number: 2, title: 'Odaberi djelatnika' },
    { number: 3, title: 'Odaberi datum i vrijeme' },
    { number: 4, title: 'Informacije o kupcu' },
    { number: 5, title: 'Potvrda narudžbe' },
  ];

  // Show summary only after service is selected
  const showSummary = bookingState.selectedService !== null;

  return (
    <div className="w-full max-w-6xl mx-auto pt-20">
      {/* Popup-like container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Simple Step Indicator - dots only */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentStep >= step.number ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
                {index < steps.length - 1 && (
                  <div className="w-4 h-0.5 bg-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-3">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Layout: 2 columns on desktop, stacked on mobile */}
        <div className={`grid grid-cols-1 gap-0 ${showSummary ? 'lg:grid-cols-3' : ''}`}>
          {/* Left Column: Main Content (full width if no summary, 2/3 if summary) */}
          <div className={showSummary ? 'lg:col-span-2' : ''}>
            <div className="p-6" style={{ maxHeight: '800px', minHeight: '500px' }}>
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <ServiceStep
                  services={services}
                  loading={loading}
                  selectedService={bookingState.selectedService}
                  onServiceSelect={(service) => {
                    setBookingState(prev => ({ ...prev, selectedService: service }));
                    // Auto-advance to next step after state update
                    setTimeout(() => {
                      setCurrentStep(2);
                      setError('');
                    }, 100);
                  }}
                />
              )}

              {/* Step 2: Staff Selection */}
              {currentStep === 2 && (
                <StaffStep
                  staff={staff}
                  selectedStaff={bookingState.selectedStaff}
                  serviceId={bookingState.selectedService?.id || ''}
                  loading={loading}
                  onStaffSelect={(staff) => {
                    setBookingState(prev => ({ ...prev, selectedStaff: staff }));
                    // Auto-advance to next step after state update
                    setTimeout(() => {
                      setCurrentStep(3);
                      setError('');
                    }, 100);
                  }}
                  onFirstAvailableFound={async (staff, date, time) => {
                    // Automatically select staff, date, and time
                    setBookingState(prev => ({ 
                      ...prev, 
                      selectedStaff: staff,
                      selectedDate: date,
                      selectedTime: time
                    }));
                    // Auto-advance to step 4 (customer info)
                    setTimeout(() => {
                      setCurrentStep(4);
                      setError('');
                    }, 100);
                  }}
                />
              )}

              {/* Step 3: Date & Time Selection */}
              {currentStep === 3 && (
                <DateTimeStep
                  selectedDate={bookingState.selectedDate}
                  selectedTime={bookingState.selectedTime}
                  availableSlots={bookingState.availableSlots}
                  loading={loading}
                  serviceId={bookingState.selectedService?.id || ''}
                  staffId={bookingState.selectedStaff?.id || ''}
                  onDateSelect={async (date) => {
                    setBookingState(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
                    if (bookingState.selectedService && bookingState.selectedStaff) {
                      await loadAvailableSlots(bookingState.selectedService.id, bookingState.selectedStaff.id, date);
                    }
                  }}
                  onTimeSelect={(time) => {
                    setBookingState(prev => ({ ...prev, selectedTime: time }));
                    // Auto-advance to next step after state update
                    setTimeout(() => {
                      setCurrentStep(4);
                      setError('');
                    }, 100);
                  }}
                  onFirstAvailableFound={(date, time) => {
                    // This callback is called after first available slot is found
                    // The date is already selected, now select the time
                    setBookingState(prev => ({ ...prev, selectedDate: date, selectedTime: time }));
                    setTimeout(() => {
                      setCurrentStep(4);
                      setError('');
                    }, 100);
                  }}
                />
              )}

              {/* Step 4: Customer Information */}
              {currentStep === 4 && (
                <CustomerInfoStep
                  clientName={bookingState.clientName}
                  clientEmail={bookingState.clientEmail}
                  clientPhone={bookingState.clientPhone}
                  notes={bookingState.notes}
                  onChange={(field, value) => {
                    setBookingState(prev => ({ ...prev, [field]: value }));
                  }}
                />
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && (
                <ConfirmationStep
                  bookingState={bookingState}
                />
              )}

              {/* Navigation Buttons - only show for steps that need them */}
              {currentStep > 1 && currentStep < 5 && (
                <div className="flex justify-between mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Nazad
                  </Button>
                  
                  {currentStep === 4 ? (
                    <Button
                      type="button"
                      onClick={submitBooking}
                      disabled={submitting || !bookingState.clientName || !bookingState.clientEmail}
                      className="flex items-center"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Rezerviram...
                        </>
                      ) : (
                        'Potvrdi rezervaciju'
                      )}
                    </Button>
                  ) : currentStep === 3 ? (
                    <Button
                      type="button"
                      onClick={validateAndNextStep}
                      disabled={!bookingState.selectedDate || !bookingState.selectedTime}
                      className="flex items-center"
                    >
                      Dalje
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : null}
                  </div>
                )}

              {/* Step 5 buttons */}
              {currentStep === 5 && (
                <div className="flex justify-center space-x-3 mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    Povratak na početnu
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setBookingState({
                        selectedService: null,
                        selectedStaff: null,
                        selectedDate: '',
                        selectedTime: '',
                        availableSlots: [],
                        clientName: '',
                        clientEmail: '',
                        clientPhone: '',
                        notes: '',
                        bookingId: '',
                      });
                    }}
                  >
                    Nova rezervacija
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary Panel (1/3 width, hidden on mobile) - only show after service selected */}
          {showSummary && (
            <div className="hidden lg:block border-l border-gray-200">
              <SummaryPanel bookingState={bookingState} />
            </div>
          )}
        </div>

        {/* Mobile Summary (shown below content on mobile) - only show after service selected */}
        {showSummary && (
          <div className="lg:hidden border-t border-gray-200">
            <SummaryPanel bookingState={bookingState} />
          </div>
        )}
      </div>
    </div>
  );
}

// Step Components

// Step 1: Service Selection
interface ServiceStepProps {
  services: Service[];
  loading: boolean;
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
}

function ServiceStep({ services, loading, selectedService, onServiceSelect }: ServiceStepProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="ml-2 text-sm">Učitavam usluge...</span>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Odaberite uslugu</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Nema dostupnih usluga</p>
            <p className="text-sm text-gray-500">Molimo pokušajte ponovno učitati stranicu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Odaberite uslugu</h2>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '550px' }}>
        <div className="space-y-2 pr-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className={`w-full p-4 text-left border rounded-lg transition-colors ${
                selectedService?.id === service.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-medium">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Trajanje: {service.duration} min
                  </p>
                </div>
                {service.price && (
                  <div className="text-lg font-semibold text-primary ml-3">
                    {service.price}€
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 2: Staff Selection
interface StaffStepProps {
  staff: Staff[];
  selectedStaff: Staff | null;
  serviceId: string;
  loading: boolean;
  onStaffSelect: (staff: Staff) => void;
  onFirstAvailableFound: (staff: Staff, date: string, time: string) => void;
}

function StaffStep({ staff, selectedStaff, serviceId, loading, onStaffSelect, onFirstAvailableFound }: StaffStepProps) {
  const [findingFirstAvailable, setFindingFirstAvailable] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFindFirstAvailable = async () => {
    if (!serviceId) {
      setMessage({ text: 'Molimo odaberite uslugu prije traženja prvog slobodnog termina.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setFindingFirstAvailable(true);
      setMessage(null);

      const response = await fetch('/api/availability/first-available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }), // No staffId - check all staff
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Find the staff member from the list
          const foundStaff = staff.find(s => s.id === data.data.staffId);
          
          if (foundStaff) {
            // Show success message
            const [year, month, day] = data.data.date.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const dateStr = date.toLocaleDateString('hr-HR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            });
            setMessage({ 
              text: `Pronađen prvi slobodan termin: ${data.data.staffName} - ${dateStr} u ${data.data.time}`, 
              type: 'success' 
            });
            
            // Automatically select staff, date, and time
            setTimeout(() => {
              onFirstAvailableFound(foundStaff, data.data.date, data.data.time);
            }, 1000);
          } else {
            setMessage({ text: 'Djelatnik nije pronađen u listi.', type: 'error' });
            setTimeout(() => setMessage(null), 5000);
          }
        } else {
          setMessage({ text: data.error || 'Nema dostupnih termina', type: 'error' });
          setTimeout(() => setMessage(null), 5000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({ text: errorData.error || 'Greška pri pronalasku prvog slobodnog termina', type: 'error' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err) {
      console.error('Error finding first available slot:', err);
      setMessage({ text: 'Greška pri pronalasku prvog slobodnog termina', type: 'error' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setFindingFirstAvailable(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Odaberite djelatnika</h2>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm text-center ${
            message.type === 'success' ? 'text-green-700 font-medium' : 'text-red-600'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '550px' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Prvi slobodan termin - prikazuje se samo ako nije odabran djelatnik */}
          {!selectedStaff && (
            <button
              onClick={handleFindFirstAvailable}
              disabled={findingFirstAvailable || !serviceId || loading}
              className={`p-4 text-center border rounded-lg transition-colors ${
                findingFirstAvailable
                  ? 'border-gray-300 bg-gray-50 cursor-wait'
                  : 'border-green-200 hover:border-green-300 bg-green-50/50 hover:bg-green-50'
              }`}
            >
              <div className="mb-3 flex items-center justify-center">
                {findingFirstAvailable ? (
                  <Loader2 className="w-16 h-16 text-gray-400 animate-spin" />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm text-gray-800">
                {findingFirstAvailable ? 'Tražim...' : 'Prvi slobodan termin'}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Automatski odabir
              </p>
            </button>
          )}

          {/* Djelatnici */}
          {staff.map((member) => (
            <button
              key={member.id}
              onClick={() => onStaffSelect(member)}
              className={`p-4 text-center border rounded-lg transition-colors ${
                selectedStaff?.id === member.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="mb-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full mx-auto object-cover"
                />
              </div>
              <h3 className="font-medium text-sm">{member.name}</h3>
              {member.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{member.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Date & Time Selection
interface DateTimeStepProps {
  selectedDate: string;
  selectedTime: string;
  availableSlots: TimeSlot[];
  loading: boolean;
  serviceId: string;
  staffId: string;
  onDateSelect: (date: string) => Promise<void>;
  onTimeSelect: (time: string) => void;
  onFirstAvailableFound: (date: string, time: string) => void;
}

function DateTimeStep({ 
  selectedDate, 
  selectedTime, 
  availableSlots, 
  loading, 
  serviceId,
  staffId,
  onDateSelect, 
  onTimeSelect,
  onFirstAvailableFound
}: DateTimeStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [unavailableMessage, setUnavailableMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [findingFirstAvailable, setFindingFirstAvailable] = useState(false);

  // Generate calendar for current month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first Monday of the calendar (might be from previous month)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    
    // Generate days and organize into weeks
    const weeks = [];
    const currentDate = new Date(startDate);
    
    // Generate up to 6 weeks, but only include weeks that have at least one day from current month
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      let hasCurrentMonthDay = false;
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        weekDays.push(date);
        
        if (date.getMonth() === month) {
          hasCurrentMonthDay = true;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Only add week if it contains at least one day from current month
      if (hasCurrentMonthDay) {
        weeks.push(weekDays);
      }
    }
    
    return weeks.flat();
  };

  const calendar = generateCalendar();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateAvailable = (date: Date) => {
    // Sunday is non-working day
    if (date.getDay() === 0) return false;
    
    // Past dates are not available
    if (date < today) return false;
    
    // For working days in the future, assume potentially available
    // The actual availability will be determined by the backend API
    return true;
  };

  const handleDateClick = (date: Date) => {
    // Format date in local timezone to avoid timezone issues
    // Use local date components instead of ISO string
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (!isDateAvailable(date)) {
      if (date.getDay() === 0) {
        setUnavailableMessage('Nedjelja je neradni dan.');
      } else if (date < today) {
        setUnavailableMessage('Ne možete rezervirati termin u prošlosti.');
      } else {
        setUnavailableMessage('Nema dostupnih termina za odabrani datum.');
      }
      setTimeout(() => setUnavailableMessage(''), 3000);
      return;
    }
    
    setUnavailableMessage('');
    onDateSelect(dateStr);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    // Don't go to previous months before current month
    if (newMonth.getMonth() >= new Date().getMonth() || newMonth.getFullYear() > new Date().getFullYear()) {
      setCurrentMonth(newMonth);
    }
  };

  const handleFindFirstAvailable = async () => {
    if (!serviceId || !staffId) {
      setUnavailableMessage('Molimo odaberite uslugu i djelatnika prije traženja prvog slobodnog termina.');
      setTimeout(() => setUnavailableMessage(''), 3000);
      return;
    }

    try {
      setFindingFirstAvailable(true);
      setUnavailableMessage('');

      const response = await fetch('/api/availability/first-available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, staffId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Show success message
          const [year, month, day] = data.data.date.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const dateStr = date.toLocaleDateString('hr-HR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          });
          setSuccessMessage(`Pronađen prvi slobodan termin: ${dateStr} u ${data.data.time}`);
          setTimeout(() => setSuccessMessage(''), 3000);
          
          // Automatically select the first available date and wait for slots to load
          await onDateSelect(data.data.date);
          // Wait a bit for slots to load, then select the time and advance
          setTimeout(() => {
            onFirstAvailableFound(data.data.date, data.data.time);
          }, 800);
        } else {
          setUnavailableMessage(data.error || 'Nema dostupnih termina');
          setTimeout(() => setUnavailableMessage(''), 5000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setUnavailableMessage(errorData.error || 'Greška pri pronalasku prvog slobodnog termina');
        setTimeout(() => setUnavailableMessage(''), 5000);
      }
    } catch (err) {
      console.error('Error finding first available slot:', err);
      setUnavailableMessage('Greška pri pronalasku prvog slobodnog termina');
      setTimeout(() => setUnavailableMessage(''), 5000);
    } finally {
      setFindingFirstAvailable(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Odaberite datum i vrijeme</h2>
        <Button
          onClick={handleFindFirstAvailable}
          disabled={findingFirstAvailable || !serviceId || !staffId}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          {findingFirstAvailable ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Tražim...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Prvi slobodan termin</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Unified scroll container */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '550px' }}>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-lg">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <h3 className="text-base font-semibold text-gray-800">
            {currentMonth.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })}
          </h3>
          
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendar.map((date, index) => {
            // Format date in local timezone to avoid timezone issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const isSelected = selectedDate === dateStr;
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isAvailable = isDateAvailable(date);
            const isSunday = date.getDay() === 0;
            
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => handleDateClick(date)}
                  className={`
                    w-full h-8 text-xs rounded-md transition-all duration-200 relative flex items-center justify-center
                    ${!isCurrentMonth 
                      ? 'text-gray-300 cursor-default' 
                      : isSelected
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md font-medium'
                      : isAvailable
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-800 border border-blue-200 hover:border-blue-300 hover:shadow-sm'
                      : isSunday
                      ? 'bg-red-50 text-red-300 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-red-50'
                    }
                  `}
                  disabled={!isCurrentMonth}
                >
                  <span>
                    {date.getDate()}
                  </span>
                  
                  {/* Unavailable indicator on hover */}
                  {isCurrentMonth && !isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Available indicator */}
                  {isCurrentMonth && isAvailable && !isSelected && (
                    <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 text-center font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {unavailableMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{unavailableMessage}</p>
          </div>
        )}

        {/* Time Selection */}
        {selectedDate && (
          <div className="border-t pt-3">
            <h3 className="text-sm font-medium mb-2 text-center bg-gradient-to-r from-green-100 to-teal-100 p-2 rounded-md">
              Dostupni termini za {selectedDate ? (() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('hr-HR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                });
              })() : ''}
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Učitavam termine...</span>
              </div>
            ) : availableSlots.filter(slot => slot.available).length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.filter(slot => slot.available).map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => onTimeSelect(slot.time)}
                    className={`
                      p-2 text-xs rounded-md transition-all duration-200 font-medium
                      ${selectedTime === slot.time
                        ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-md'
                        : 'bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 text-gray-800 border border-green-200 hover:border-green-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <X className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  Nema dostupnih termina za odabrani datum.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Step 4: Customer Information
interface CustomerInfoStepProps {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  onChange: (field: string, value: string) => void;
}

function CustomerInfoStep({ 
  clientName, 
  clientEmail, 
  clientPhone, 
  notes, 
  onChange 
}: CustomerInfoStepProps) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Unesite vaše podatke</h2>
      
      <div className="flex-1 overflow-y-auto space-y-4" style={{ maxHeight: '550px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Ime i prezime *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => onChange('clientName', e.target.value)}
              placeholder="Vaše ime i prezime"
              required
            />
          </div>

          <div>
            <Label htmlFor="clientEmail">Email adresa *</Label>
            <Input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => onChange('clientEmail', e.target.value)}
              placeholder="vas@email.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="clientPhone">Broj telefona</Label>
          <Input
            id="clientPhone"
            value={clientPhone}
            onChange={(e) => onChange('clientPhone', e.target.value)}
            placeholder="+385 99 123 4567"
          />
        </div>

        <div>
          <Label htmlFor="notes">Napomena (opcionalno)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="Dodatne napomene..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// Step 5: Confirmation
interface ConfirmationStepProps {
  bookingState: BookingState;
}

function ConfirmationStep({ bookingState }: ConfirmationStepProps) {
  const generateBookingNumber = () => {
    return `BH${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-green-600 mb-2">
          Rezervacija uspješno kreirana!
        </h2>
        <p className="text-gray-600">
          Vaša rezervacija je potvrđena. Dobit ćete email potvrdu uskoro.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto">
        <h3 className="font-semibold mb-4 text-center">Detalji rezervacije</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Broj rezervacije:</span>
            <span className="font-medium">{generateBookingNumber()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Usluga:</span>
            <span className="font-medium">{bookingState.selectedService?.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Djelatnik:</span>
            <span className="font-medium">{bookingState.selectedStaff?.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Datum:</span>
            <span className="font-medium">
              {bookingState.selectedDate ? (() => {
                const [year, month, day] = bookingState.selectedDate.split('-').map(Number);
                return new Date(year, month - 1, day).toLocaleDateString('hr-HR');
              })() : ''}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Vrijeme:</span>
            <span className="font-medium">{bookingState.selectedTime}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Kupac:</span>
            <span className="font-medium">{bookingState.clientName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{bookingState.clientEmail}</span>
          </div>
          
          {bookingState.selectedService?.price && (
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">Cijena:</span>
              <span className="font-semibold text-lg">{bookingState.selectedService.price}€</span>
            </div>
                    )}
                  </div>
                </div>
    </div>
  );
}

// Summary Panel Component
interface SummaryPanelProps {
  bookingState: BookingState;
}

function SummaryPanel({ bookingState }: SummaryPanelProps) {
  return (
    <div className="bg-gray-50 p-6 h-full">
      <h3 className="font-semibold mb-4">Sažetak rezervacije</h3>
      
      <div className="space-y-4">
        {bookingState.selectedService ? (
          <div>
            <div className="font-medium">{bookingState.selectedService.name}</div>
            <div className="text-gray-600 text-sm">
              {bookingState.selectedService.duration} min
            </div>
            {bookingState.selectedService.price && (
              <div className="font-semibold text-primary">
                {bookingState.selectedService.price}€
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400">Odaberite uslugu</div>
        )}

        <hr className="border-gray-200" />

        {bookingState.selectedStaff ? (
          <div className="flex items-center space-x-3">
            <img
              src={bookingState.selectedStaff.avatar}
              alt={bookingState.selectedStaff.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-medium">{bookingState.selectedStaff.name}</div>
              <div className="text-gray-600 text-sm">
                {bookingState.selectedStaff.description}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Odaberite djelatnika</div>
        )}

        <hr className="border-gray-200" />

        {bookingState.selectedDate ? (
          <div>
            <div className="font-medium">
              {bookingState.selectedDate ? (() => {
                const [year, month, day] = bookingState.selectedDate.split('-').map(Number);
                return new Date(year, month - 1, day).toLocaleDateString('hr-HR', {
                  day: 'numeric',
                  month: 'long',
                });
              })() : ''}
            </div>
            {bookingState.selectedTime && (
              <div className="text-gray-600">u {bookingState.selectedTime}</div>
            )}
          </div>
        ) : (
          <div className="text-gray-400">Odaberite datum i vrijeme</div>
        )}

        {bookingState.clientName && (
          <>
            <hr className="border-gray-200" />
            <div>
              <div className="font-medium">{bookingState.clientName}</div>
              <div className="text-gray-600">{bookingState.clientEmail}</div>
              {bookingState.clientPhone && (
                <div className="text-gray-600">{bookingState.clientPhone}</div>
              )}
            </div>
          </>
        )}

        {bookingState.selectedService?.price && (
          <>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Ukupno:</span>
              <span className="text-primary">{bookingState.selectedService.price}€</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
