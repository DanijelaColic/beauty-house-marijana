'use client';

import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, startOfDay } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import 'react-day-picker/dist/style.css';

interface BookingsCalendarProps {
  bookings: Booking[];
  userRole: 'owner' | 'staff' | null;
  onBookingClick?: (booking: Booking) => void;
}

export default function BookingsCalendar({
  bookings,
  userRole,
  onBookingClick,
}: BookingsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Grupiraj rezervacije po danima
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    
    bookings.forEach((booking) => {
      if (!booking.startAt || !(booking.startAt instanceof Date)) return;
      
      const dateKey = format(startOfDay(booking.startAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    
    return grouped;
  }, [bookings]);

  // Rezervacije za odabrani dan
  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
    return bookingsByDate[dateKey] || [];
  }, [selectedDate, bookingsByDate]);

  // Modifikacija za prikaz broja rezervacija na danu
  const modifiers = useMemo(() => {
    const modifiersObj: Record<string, Date[]> = {
      hasBookings: [],
    };
    
    Object.keys(bookingsByDate).forEach((dateKey) => {
      const date = new Date(dateKey);
      modifiersObj.hasBookings.push(date);
    });
    
    return modifiersObj;
  }, [bookingsByDate]);

  const modifiersClassNames = {
    hasBookings: 'has-bookings',
  };

  const getStatusColor = (status: string) => {
    const colors = {
      CONFIRMED: 'bg-green-500',
      PENDING: 'bg-yellow-500',
      CANCELED: 'bg-red-500',
      NO_SHOW: 'bg-gray-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      CONFIRMED: 'Potvrđeno',
      PENDING: 'Na čekanju',
      CANCELED: 'Otkazano',
      NO_SHOW: 'Nije došao',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* Kalendar */}
      <Card className="p-6">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={hr}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
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
            head_cell:
              'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-rose-500 [&:has([aria-selected])]:text-white first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-rose-100 rounded-md transition-colors',
            day_selected:
              'bg-rose-500 text-white hover:bg-rose-600 hover:text-white focus:bg-rose-500 focus:text-white',
            day_today: 'bg-rose-50 text-gray-900 font-semibold',
            day_outside: 'text-gray-400 opacity-50',
            day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed',
            day_range_middle:
              'aria-selected:bg-rose-500 aria-selected:text-white',
            day_hidden: 'invisible',
          }}
          components={{
            IconLeft: () => <span>←</span>,
            IconRight: () => <span>→</span>,
          }}
        />
        
        {/* CSS za označavanje dana s rezervacijama */}
        <style>{`
          .has-bookings::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background-color: #f43f5e;
            border-radius: 50%;
          }
        `}</style>
      </Card>

      {/* Rezervacije za odabrani dan */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Rezervacije za {format(selectedDate, 'EEEE, dd.MM.yyyy.', { locale: hr })}
            </h3>
            <span className="text-sm text-gray-500">
              {selectedDayBookings.length}{' '}
              {selectedDayBookings.length === 1 ? 'rezervacija' : 'rezervacija'}
            </span>
          </div>

          {selectedDayBookings.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">Nema rezervacija za ovaj dan</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedDayBookings
                .sort((a, b) => {
                  const timeA = a.startAt instanceof Date ? a.startAt.getTime() : 0;
                  const timeB = b.startAt instanceof Date ? b.startAt.getTime() : 0;
                  return timeA - timeB;
                })
                .map((booking) => (
                  <Card
                    key={booking.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onBookingClick?.(booking)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`w-3 h-3 rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          />
                          <h4 className="font-semibold text-gray-900">
                            {booking.clientName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {booking.startAt instanceof Date &&
                            !isNaN(booking.startAt.getTime())
                              ? format(booking.startAt, 'HH:mm', { locale: hr })
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Usluga:</strong> {booking.service?.name || 'N/A'}
                          </p>
                          {userRole === 'owner' && booking.staff && (
                            <p>
                              <strong>Djelatnik:</strong>{' '}
                              {booking.staff.fullName || booking.staff.email}
                            </p>
                          )}
                          {booking.clientPhone && (
                            <p>
                              <strong>Telefon:</strong> {booking.clientPhone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )} text-white`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

