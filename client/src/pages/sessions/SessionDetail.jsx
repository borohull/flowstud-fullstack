import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { formatDate } from '../../utils/date';

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ['sessions', id],
    queryFn: () => api.get(`/sessions/${id}`).then(r => r.data),
  });

  const { data: allAssignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => api.get('/assignments').then(r => r.data),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/sessions/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['sessions', id]); setEditing(false); },
    onError: (err) => setError(err.response?.data?.message || 'Update failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/sessions/${id}`),
    onSuccess: () => { qc.invalidateQueries(['sessions']); navigate('/sessions'); },
  });

  const addItemMutation = useMutation({
    mutationFn: (assignment_id) => api.post(`/sessions/${id}/items`, { assignment_id }),
    onSuccess: () => { qc.invalidateQueries(['sessions', id]); setSelectedAssignment(''); },
  });

  const removeItemMutation = useMutation({
    mutationFn: (assignmentId) => api.delete(`/sessions/${id}/items/${assignmentId}`),
    onSuccess: () => qc.invalidateQueries(['sessions', id]),
  });

  const startEdit = () => {
    setForm({ title: session.title, description: session.description ?? '', session_date: session.session_date ?? '', status: session.status });
    setEditing(true);
  };

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;
  if (!session) return <div className="alert alert-error">Session not found.</div>;

  const sessionAssignmentIds = new Set(session.assignments?.map(a => a.id));
  const availableAssignments = allAssignments.filter(a => !sessionAssignmentIds.has(a.id) && !a.completed_at);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/sessions" className="btn btn-ghost btn-sm">← Back</Link>
        <h1 className="text-3xl font-bold flex-1">{session.title}</h1>
        <button className="btn btn-outline btn-sm" onClick={startEdit}>Edit</button>
        <button className="btn btn-error btn-sm" onClick={() => { if (confirm('Delete this session?')) deleteMutation.mutate(); }}>Delete</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {session.session_date && <span className="badge badge-ghost">📅 {formatDate(session.session_date)}</span>}
        <span className={`badge ${session.status === 'completed' ? 'badge-success' : session.status === 'in_progress' ? 'badge-warning' : 'badge-ghost'}`}>
          {session.status}
        </span>
      </div>

      {session.description && <p className="text-base-content/70">{session.description}</p>}

      {editing && (
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title">Edit Session</h2>
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <input className="input input-bordered w-full" placeholder="Title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input type="date" className="input input-bordered w-full"
              value={form.session_date} onChange={e => setForm({ ...form, session_date: e.target.value })} />
            <select className="select select-bordered w-full" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => updateMutation.mutate(form)}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add assignment to session */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Add Assignment to Session</h2>
          <div className="flex gap-2">
            <select className="select select-bordered flex-1"
              value={selectedAssignment} onChange={e => setSelectedAssignment(e.target.value)}>
              <option value="">Select an assignment...</option>
              {availableAssignments.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
            <button className="btn btn-primary"
              disabled={!selectedAssignment}
              onClick={() => addItemMutation.mutate(Number(selectedAssignment))}>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Session queue */}
      <div>
        <h2 className="text-xl font-bold mb-4">Session Queue ({session.assignments?.length ?? 0})</h2>
        {session.assignments?.length === 0 ? (
          <p className="text-base-content/60">No assignments in this session yet.</p>
        ) : (
          <div className="space-y-2">
            {session.assignments?.map((a, idx) => (
              <div key={a.id} className="card bg-base-100 shadow">
                <div className="card-body py-3 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-base-content/40 font-mono text-sm">#{idx + 1}</span>
                    <div>
                      <p className={`font-semibold ${a.completed_at ? 'line-through text-base-content/50' : ''}`}>{a.title}</p>
                      {a.course && <p className="text-xs text-base-content/60">{a.course.title}</p>}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm text-error"
                    onClick={() => removeItemMutation.mutate(a.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
