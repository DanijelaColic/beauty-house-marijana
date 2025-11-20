'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import hr from 'date-fns/locale/hr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Edit2, X, Users } from 'lucide-react';
import type { StaffProfile } from '@/types';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'staff' as 'owner' | 'staff',
    active: true,
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/staff', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffList(data.data || []);
        } else {
          setError(data.error || 'Greška pri učitavanju djelatnika');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || `Greška pri učitavanju djelatnika (${response.status})`);
      }
    } catch (err: any) {
      console.error('Error loading staff:', err);
      setError(`Greška pri učitavanju djelatnika: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName) {
      setError('Ime je obavezno');
      return;
    }

    try {
      setSubmitting(true);

      const url = '/api/admin/staff';
      const method = 'PUT';
      const body = {
        id: editingId,
        fullName: formData.fullName,
        role: formData.role,
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
        setSuccess('Djelatnik je ažuriran');
        setShowForm(false);
        setEditingId(null);
        setFormData({
          fullName: '',
          role: 'staff',
          active: true,
        });
        loadStaff();
      } else {
        setError(data.error || 'Greška pri spremanju djelatnika');
      }
    } catch (err: any) {
      console.error('Error saving staff:', err);
      setError('Greška pri spremanju djelatnika');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (staff: StaffProfile) => {
    setEditingId(staff.id);
    setFormData({
      fullName: staff.fullName || staff.email,
      role: staff.role,
      active: staff.active,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite deaktivirati ovog djelatnika?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Djelatnik je deaktiviran');
        loadStaff();
      } else {
        setError(data.error || 'Greška pri brisanju djelatnika');
      }
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      setError('Greška pri brisanju djelatnika');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      fullName: '',
      role: 'staff',
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
            <CardTitle>{editingId ? 'Uredi djelatnika' : 'Dodaj djelatnika'}</CardTitle>
          </CardHeader>
          <CardContent>
            {!editingId && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800">
                  Dodavanje novih djelatnika zahtijeva kreiranje korisničkog računa u Supabase Auth.
                  Molimo koristite Supabase dashboard za kreiranje korisnika, a zatim ažurirajte profil ovdje.
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Ime i prezime *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ime i prezime djelatnika"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Uloga *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'owner' | 'staff' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  required
                >
                  <option value="staff">Djelatnik</option>
                  <option value="owner">Vlasnik</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Vlasnik ima pun pristup svim funkcijama, djelatnik može upravljati rezervacijama.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Aktivan (može se prijaviti i upravljati rezervacijama)</span>
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button type="submit" disabled={submitting || !editingId}>
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
      {staffList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nema dodanih djelatnika</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {staffList.map((staff) => (
            <Card key={staff.id} className={!staff.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {staff.fullName || staff.email}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          staff.role === 'owner'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {staff.role === 'owner' ? 'Vlasnik' : 'Djelatnik'}
                      </span>
                      {!staff.active && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Neaktivan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{staff.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(staff)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {staff.role !== 'owner' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(staff.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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

