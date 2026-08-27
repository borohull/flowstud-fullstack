import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';

const COLORS = ['purple', 'blue', 'green', 'red', 'orange', 'yellow'];

const COLOR_MAP = {
  purple: 'bg-purple-500',
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  red:    'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/courses/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['courses', id]); qc.invalidateQueries(['courses']); setEditing(false); },
    onError: (err) => setError(err.response?.data?.message || 'Update failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/courses/${id}`),
    onSuccess: () => { qc.invalidateQueries(['courses']); navigate('/courses'); },
  });

  const startEdit = () => {
    setForm({ title: course.title, description: course.description ?? '', color_theme: course.color_theme, is_archived: course.is_archived });
    setEditing(true);
  };

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;
  if (!course) return <div className="alert alert-error">Course not found.</div>;

  return (
    <div className="space-y-6">
      <div className={`h-3 rounded-xl ${COLOR_MAP[course.color_theme] ?? 'bg-gray-400'}`} />
      <div className="flex items-center gap-4">
        <Link to="/courses" className="btn btn-ghost btn-sm">← Back</Link>
        <h1 className="text-3xl font-bold flex-1">{course.title}</h1>
        <button className="btn btn-outline btn-sm" onClick={startEdit}>Edit</button>
        <button className="btn btn-error btn-sm" onClick={() => { if (confirm('Delete this course?')) deleteMutation.mutate(); }}>Delete</button>
      </div>

      {editing && (
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title">Edit Course</h2>
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <input className="input input-bordered w-full" placeholder="Title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <select className="select select-bordered w-full"
              value={form.color_theme} onChange={e => setForm({ ...form, color_theme: e.target.value })}>
              {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox" checked={form.is_archived}
                onChange={e => setForm({ ...form, is_archived: e.target.checked })} />
              <span>Archived</span>
            </label>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => updateMutation.mutate(form)}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {course.description && (
        <p className="text-base-content/70">{course.description}</p>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Assignments in this Course</h2>
        {course.assignments?.length === 0 ? (
          <p className="text-base-content/60">No assignments in this course yet.</p>
        ) : (
          <div className="space-y-2">
            {course.assignments?.map(a => (
              <Link key={a.id} to={`/assignments/${a.id}`}>
                <div className="card bg-base-100 shadow hover:shadow-md transition-shadow">
                  <div className="card-body py-3 flex-row items-center justify-between">
                    <span className={a.completed_at ? 'line-through text-base-content/50' : ''}>{a.title}</span>
                    <span className={`badge ${a.priority === 'high' ? 'badge-error' : a.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                      {a.priority}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
