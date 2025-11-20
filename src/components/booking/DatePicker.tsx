'use client';

import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import hr from 'date-fns/locale/hr/index.js'; // Croatian locale
import { Card, CardContent } from '@/components/ui/card';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  error?: string;
}

export function DatePicker({ value, onChange, error }: DatePickerProps) {
  const selectedDate = value ? new Date(value) : undefined;
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 30); // Allow booking up to 30 days in advance

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      onChange(formatted);
    }
  };

  const disabledDays = {
    before: addDays(today, 1), // Can't book for today or past days
    after: maxDate,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            disabled={disabledDays}
            locale={hr}
            className="mx-auto"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-textPrimary",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-textPrimary",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-textSecondary rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary [&:has([aria-selected])]:text-white first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-md transition-colors",
              day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
              day_today: "bg-gold/20 text-textPrimary font-semibold",
              day_outside: "text-textSecondary opacity-50",
              day_disabled: "text-textSecondary opacity-50 cursor-not-allowed",
              day_range_middle: "aria-selected:bg-primary aria-selected:text-white",
              day_hidden: "invisible",
            }}
            components={{
              IconLeft: () => <span>←</span>,
              IconRight: () => <span>→</span>,
            }}
          />
        </CardContent>
      </Card>
      
      {selectedDate && (
        <div className="text-center p-3 bg-primary/5 rounded-xl">
          <p className="text-sm text-textSecondary">Odabrani datum:</p>
          <p className="font-medium text-textPrimary">
            {format(selectedDate, 'EEEE, d. MMMM yyyy.', { locale: hr })}
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
