import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { formatDate } from '../../utils/date';

export default function SessionsList() {
  const qc = useQueryClient();
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', session_date: '' });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/sessions', data),
    onSuccess: () => { qc.invalidateQueries(['sessions']); setShowForm(false); setForm({ title: '', description: '', session_date: '' }); },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create session.'),
  });

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Study Sessions</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Session</button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title">Create Session</h2>
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <input className="input input-bordered w-full" placeholder="Session title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description (optional)"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input type="date" className="input input-bordered w-full"
              value={form.session_date} onChange={e => setForm({ ...form, session_date: e.target.value })} />
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => createMutation.mutate(form)}>Create</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map(session => (
          <Link key={session.id} to={`/sessions/${session.id}`}>
            <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
              <div className="card-body">
                <h2 className="card-title">{session.title}</h2>
                {session.session_date && <p className="text-sm text-base-content/60">📅 {formatDate(session.session_date)}</p>}
                {session.description && <p className="text-sm text-base-content/70">{session.description}</p>}
                <span className={`badge w-fit ${session.status === 'completed' ? 'badge-success' : session.status === 'in_progress' ? 'badge-warning' : 'badge-ghost'}`}>
                  {session.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {sessions.length === 0 && <p className="text-base-content/60 col-span-full">No sessions yet.</p>}
      </div>
    </div>
  );
}
