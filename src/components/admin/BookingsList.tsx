import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to load bookings');
      }

      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data || []);
      } else {
        setError(data.error || 'Greška pri učitavanju rezervacija');
      }
    } catch (err) {
      console.error('Load bookings error:', err);
      setError('Greška pri učitavanju rezervacija');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Učitavanje rezervacija...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadBookings} className="mt-4">
          Pokušaj ponovo
        </Button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nema rezervacija</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="p-4">
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
                  {format(booking.startAt, 'EEEE, dd.MM.yyyy. u HH:mm', { locale: hr })}
                </p>
                {booking.service && (
                  <p>
                    <strong>Trajanje:</strong> {booking.service.duration} min
                  </p>
                )}
                {booking.notes && (
                  <p>
                    <strong>Napomena:</strong> {booking.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="ml-4 flex flex-col space-y-2">
              {booking.status === 'PENDING' && (
                <>
                  <Button size="sm" variant="outline">
                    Potvrdi
                  </Button>
                  <Button size="sm" variant="outline">
                    Otkaži
                  </Button>
                </>
              )}
              {booking.status === 'CONFIRMED' && (
                <Button size="sm" variant="outline">
                  Otkaži
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

