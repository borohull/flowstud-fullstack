import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Navigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { username } = useParams();
  const qc = useQueryClient();
  const { user: me } = useAuth();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => api.get(`/users/${username}`).then(r => r.data),
  });

  const follow = useMutation({
    mutationFn: () => api.post(`/users/${profile.id}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-profile', username] }),
  });

  const unfollow = useMutation({
    mutationFn: () => api.delete(`/users/${profile.id}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-profile', username] }),
  });

  // Redirect to own profile settings if viewing yourself
  if (profile && me && profile.id === me.id) {
    return <Navigate to="/profile" replace />;
  }

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  if (isError) return (
    <div className="text-center py-12">
      <p className="text-error mb-4">Player not found.</p>
      <Link to="/search" className="btn btn-primary btn-sm">Back to Search</Link>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto">
      <Link to="/search" className="btn btn-ghost btn-sm mb-4">← Search</Link>

      <div className="card bg-base-100 p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary flex items-center justify-center text-primary-content text-3xl font-game flex-shrink-0">
            {profile.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-2xl">{profile.name}</h1>
            <div className="text-base-content/50">@{profile.username}</div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-base-content/80 mb-4">{profile.bio}</p>
        )}

        {/* Follower counts */}
        <div className="flex gap-6 mb-4">
          <div className="text-center">
            <div className="font-game text-xl text-primary">{profile.followers_count ?? 0}</div>
            <div className="text-xs text-base-content/50">FOLLOWERS</div>
          </div>
          <div className="text-center">
            <div className="font-game text-xl text-primary">{profile.following_count ?? 0}</div>
            <div className="text-xs text-base-content/50">FOLLOWING</div>
          </div>
        </div>

        {/* Stats (privacy-gated) */}
        <div className="flex gap-4 flex-wrap mb-5">
          {profile.completed_assignments_count !== undefined && (
            <div className="badge badge-success badge-lg">
              ✓ {profile.completed_assignments_count} quests done
            </div>
          )}
          {profile.study_streak !== undefined && (
            <div className="badge badge-warning badge-lg">
              🔥 {profile.study_streak} day streak
            </div>
          )}
          {profile.study_sessions_count !== undefined && (
            <div className="badge badge-info badge-lg">
              ⏱ {profile.study_sessions_count} sessions
            </div>
          )}
        </div>

        {/* Follow / Unfollow */}
        {profile.is_following ? (
          <button
            className="btn btn-ghost w-full"
            disabled={unfollow.isPending}
            onClick={() => unfollow.mutate()}
          >
            Unfollow
          </button>
        ) : (
          <button
            className="btn btn-primary w-full"
            disabled={follow.isPending}
            onClick={() => follow.mutate()}
          >
            + Follow
          </button>
        )}
      </div>
    </div>
  );
}
