'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameWeek,
  isSameMonth,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  setHours,
  setMinutes,
} from 'date-fns';
import { hr } from 'date-fns/locale';
import type { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarView = 'day' | 'week' | 'month' | 'year';

interface AdvancedCalendarProps {
  bookings: Booking[];
  selectedStaffId?: string;
  selectedServiceId?: string;
  onDateClick?: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
}

function AdvancedCalendar({
  bookings,
  selectedStaffId,
  selectedServiceId,
  onDateClick,
  onBookingClick,
}: AdvancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  // Filter bookings by staff if selected (serviceId filter is optional - only filter if provided)
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Filter by staff if selected
    // Note: This component doesn't know userRole, so it filters based on selectedStaffId
    // If selectedStaffId is empty, show all bookings (for admin viewing all)
    if (selectedStaffId && selectedStaffId.trim() !== '') {
      filtered = bookings.filter((b) => {
        // Match if staffId matches, or if booking has no staffId assigned
        return b.staffId === selectedStaffId || !b.staffId;
      });
    }
    
    // Service filtering removed - showing all bookings for selected staff
    
    // Filter out canceled bookings and invalid dates
    const validBookings = filtered.filter(
      (b) => b.status !== 'CANCELED' && b.startAt instanceof Date && !isNaN(b.startAt.getTime())
    );
    
    return validBookings;
  }, [bookings, selectedStaffId, selectedServiceId, currentDate]);

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };
  const goToNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    const dayBookings = filteredBookings.filter((booking) => {
      if (!booking.startAt || !(booking.startAt instanceof Date)) return false;
      return isSameDay(booking.startAt, date);
    });
    
    // Sort by time
    return dayBookings.sort((a, b) => {
      if (!a.startAt || !b.startAt) return 0;
      return a.startAt.getTime() - b.startAt.getTime();
    });
  };

  // Get bookings for a specific week
  const getBookingsForWeek = (weekStart: Date): Booking[] => {
    return filteredBookings.filter((booking) => {
      if (!booking.startAt || !(booking.startAt instanceof Date)) return false;
      return isSameWeek(booking.startAt, weekStart, { weekStartsOn: 1 });
    });
  };

  // Generate time slots for day view (8:00 - 20:00)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Check if a time slot is booked (checks if any booking overlaps with this time slot)
  const isTimeSlotBooked = (date: Date, time: string): Booking | null => {
    const [hour, minute] = time.split(':').map(Number);
    const slotStart = setMinutes(setHours(startOfDay(date), hour), minute);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // 30 min slot

    return (
      filteredBookings.find((booking) => {
        if (!booking.startAt || !(booking.startAt instanceof Date)) return false;
        if (!isSameDay(booking.startAt, date)) return false;
        
        const bookingStart = booking.startAt;
        const bookingEnd = booking.endAt instanceof Date 
          ? booking.endAt 
          : new Date(booking.startAt.getTime() + (booking.service?.duration || 30) * 60000);
        
        // Check if slot overlaps with booking (slot starts before booking ends AND slot ends after booking starts)
        return slotStart < bookingEnd && slotEnd > bookingStart;
      }) || null
    );
  };

  // Render Day View
  const renderDayView = () => {
    const dayBookings = getBookingsForDate(currentDate);
    const today = new Date();
    const isToday = isSameDay(currentDate, today);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1">
            {timeSlots.map((time) => {
              const booking = isTimeSlotBooked(currentDate, time);
              const [hour, minute] = time.split(':').map(Number);
              const slotTime = setMinutes(setHours(startOfDay(currentDate), hour), minute);
              const isPast = slotTime < today;

              return (
                <div
                  key={time}
                  className={`border-b border-gray-200 min-h-[60px] p-2 ${
                    isPast ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50'
                  } ${booking ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (!isPast && onDateClick) {
                      onDateClick(slotTime);
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div className="w-16 text-sm text-gray-500 font-medium">
                      {time}
                    </div>
                    <div className="flex-1">
                      {booking ? (
                        <div
                          className="bg-blue-500 text-white rounded px-2 py-1 text-sm cursor-pointer hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookingClick?.(booking);
                          }}
                        >
                          <div className="font-semibold">{booking.clientName}</div>
                          <div className="text-xs opacity-90">
                            {booking.service?.name || 'N/A'}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekBookings = getBookingsForWeek(weekStart);

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-2 border-r border-gray-200"></div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`p-2 text-center border-r border-gray-200 last:border-r-0 ${
                  isToday ? 'bg-blue-50 font-semibold' : ''
                }`}
              >
                <div className="text-xs text-gray-500">
                  {format(day, 'EEE', { locale: hr })}
                </div>
                <div className={`text-lg ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8">
            <div className="border-r border-gray-200">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-[60px] border-b border-gray-100 p-1 text-xs text-gray-500"
                >
                  {time}
                </div>
              ))}
            </div>
            {weekDays.map((day) => {
              const dayBookings = getBookingsForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className="border-r border-gray-200 last:border-r-0"
                >
                  {timeSlots.map((time) => {
                    const booking = isTimeSlotBooked(day, time);
                    const [hour, minute] = time.split(':').map(Number);
                    const slotTime = setMinutes(setHours(startOfDay(day), hour), minute);
                    const isPast = slotTime < new Date();

                    return (
                      <div
                        key={time}
                        className={`h-[60px] border-b border-gray-100 p-1 ${
                          isPast ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                        } ${booking ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          if (!isPast && onDateClick) {
                            onDateClick(slotTime);
                          }
                        }}
                      >
                        {booking && (
                          <div
                            className="bg-blue-500 text-white rounded px-1 py-0.5 text-xs cursor-pointer hover:bg-blue-600 truncate transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookingClick?.(booking);
                            }}
                            title={`${format(booking.startAt, 'HH:mm')} - ${booking.clientName} - ${booking.service?.name || 'N/A'}`}
                          >
                            {format(booking.startAt, 'HH:mm')} {booking.clientName}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200">
              {week.map((day) => {
                const dayBookings = getBookingsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isPast = day < startOfDay(new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-2 border-r border-gray-200 last:border-r-0 ${
                      !isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
                    } ${isToday ? 'bg-blue-50' : ''} ${isPast ? 'opacity-60' : ''}`}
                    onClick={() => {
                      if (!isPast && onDateClick) {
                        onDateClick(day);
                      }
                    }}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 min-h-[20px]">
                      {dayBookings.length > 0 ? (
                        <>
                          {dayBookings.slice(0, 3).map((booking) => (
                            <div
                              key={booking.id}
                              className="bg-blue-500 text-white rounded px-1 py-0.5 text-xs cursor-pointer hover:bg-blue-600 truncate"
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookingClick?.(booking);
                              }}
                              title={`${format(booking.startAt, 'HH:mm')} - ${booking.clientName}`}
                            >
                              {format(booking.startAt, 'HH:mm')} {booking.clientName}
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div
                              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentDate(day);
                                setView('day');
                              }}
                              title={`Kliknite za detaljan pregled ${dayBookings.length} rezervacija`}
                            >
                              +{dayBookings.length - 3} više
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Year View
  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-4 gap-4 p-4">
        {months.map((month) => {
          const monthBookings = filteredBookings.filter((booking) => {
            if (!booking.startAt || !(booking.startAt instanceof Date)) return false;
            return isSameMonth(booking.startAt, month);
          });
          const isCurrentMonth = isSameMonth(month, new Date());

          return (
            <Card
              key={month.toISOString()}
              className={`p-3 cursor-pointer hover:shadow-md ${
                isCurrentMonth ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                setCurrentDate(month);
                setView('month');
              }}
            >
              <div className="font-semibold text-gray-700 mb-2">
                {format(month, 'MMMM yyyy', { locale: hr })}
              </div>
              <div className="text-sm text-gray-500">
                {monthBookings.length} rezervacija
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, dd. MMMM yyyy.', { locale: hr });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'dd. MMM', { locale: hr })} - ${format(
          weekEnd,
          'dd. MMM yyyy.',
          { locale: hr }
        )}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy.', { locale: hr });
      case 'year':
        return format(currentDate, 'yyyy.');
      default:
        return '';
    }
  };

  return (
    <Card className="p-4">
      {/* Header with navigation and view selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Danas
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {getViewTitle()}
            </div>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {(['day', 'week', 'month', 'year'] as CalendarView[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView(v)}
            >
              {v === 'day' && 'Dan'}
              {v === 'week' && 'Tjedan'}
              {v === 'month' && 'Mjesec'}
              {v === 'year' && 'Godina'}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
        {filteredBookings.length === 0 && bookings.length > 0 && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800">
            <div className="font-semibold mb-2">⚠️ Nema rezervacija koje odgovaraju odabranim filterima</div>
            <div className="text-xs space-y-1">
              <div>Ukupno rezervacija: {bookings.length}</div>
              <div>Filtrirano: {filteredBookings.length}</div>
              {selectedStaffId && <div>Traženi staff ID: {selectedStaffId}</div>}
              {selectedServiceId && <div>Traženi service ID: {selectedServiceId}</div>}
              <div className="mt-2 text-xs text-yellow-700">
                Provjerite konzolu (F12) za detalje o svakoj rezervaciji i zašto se filtrira.
                Možda rezervacije nemaju odgovarajući staff_id ili service_id.
              </div>
              <div className="mt-1 text-xs text-yellow-700">
                Pokušajte odabrati "Sve usluge" u dropdownu za uslugu da vidite sve rezervacije za odabranog djelatnika.
              </div>
            </div>
          </div>
        )}
        {bookings.length === 0 && (
          <div className="p-4 bg-gray-50 text-center text-gray-500">
            Nema rezervacija za prikaz
          </div>
        )}
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
        {view === 'year' && renderYearView()}
      </div>
    </Card>
  );
}

export default AdvancedCalendar;

