import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { formatDate } from '../../utils/date';

export default function AssignmentsList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignment_type: 'homework', priority: 'medium', status: 'pending', due_date: '' });
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      return api.get(`/assignments?${params}`).then(r => r.data);
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then(r => r.data),
  });

  const toggleTag = (id) => setSelectedTags(prev =>
    prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
  );

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/assignments', data);
      const id = res.data.id;
      await Promise.all(selectedTags.map(tagId => api.post(`/assignments/${id}/tags/${tagId}`)));
      return res;
    },
    onSuccess: (res) => {
      qc.invalidateQueries(['assignments']);
      navigate(`/assignments/${res.data.id}`);
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create.'),
  });

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Assignment</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="select select-bordered select-sm"
          value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="select select-bordered select-sm"
          value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title">Create Assignment</h2>
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <input className="input input-bordered w-full" placeholder="Title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description (optional)"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="select select-bordered w-full" value={form.course_id ?? ''}
                onChange={e => setForm({ ...form, course_id: e.target.value || undefined })}>
                <option value="">No Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select className="select select-bordered w-full" value={form.assignment_type}
                onChange={e => setForm({ ...form, assignment_type: e.target.value })}>
                {['homework','quiz','exam','project','reading','presentation','lab','personal','other'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
              <select className="select select-bordered w-full" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input type="date" className="input input-bordered w-full"
                value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            {tags.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-1">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button key={tag.id} type="button"
                      className={`badge badge-lg cursor-pointer border-2 ${selectedTags.includes(tag.id) ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: tag.color ?? '#6366f1', color: '#fff' }}
                      onClick={() => toggleTag(tag.id)}>
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => createMutation.mutate(form)}>Create</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {assignments.map(a => (
          <Link key={a.id} to={`/assignments/${a.id}`}>
            <div className="card bg-base-100 shadow hover:shadow-md transition-shadow">
              <div className="card-body py-3 flex-row items-center justify-between flex-wrap gap-2">
                <div>
                  <p className={`font-semibold ${a.completed_at ? 'line-through text-base-content/50' : ''}`}>{a.title}</p>
                  {a.course && <p className="text-xs text-base-content/60">{a.course.title}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {a.due_date && <span className="badge badge-ghost">{formatDate(a.due_date)}</span>}
                  <span className={`badge ${a.priority === 'high' ? 'badge-error' : a.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                    {a.priority}
                  </span>
                  <span className="badge badge-outline">{a.status}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {assignments.length === 0 && <p className="text-base-content/60">No assignments found.</p>}
      </div>
    </div>
  );
}
