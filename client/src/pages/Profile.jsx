import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    username: user?.username ?? '',
    bio: user?.bio ?? '',
    is_profile_public: user?.is_profile_public ?? true,
    show_completed_assignments_count: user?.show_completed_assignments_count ?? true,
    show_study_streak: user?.show_study_streak ?? true,
    show_study_sessions_count: user?.show_study_sessions_count ?? true,
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeList, setActiveList] = useState(null); // 'followers' | 'following' | null

  // Fetch counts from the profile endpoint
  const { data: profileData } = useQuery({
    queryKey: ['my-profile', user?.username],
    queryFn: () => api.get(`/users/${user.username}`).then(r => r.data),
    enabled: !!user?.username,
  });

  // Fetch followers or following list on demand
  const { data: listData = [], isLoading: listLoading } = useQuery({
    queryKey: ['social-list', activeList],
    queryFn: () => api.get(`/user/${activeList}`).then(r => r.data),
    enabled: !!activeList,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.patch('/user/profile', form);
      setSuccess('Profile updated!');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' ') : 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleList = (type) => {
    setActiveList(prev => prev === type ? null : type);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl">Profile Settings</h1>

      {/* Social stats */}
      <div className="card bg-base-100 p-4">
        <div className="flex gap-6 justify-center">
          <button
            className={`text-center cursor-pointer hover:text-primary transition-colors ${activeList === 'followers' ? 'text-primary' : ''}`}
            onClick={() => toggleList('followers')}
          >
            <div className="font-game text-2xl">{profileData?.followers_count ?? 0}</div>
            <div className="text-sm text-base-content/60">FOLLOWERS</div>
          </button>
          <div className="divider divider-horizontal" />
          <button
            className={`text-center cursor-pointer hover:text-primary transition-colors ${activeList === 'following' ? 'text-primary' : ''}`}
            onClick={() => toggleList('following')}
          >
            <div className="font-game text-2xl">{profileData?.following_count ?? 0}</div>
            <div className="text-sm text-base-content/60">FOLLOWING</div>
          </button>
        </div>

        {/* Expanded list */}
        {activeList && (
          <div className="mt-4 border-t border-base-300 pt-4 space-y-2">
            <div className="font-game text-sm mb-3 text-base-content/60">
              {activeList === 'followers' ? 'FOLLOWERS' : 'FOLLOWING'}
            </div>
            {listLoading && <div className="text-center py-4">Loading...</div>}
            {!listLoading && listData.length === 0 && (
              <div className="text-center py-4 text-base-content/40 text-sm">
                {activeList === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
              </div>
            )}
            {listData.map(u => (
              <Link
                key={u.id}
                to={`/users/${u.username}`}
                className="flex items-center gap-3 p-2 hover:bg-base-200 transition-colors"
              >
                <div className="w-9 h-9 bg-primary flex items-center justify-center text-primary-content font-game text-sm flex-shrink-0">
                  {u.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <div className="font-semibold text-sm">{u.name}</div>
                  <div className="text-xs text-base-content/50">@{u.username}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Settings form */}
      <div className="card bg-base-100">
        <div className="card-body">
          {success && <div className="alert alert-success text-sm">{success}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Full Name</span></label>
              <input className="input input-bordered" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Username</span></label>
              <input className="input input-bordered" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Bio</span></label>
              <textarea className="textarea textarea-bordered" value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>

            <div className="divider">Privacy Settings</div>

            {[
              ['is_profile_public', 'Public Profile'],
              ['show_completed_assignments_count', 'Show Completed Assignments Count'],
              ['show_study_streak', 'Show Study Streak'],
              ['show_study_sessions_count', 'Show Study Sessions Count'],
            ].map(([key, label]) => (
              <div key={key} className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{label}</span>
                  <input type="checkbox" className="toggle toggle-primary"
                    checked={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                </label>
              </div>
            ))}

            <button className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
