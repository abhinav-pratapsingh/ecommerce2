import { useEffect, useState } from 'react'
import { ShieldCheck, User, Trash2 } from 'lucide-react'
import orderService from '../../services/orderService'
import { TableSkeleton } from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const AdminUsers = () => {
  const { user: me } = useAuth()
  const [users,   setUsers]   = useState([])
  const [meta,    setMeta]    = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [acting,  setActing]  = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await orderService.adminGetUsers({ page, limit: 15 })
      setUsers(res.data.data.users)
      setMeta(res.data.meta)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page]) // eslint-disable-line

  const toggleRole = async (userId, currentRole) => {
    setActing(userId)
    const newRole = currentRole === 'admin' ? 'customer' : 'admin'
    try {
      await orderService.adminUpdateUser(userId, { role: newRole })
      toast.success(`Role changed to ${newRole}`)
      load()
    } finally { setActing(null) }
  }

  const handleDelete = async (userId, name) => {
    if (!confirm(`Deactivate "${name}"?`)) return
    setActing(userId)
    try {
      await orderService.adminDeleteUser(userId)
      toast.success('User deactivated')
      load()
    } finally { setActing(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-black text-2xl">Users</h1>
        <p className="text-ink-muted text-sm mt-0.5">{meta.total} registered users</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={10} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['User', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-mono uppercase tracking-wider text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map(u => (
                  <tr key={u._id} className={`hover:bg-surface-muted/30 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {!u.isActive && <p className="text-[10px] text-red-400">Deactivated</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                    <td className="px-4 py-3 text-ink-muted">{u.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={u.role === 'admin' ? 'badge-blue' : 'badge-gray'}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {u._id !== me?._id && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleRole(u._id, u.role)} disabled={acting === u._id}
                            title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${u.role === 'admin' ? 'text-brand-400 hover:bg-brand-500/10' : 'text-ink-muted hover:text-brand-400 hover:bg-brand-500/10'}`}>
                            {u.role === 'admin' ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                          {u.isActive && (
                            <button onClick={() => handleDelete(u._id, u.name)} disabled={acting === u._id}
                              className="p-2 rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-16 text-ink-muted">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages > 1 && (
          <div className="p-4 border-t border-surface-border">
            <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers

