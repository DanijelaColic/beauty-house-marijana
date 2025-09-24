'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Clock, Euro } from 'lucide-react';
import type { Service } from '@/types';

interface ServiceSelectProps {
  services: Service[];
  loading: boolean;
  onSelect: (serviceId: string) => void;
  error?: string;
  selectedServiceId?: string;
}

export function ServiceSelect({ 
  services, 
  loading, 
  onSelect, 
  error,
  selectedServiceId 
}: ServiceSelectProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-textSecondary">Učitavam usluge...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-textSecondary">Trenutno nema dostupnih usluga.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <Card
          key={service.id}
          className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
            selectedServiceId === service.id 
              ? 'border-primary bg-primary/5 shadow-md' 
              : ''
          }`}
          onClick={() => onSelect(service.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-textPrimary mb-1">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-textSecondary mb-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-textSecondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  {service.price && (
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      <span>{service.price}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedServiceId === service.id
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}>
                {selectedServiceId === service.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
