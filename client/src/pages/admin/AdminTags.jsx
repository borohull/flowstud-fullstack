import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function AdminTags() {
  const qc = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: () => api.get('/admin/tags').then(r => r.data),
  });

  const deleteTag = useMutation({
    mutationFn: (id) => api.delete(`/admin/tags/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tags'] }),
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="btn btn-ghost btn-sm">← Admin</Link>
        <h1 className="text-2xl font-bold">Manage Tags</h1>
        <span className="badge badge-neutral">{tags.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Owner</th>
              <th>Global</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(tag => (
              <tr key={tag.id}>
                <td>
                  <span
                    className="badge badge-outline"
                    style={{ borderColor: tag.color || '#888', color: tag.color || '#888' }}
                  >
                    {tag.name}
                  </span>
                </td>
                <td className="text-base-content/60">
                  {tag.user ? `@${tag.user.username}` : '—'}
                </td>
                <td>
                  {tag.is_global && <span className="badge badge-success badge-sm">global</span>}
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-error"
                    disabled={deleteTag.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete tag "${tag.name}"?`)) {
                        deleteTag.mutate(tag.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
