import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SearchUsers() {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { user: me } = useAuth();

  // Debounce input → search
  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => api.get('/users', { params: search ? { search } : {} }).then(r => r.data),
  });

  const follow = useMutation({
    mutationFn: (id) => api.post(`/users/${id}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const unfollow = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <h1 className="text-3xl mb-6">Find Players</h1>

      <div className="mb-6 max-w-md">
        <input
          className="input input-bordered w-full"
          placeholder="Search by name or username..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      {isLoading && <div className="text-center py-12">Searching...</div>}

      {!isLoading && users.length === 0 && search && (
        <div className="text-center py-12 text-base-content/50">
          No players found for "{search}"
        </div>
      )}

      {!isLoading && users.length === 0 && !search && (
        <div className="text-center py-12 text-base-content/50">
          Start typing to search for players
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className="card bg-base-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-none bg-primary flex items-center justify-center text-primary-content text-xl font-game flex-shrink-0">
                {u.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/users/${u.username}`} className="font-game text-base hover:text-primary block truncate">
                  {u.name}
                </Link>
                <div className="text-base-content/50 text-sm">@{u.username}</div>
                {u.bio && (
                  <div className="text-sm mt-1 truncate text-base-content/70">{u.bio}</div>
                )}
              </div>
            </div>

            {u.id !== me?.id && (
              <div className="mt-3 flex justify-end">
                {u.is_following ? (
                  <button
                    className="btn btn-sm btn-ghost"
                    disabled={unfollow.isPending}
                    onClick={() => unfollow.mutate(u.id)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={follow.isPending}
                    onClick={() => follow.mutate(u.id)}
                  >
                    + Follow
                  </button>
                )}
              </div>
            )}
            {u.id === me?.id && (
              <div className="mt-3 flex justify-end">
                <span className="text-xs text-base-content/40 italic">you</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
