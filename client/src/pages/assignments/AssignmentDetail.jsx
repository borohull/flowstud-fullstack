import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { formatDate } from '../../utils/date';

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignments', id],
    queryFn: () => api.get(`/assignments/${id}`).then(r => r.data),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then(r => r.data),
  });

  const attachTagMutation = useMutation({
    mutationFn: (tagId) => api.post(`/assignments/${id}/tags/${tagId}`),
    onSuccess: () => qc.invalidateQueries(['assignments', id]),
  });

  const detachTagMutation = useMutation({
    mutationFn: (tagId) => api.delete(`/assignments/${id}/tags/${tagId}`),
    onSuccess: () => qc.invalidateQueries(['assignments', id]),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/assignments/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['assignments', id]); qc.invalidateQueries(['assignments']); setEditing(false); },
    onError: (err) => setError(err.response?.data?.message || 'Update failed.'),
  });

  const completeMutation = useMutation({
    mutationFn: () => api.patch(`/assignments/${id}/complete`),
    onSuccess: () => { qc.invalidateQueries(['assignments', id]); qc.invalidateQueries(['dashboard']); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/assignments/${id}`),
    onSuccess: () => { qc.invalidateQueries(['assignments']); navigate('/assignments'); },
  });

  const startEdit = () => {
    setForm({
      title: assignment.title,
      description: assignment.description ?? '',
      course_id: assignment.course_id ?? '',
      assignment_type: assignment.assignment_type,
      priority: assignment.priority,
      status: assignment.status,
      due_date: assignment.due_date ?? '',
    });
    setEditing(true);
  };

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;
  if (!assignment) return <div className="alert alert-error">Assignment not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/assignments" className="btn btn-ghost btn-sm">← Back</Link>
        <h1 className="text-3xl font-bold flex-1">{assignment.title}</h1>
        <button className="btn btn-outline btn-sm" onClick={startEdit}>Edit</button>
        <button
          className={`btn btn-sm ${assignment.completed_at ? 'btn-ghost' : 'btn-success'}`}
          onClick={() => completeMutation.mutate()}
        >
          {assignment.completed_at ? '↩ Uncomplete' : '✓ Complete'}
        </button>
        <button className="btn btn-error btn-sm" onClick={() => { if (confirm('Delete this assignment?')) deleteMutation.mutate(); }}>Delete</button>
      </div>

      {/* Detail card */}
      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${assignment.priority === 'high' ? 'badge-error' : assignment.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
              {assignment.priority} priority
            </span>
            <span className="badge badge-outline">{assignment.status}</span>
            <span className="badge badge-ghost">{assignment.assignment_type}</span>
            {assignment.completed_at && <span className="badge badge-success">Completed ✓</span>}
          </div>
          {assignment.course && <p className="text-sm"><strong>Course:</strong> {assignment.course.title}</p>}
          {assignment.due_date && <p className="text-sm"><strong>Due:</strong> {formatDate(assignment.due_date)}</p>}
          {assignment.description && <p className="text-base-content/80">{assignment.description}</p>}
          <div className="mt-3">
            <p className="text-sm font-semibold mb-1">Tags</p>
            <div className="flex flex-wrap gap-2">
              {assignment.tags?.map(tag => (
                <span key={tag.id} className="badge badge-lg gap-1" style={{ backgroundColor: tag.color ?? '#6366f1', color: '#fff' }}>
                  {tag.name}
                  <button className="ml-1 font-bold" onClick={() => detachTagMutation.mutate(tag.id)}>×</button>
                </span>
              ))}
            </div>
            {allTags.filter(t => !assignment.tags?.find(at => at.id === t.id)).length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-base-content/60 mb-1">Add tag:</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.filter(t => !assignment.tags?.find(at => at.id === t.id)).map(tag => (
                    <button key={tag.id} type="button"
                      className="badge badge-lg cursor-pointer opacity-60 hover:opacity-100"
                      style={{ backgroundColor: tag.color ?? '#6366f1', color: '#fff' }}
                      onClick={() => attachTagMutation.mutate(tag.id)}>
                      + {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <h2 className="card-title">Edit Assignment</h2>
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <input className="input input-bordered w-full" placeholder="Title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="select select-bordered w-full" value={form.course_id}
                onChange={e => setForm({ ...form, course_id: e.target.value || null })}>
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
              <select className="select select-bordered w-full" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <input type="date" className="input input-bordered w-full"
                value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => updateMutation.mutate(form)}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
