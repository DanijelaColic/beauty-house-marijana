'use client';

// Main booking form component
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema, type BookingFormData } from '@/lib/validation';
import { ServiceSelect } from './ServiceSelect';
import { DatePicker } from './DatePicker';
import { SlotPicker } from './SlotPicker';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import type { Service, TimeSlot } from '@/types';

interface BookingFormProps {
  onSuccess?: (bookingId: string) => void;
  onError?: (error: string) => void;
}

export function BookingForm({ onSuccess, onError }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // Tomorrow as default
      gdprConsent: false,
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    console.log('handleSubmit called with data:', data);
    onSubmit(data);
  });

  const watchedServiceId = watch('serviceId');
  const watchedDate = watch('date');

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  // Load slots when service or date changes
  useEffect(() => {
    if (watchedServiceId && watchedDate) {
      loadAvailableSlots(watchedServiceId, watchedDate);
    }
  }, [watchedServiceId, watchedDate]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      } else {
        setError('Greška pri učitavanju usluga');
      }
    } catch (err) {
      setError('Greška pri učitavanju usluga');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (serviceId: string, date: string) => {
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId, date }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.data?.slots || []);
        const service = services.find(s => s.id === serviceId);
        setSelectedService(service || null);
      } else {
        setAvailableSlots([]);
        setError('Greška pri učitavanju dostupnih termina');
      }
    } catch (err) {
      setAvailableSlots([]);
      setError('Greška pri učitavanju dostupnih termina');
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    console.log('🚀 onSubmit called with data:', data);
    try {
      setSubmitting(true);
      setError('');
      console.log('Form data on submit:', data);

      // Create ISO string for booking start time
      const startAt = new Date(`${data.date}T${data.timeSlot}:00`).toISOString();

      const bookingData = {
        serviceId: data.serviceId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone || undefined,
        startAt,
        notes: data.notes || undefined,
      };

      console.log('Booking data being sent:', bookingData);

      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Booking response status:', response.status);

      const result = await response.json();

      if (response.ok && result.success) {
        // Call success callback or redirect
        if (onSuccess) {
          onSuccess(result.data.booking.id);
        } else {
          // Redirect to success page
          window.location.href = `/rezervacije/uspjeh?booking=${result.data.booking.id}`;
        }
      } else {
        const errorMessage = result.error || 'Greška pri kreiranju rezervacije';
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        setSubmitting(false);
      }
    } catch (err) {
      const errorMessage = 'Greška pri kreiranju rezervacije';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    const currentData = getValues();
    
    // Validate current step
    if (step === 1 && !currentData.serviceId) {
      setError('Molimo odaberite uslugu');
      return;
    }
    if (step === 2 && !currentData.date) {
      setError('Molimo odaberite datum');
      return;
    }
    if (step === 3 && !currentData.timeSlot) {
      setError('Molimo odaberite vrijeme');
      return;
    }
    
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const steps = [
    { number: 1, title: 'Usluga', icon: Calendar },
    { number: 2, title: 'Datum', icon: Calendar },
    { number: 3, title: 'Vrijeme', icon: Clock },
    { number: 4, title: 'Podaci', icon: User },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s.number
                    ? 'bg-primary border-primary text-white'
                    : 'border-border text-textSecondary'
                }`}
              >
                {step > s.number ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > s.number ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-center text-textSecondary">
          Korak {step} od {steps.length}: {steps[step - 1]?.title}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {step === 1 && 'Odaberite uslugu'}
            {step === 2 && 'Odaberite datum'}
            {step === 3 && 'Odaberite vrijeme'}
            {step === 4 && 'Unesite vaše podatke'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit}>
            {/* Step 1: Service selection */}
            {step === 1 && (
              <div className="space-y-4">
                <ServiceSelect
                  services={services}
                  loading={loading}
                  onSelect={(serviceId) => setValue('serviceId', serviceId)}
                  error={errors.serviceId?.message}
                  selectedServiceId={watchedServiceId}
                />
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!watchedServiceId}
                  >
                    Sljedeći korak
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Date selection */}
            {step === 2 && (
              <div className="space-y-4">
                <DatePicker
                  value={watchedDate}
                  onChange={(date) => setValue('date', date)}
                  error={errors.date?.message}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Nazad
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!watchedDate}
                  >
                    Sljedeći korak
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Time selection */}
            {step === 3 && (
              <div className="space-y-4">
                {selectedService && (
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">{selectedService.name}</h3>
                    <p className="text-textSecondary">
                      Trajanje: {selectedService.duration} min
                      {selectedService.price && ` • Cijena: ${selectedService.price}€`}
                    </p>
                  </div>
                )}

                <SlotPicker
                  slots={availableSlots}
                  onSelect={(time) => setValue('timeSlot', time)}
                  error={errors.timeSlot?.message}
                  selectedTime={watch('timeSlot')}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Nazad
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!watch('timeSlot')}
                  >
                    Sljedeći korak
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: User data */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Booking summary */}
                <div className="bg-surface p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Sažetak rezervacije</h3>
                  <div className="text-sm text-textSecondary space-y-1">
                    <p><strong>Usluga:</strong> {selectedService?.name}</p>
                    <p><strong>Datum:</strong> {new Date(watchedDate).toLocaleDateString('hr-HR')}</p>
                    <p><strong>Vrijeme:</strong> {watch('timeSlot')}</p>
                    <p><strong>Trajanje:</strong> {selectedService?.duration} min</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">
                      <User className="w-4 h-4 inline mr-2" />
                      Ime i prezime *
                    </Label>
                    <Input
                      id="clientName"
                      {...register('clientName')}
                      placeholder="Vaše ime i prezime"
                      className={errors.clientName ? 'border-red-500' : ''}
                    />
                    {errors.clientName && (
                      <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientEmail">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email adresa *
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      {...register('clientEmail')}
                      placeholder="vas@email.com"
                      className={errors.clientEmail ? 'border-red-500' : ''}
                    />
                    {errors.clientEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="clientPhone">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Broj telefona
                    </Label>
                    <Input
                      id="clientPhone"
                      {...register('clientPhone')}
                      placeholder="+385 99 123 4567"
                      className={errors.clientPhone ? 'border-red-500' : ''}
                    />
                    {errors.clientPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="notes">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Napomena (opcionalno)
                    </Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Dodatne napomene..."
                      rows={3}
                      className={errors.notes ? 'border-red-500' : ''}
                    />
                    {errors.notes && (
                      <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                    )}
                  </div>
                </div>

                {/* GDPR checkbox */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="gdprConsent"
                    checked={watch('gdprConsent')}
                    onCheckedChange={(checked) => setValue('gdprConsent', !!checked)}
                    className={errors.gdprConsent ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="gdprConsent" className="text-sm leading-5">
                    Prihvaćam uvjete korištenja i pravila privatnosti. 
                    Slanjem ovog formulara pristajete na korištenje vaših podataka za potrebe rezervacije. *
                  </Label>
                </div>
                {errors.gdprConsent && (
                  <p className="text-red-500 text-sm">{errors.gdprConsent.message}</p>
                )}

                {/* Buttons */}
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Nazad
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="min-w-[120px]"
                    onClick={() => {
                      console.log('Submit button clicked');
                      console.log('Current form values:', JSON.stringify(getValues(), null, 2));
                      console.log('Form errors:', JSON.stringify(errors, null, 2));
                      console.log('Form is valid:', Object.keys(errors).length === 0);
                    }}
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
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
