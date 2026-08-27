import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function CoursesList() {
  const qc = useQueryClient();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color_theme: 'blue' });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/courses', data),
    onSuccess: () => { qc.invalidateQueries(['courses']); setShowForm(false); setForm({ title: '', description: '', color_theme: 'blue' }); },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create course.'),
  });

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Course</button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Create Course</h2>
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <div className="space-y-3">
              <input className="input input-bordered w-full" placeholder="Title"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full" placeholder="Description (optional)"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <select className="select select-bordered w-full"
                value={form.color_theme} onChange={e => setForm({ ...form, color_theme: e.target.value })}>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={() => createMutation.mutate(form)}>Create</button>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <div className={`card bg-base-100 shadow hover:shadow-lg transition-shadow ${course.is_archived ? 'opacity-60' : ''}`}>
              <div className={`h-2 rounded-t-2xl ${COLOR_MAP[course.color_theme] ?? 'bg-gray-400'}`} />
              <div className="card-body">
                <h2 className="card-title">{course.title}</h2>
                {course.description && <p className="text-sm text-base-content/70">{course.description}</p>}
                {course.is_archived && <span className="badge badge-ghost">Archived</span>}
              </div>
            </div>
          </Link>
        ))}
        {courses.length === 0 && (
          <p className="text-base-content/60 col-span-full">No courses yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}
