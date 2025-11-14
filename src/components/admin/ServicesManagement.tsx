'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Edit2, X, Scissors } from 'lucide-react';
import type { Service } from '@/types';

export default function ServicesManagement() {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    active: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/services', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServicesList(data.data || []);
        } else {
          setError(data.error || 'Greška pri učitavanju usluga');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || `Greška pri učitavanju usluga (${response.status})`);
      }
    } catch (err: any) {
      console.error('Error loading services:', err);
      setError(`Greška pri učitavanju usluga: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.duration) {
      setError('Naziv i trajanje su obavezni');
      return;
    }

    try {
      setSubmitting(true);

      const url = editingId ? '/api/admin/services' : '/api/admin/services';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? {
            id: editingId,
            name: formData.name,
            description: formData.description || null,
            duration: parseInt(formData.duration),
            price: formData.price ? parseFloat(formData.price) : null,
            active: formData.active,
          }
        : {
            name: formData.name,
            description: formData.description || null,
            duration: parseInt(formData.duration),
            price: formData.price ? parseFloat(formData.price) : null,
            active: formData.active,
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingId ? 'Usluga je ažurirana' : 'Usluga je dodana');
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          description: '',
          duration: '',
          price: '',
          active: true,
        });
        loadServices();
      } else {
        setError(data.error || 'Greška pri spremanju usluge');
      }
    } catch (err: any) {
      console.error('Error saving service:', err);
      setError('Greška pri spremanju usluge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration.toString(),
      price: service.price?.toString() || '',
      active: service.active,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu uslugu?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Usluga je obrisana');
        loadServices();
      } else {
        setError(data.error || 'Greška pri brisanju usluge');
      }
    } catch (err: any) {
      console.error('Error deleting service:', err);
      setError('Greška pri brisanju usluge');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: '',
      active: true,
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        <span className="ml-2 text-gray-600">Učitavanje...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Dodaj uslugu</span>
          </Button>
        )}
      </div>

      {/* Success/Error messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Uredi uslugu' : 'Dodaj uslugu'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Naziv usluge *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="npr. Šišanje, Bojanje, Styling"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Opis</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Opis usluge"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Trajanje (minute) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="45"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Cijena (HRK)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="25.00"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Aktivno (vidljivo gostima)</span>
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Spremanje...
                    </>
                  ) : (
                    'Spremi'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Odustani
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {servicesList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nema dodanih usluga</p>
            <p className="text-sm text-gray-500 mt-2">
              Kliknite "Dodaj uslugu" da dodate prvu uslugu
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {servicesList.map((service) => (
            <Card key={service.id} className={!service.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      {!service.active && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Neaktivno
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Trajanje: {service.duration} min</span>
                      {service.price && <span>Cijena: {service.price.toFixed(2)} HRK</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

