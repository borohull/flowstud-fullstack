import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  const stats = [
    { label: 'Users', value: data.user_count, icon: '👥', href: '/admin/users' },
    { label: 'Assignments', value: data.assignment_count, icon: '📋', href: null },
    { label: 'Sessions', value: data.session_count, icon: '⏱️', href: null },
    { label: 'Tags', value: data.tag_count, icon: '🏷️', href: '/admin/tags' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card bg-base-100 shadow">
            <div className="card-body items-center text-center py-6">
              <div className="text-4xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-base-content/60 text-sm">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
        <Link to="/admin/tags" className="btn btn-secondary">Manage Tags</Link>
      </div>
    </div>
  );
}
