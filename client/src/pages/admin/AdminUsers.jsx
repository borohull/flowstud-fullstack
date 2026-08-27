import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="btn btn-ghost btn-sm">← Admin</Link>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <span className="badge badge-neutral">{users.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td className="text-base-content/60">@{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-error' : 'badge-ghost'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="text-sm text-base-content/60">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td>
                  {u.id === currentUser?.id ? (
                    <span className="text-base-content/40 text-sm italic">you</span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs btn-outline"
                        disabled={updateRole.isPending}
                        onClick={() => updateRole.mutate({
                          id: u.id,
                          role: u.role === 'admin' ? 'user' : 'admin',
                        })}
                      >
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        disabled={deleteUser.isPending}
                        onClick={() => {
                          if (window.confirm(`Delete ${u.name}? This cannot be undone.`)) {
                            deleteUser.mutate(u.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
