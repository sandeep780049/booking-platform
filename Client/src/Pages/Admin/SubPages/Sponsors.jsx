import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', website: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/sponsors`, { withCredentials: true });
      setSponsors(res.data.data || []);
    } catch (e) {
      toast.error('Failed to fetch sponsors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSponsors(); }, []);

  const resetForm = () => {
    setForm({ name: '', website: '', description: '' });
    setLogoFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.website) formData.append('website', form.website);
      if (form.description) formData.append('description', form.description);
      if (logoFile) formData.append('logo', logoFile);
      let res;
      if (editingId) {
        res = await axios.put(`${API_BASE}/api/sponsors/${editingId}`, formData, { withCredentials: true });
        toast.success('Sponsor updated');
      } else {
        res = await axios.post(`${API_BASE}/api/sponsors`, formData, { withCredentials: true });
        toast.success('Sponsor created');
      }
      if (res.data?.data) {
        fetchSponsors();
        resetForm();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setForm({ name: s.name || '', website: s.website || '', description: s.description || '' });
    setLogoFile(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete sponsor?')) return;
    try {
      await axios.delete(`${API_BASE}/api/sponsors/${id}`, { withCredentials: true });
      toast.success('Sponsor deleted');
      setSponsors(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sponsors</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded bg-white shadow-sm md:col-span-1">
          <h3 className="font-medium">{editingId ? 'Edit Sponsor' : 'Add Sponsor'}</h3>
          <div>
            <label className="block text-sm mb-1">Name *</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Website</label>
            <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://" />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Logo {editingId ? '(leave empty to keep existing)' : ''}</label>
            <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>

        <div className="md:col-span-2 space-y-4">
          {loading ? <p>Loading...</p> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sponsors.map(s => (
                <div key={s._id} className="border rounded p-3 bg-white flex flex-col gap-2 shadow-sm">
                  {s.logoUrl && <img src={s.logoUrl} alt={s.name} className="h-20 object-contain" />}
                  <div>
                    <h4 className="font-medium">{s.name}</h4>
                    {s.website && <a href={s.website} target="_blank" className="text-xs text-blue-600 underline">{s.website}</a>}
                    {s.description && <p className="text-xs mt-1 line-clamp-3">{s.description}</p>}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(s._id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {sponsors.length === 0 && !loading && <p className="text-sm text-muted-foreground">No sponsors yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
