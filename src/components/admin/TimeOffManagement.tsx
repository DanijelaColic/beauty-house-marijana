'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Edit2, X, Calendar } from 'lucide-react';
import type { TimeOff, Staff } from '@/types';

export default function TimeOffManagement() {
  const [timeOffList, setTimeOffList] = useState<TimeOff[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    allDay: true,
    recurring: false,
    active: true,
    staffId: '', // Empty string = global, UUID = specific staff
  });

  useEffect(() => {
    loadTimeOff();
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoadingStaff(true);
      const response = await fetch('/api/staff', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffList(data.data || []);
        }
      }
    } catch (err: any) {
      console.error('Error loading staff:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadTimeOff = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Loading time-off...');
      const response = await fetch('/api/admin/time-off', {
        credentials: 'include',
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Time-off data:', data);
        if (data.success) {
          setTimeOffList(data.data || []);
        } else {
          console.error('❌ API returned error:', data.error);
          setError(data.error || 'Greška pri učitavanju slobodnih dana');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ HTTP error:', response.status, errorData);
        setError(errorData.error || `Greška pri učitavanju slobodnih dana (${response.status})`);
      }
    } catch (err: any) {
      console.error('❌ Error loading time-off:', err);
      setError(`Greška pri učitavanju slobodnih dana: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError('Molimo popunite sva obavezna polja');
      return;
    }

    try {
      setSubmitting(true);

      const url = '/api/admin/time-off';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(editingId ? 'Slobodan dan je ažuriran' : 'Slobodan dan je dodan');
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          startDate: '',
          endDate: '',
          allDay: true,
          recurring: false,
          active: true,
          staffId: '',
        });
        loadTimeOff();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Greška pri spremanju');
      }
    } catch (err: any) {
      console.error('Error saving time-off:', err);
      setError('Greška pri spremanju slobodnog dana');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (timeOff: TimeOff) => {
    try {
      setEditingId(timeOff.id);
      const startDate = timeOff.startDate instanceof Date 
        ? timeOff.startDate 
        : new Date(timeOff.startDate);
      const endDate = timeOff.endDate instanceof Date 
        ? timeOff.endDate 
        : new Date(timeOff.endDate);
      
      setFormData({
        name: timeOff.name,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        allDay: timeOff.allDay,
        recurring: timeOff.recurring,
        active: timeOff.active,
        staffId: timeOff.staffId || '', // Empty string for global
      });
      setShowForm(true);
      setError('');
      setSuccess('');
    } catch (err: any) {
      console.error('Error editing time-off:', err);
      setError(`Greška pri učitavanju podataka za uređivanje: ${err.message || String(err)}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj slobodan dan?')) {
      return;
    }

    try {
      setError('');
      
      const response = await fetch(`/api/admin/time-off?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Slobodan dan je obrisan');
        loadTimeOff();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Greška pri brisanju');
      }
    } catch (err: any) {
      console.error('Error deleting time-off:', err);
      setError('Greška pri brisanju slobodnog dana');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      allDay: true,
      recurring: false,
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

  // Error boundary - if there's an error, show it
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => loadTimeOff()}>Pokušaj ponovno</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Slobodni dani</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upravljajte slobodnim danima i godišnjim odmorima. Gosti neće vidjeti dostupne termine za te dane.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Dodaj slobodan dan</span>
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
            <CardTitle>{editingId ? 'Uredi slobodan dan' : 'Dodaj slobodan dan'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Naziv *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="npr. Godišnji odmor, Božić, Zatvaranje salona, Bolovanje"
                  required
                />
              </div>

              <div>
                <Label htmlFor="staffId">Djelatnik (opcionalno)</Label>
                <select
                  id="staffId"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">Svi djelatnici (globalni slobodan dan)</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ako ne odaberete djelatnika, slobodan dan će se primijeniti na sve djelatnike. 
                  Odaberite djelatnika za individualne slobodne dane (npr. bolovanje).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Datum od *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Datum do *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Aktivno</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Ponavljajući (godišnje)</span>
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
      {timeOffList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nema dodanih slobodnih dana</p>
            <p className="text-sm text-gray-500 mt-2">
              Kliknite "Dodaj slobodan dan" da dodate prvi unos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {timeOffList.map((timeOff) => (
            <Card key={timeOff.id} className={!timeOff.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{timeOff.name}</h3>
                      {timeOff.staffId ? (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Individualni
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Globalni
                        </span>
                      )}
                      {!timeOff.active && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Neaktivno
                        </span>
                      )}
                      {timeOff.recurring && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Ponavljajući
                        </span>
                      )}
                    </div>
                    {timeOff.staffId && (
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        Djelatnik: {staffList.find(s => s.id === timeOff.staffId)?.name || 'Nepoznato'}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {timeOff.startDate instanceof Date 
                        ? format(timeOff.startDate, 'dd.MM.yyyy', { locale: hr })
                        : format(new Date(timeOff.startDate), 'dd.MM.yyyy', { locale: hr })
                      }{' '}
                      -{' '}
                      {timeOff.endDate instanceof Date
                        ? format(timeOff.endDate, 'dd.MM.yyyy', { locale: hr })
                        : format(new Date(timeOff.endDate), 'dd.MM.yyyy', { locale: hr })
                      }
                    </p>
                    {(() => {
                      const startDate = timeOff.startDate instanceof Date 
                        ? timeOff.startDate 
                        : new Date(timeOff.startDate);
                      const endDate = timeOff.endDate instanceof Date 
                        ? timeOff.endDate 
                        : new Date(timeOff.endDate);
                      
                      return startDate.getTime() === endDate.getTime() ? (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(startDate, 'EEEE', { locale: hr })}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.ceil(
                            (endDate.getTime() - startDate.getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}{' '}
                          dana
                        </p>
                      );
                    })()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(timeOff)}
                      className="flex items-center space-x-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Uredi</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(timeOff.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Obriši</span>
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

