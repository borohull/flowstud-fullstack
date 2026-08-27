import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { formatDate } from '../utils/date';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  });

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;
  if (error) return <div className="alert alert-error">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Study Streak</div>
          <div className="stat-value text-primary">🔥 {data.streak}</div>
          <div className="stat-desc">consecutive days</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Level</div>
          <div className="stat-value text-secondary">⚡ {data.level}</div>
          <div className="stat-desc">{data.xp} XP total</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">XP Progress</div>
          <div className="stat-value text-accent">{data.xp_into_level}/100</div>
          <div className="stat-desc">to next level</div>
        </div>
      </div>

      {/* XP bar */}
      <div className="bg-base-100 rounded-box shadow p-4">
        <p className="font-semibold mb-2">Level {data.level} Progress</p>
        <progress className="progress progress-primary w-full" value={data.xp_into_level} max="100" />
      </div>

      {/* Upcoming assignments */}
      <div className="bg-base-100 rounded-box shadow p-4">
        <h2 className="text-xl font-bold mb-4">Upcoming Assignments</h2>
        {data.upcoming.length === 0 ? (
          <p className="text-base-content/60">No upcoming assignments. You're all caught up! 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {data.upcoming.map(a => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.course?.title ?? '—'}</td>
                    <td>{formatDate(a.due_date)}</td>
                    <td>
                      <span className={`badge ${a.priority === 'high' ? 'badge-error' : a.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                        {a.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
