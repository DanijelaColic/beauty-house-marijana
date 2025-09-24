'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, X } from 'lucide-react';
import type { TimeSlot } from '@/types';

interface SlotPickerProps {
  slots: TimeSlot[];
  onSelect: (time: string) => void;
  error?: string;
  selectedTime?: string;
}

export function SlotPicker({ slots, onSelect, error, selectedTime }: SlotPickerProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(selectedTime || null);

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    onSelect(time);
  };

  const availableSlots = slots.filter(slot => slot.available);
  const unavailableSlots = slots.filter(slot => !slot.available);

  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto text-textSecondary mb-4" />
          <h3 className="font-medium text-textPrimary mb-2">
            Nema dostupnih termina
          </h3>
          <p className="text-sm text-textSecondary">
            Za odabrani datum trenutno nema slobodnih termina. Molimo odaberite drugi datum.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available slots */}
      {availableSlots.length > 0 && (
        <div>
          <h3 className="font-medium text-textPrimary mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Dostupni termini
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {availableSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedSlot === slot.time ? "default" : "outline"}
                size="sm"
                onClick={() => handleSlotSelect(slot.time)}
                className="h-12"
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Unavailable slots (for reference) */}
      {unavailableSlots.length > 0 && (
        <div>
          <h3 className="font-medium text-textSecondary mb-3 flex items-center gap-2">
            <X className="w-5 h-5" />
            Zauzeti termini
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {unavailableSlots.slice(0, 10).map((slot) => ( // Show only first 10 to avoid clutter
              <Button
                key={slot.time}
                variant="ghost"
                size="sm"
                disabled
                className="h-12 opacity-50 cursor-not-allowed"
                title={slot.reason}
              >
                {slot.time}
              </Button>
            ))}
          </div>
          {unavailableSlots.length > 10 && (
            <p className="text-xs text-textSecondary mt-2">
              ... i još {unavailableSlots.length - 10} zauzetih termina
            </p>
          )}
        </div>
      )}

      {/* Selected time confirmation */}
      {selectedSlot && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary">Odabrano vrijeme:</p>
                <p className="font-medium text-textPrimary">{selectedSlot}</p>
              </div>
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
