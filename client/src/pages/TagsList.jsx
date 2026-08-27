import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export default function TagsList() {
  const qc = useQueryClient();
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then(r => r.data),
  });

  const [newTag, setNewTag] = useState({ name: '', color: '#6366f1' });
  const [editTag, setEditTag] = useState(null);
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/tags', data),
    onSuccess: () => { qc.invalidateQueries(['tags']); setNewTag({ name: '', color: '#6366f1' }); },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create tag.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/tags/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['tags']); setEditTag(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tags/${id}`),
    onSuccess: () => qc.invalidateQueries(['tags']),
  });

  if (isLoading) return <div className="flex justify-center mt-20"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tags</h1>

      {/* Create tag */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Create Tag</h2>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <div className="flex gap-2 flex-wrap">
            <input className="input input-bordered flex-1" placeholder="Tag name"
              value={newTag.name} onChange={e => setNewTag({ ...newTag, name: e.target.value })} />
            <input type="color" className="input input-bordered w-16 p-1"
              value={newTag.color} onChange={e => setNewTag({ ...newTag, color: e.target.value })} />
            <button className="btn btn-primary" onClick={() => createMutation.mutate(newTag)}>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Tags list */}
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div key={tag.id} className="badge badge-lg gap-2 p-4" style={{ backgroundColor: tag.color ?? '#6366f1', color: '#fff' }}>
            {editTag?.id === tag.id ? (
              <>
                <input className="input input-xs w-24 text-black"
                  value={editTag.name}
                  onChange={e => setEditTag({ ...editTag, name: e.target.value })} />
                <button className="btn btn-xs btn-success" onClick={() => updateMutation.mutate(editTag)}>✓</button>
                <button className="btn btn-xs" onClick={() => setEditTag(null)}>✕</button>
              </>
            ) : (
              <>
                <span>{tag.name}</span>
                {tag.is_global && <span className="text-xs opacity-70">(global)</span>}
                {!tag.is_global && (
                  <>
                    <button className="btn btn-xs btn-ghost" onClick={() => setEditTag(tag)}>✏️</button>
                    <button className="btn btn-xs btn-ghost" onClick={() => deleteMutation.mutate(tag.id)}>🗑️</button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
        {tags.length === 0 && <p className="text-base-content/60">No tags yet.</p>}
      </div>
    </div>
  );
}
