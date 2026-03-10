import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Loader } from '../../components/common/Loader'
import { User, Lock } from 'lucide-react'

const Profile = () => {
  const { user, updateUserLocal } = useAuth()
  const [tab, setTab]       = useState('profile')
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  const handleProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/users/update', profile)
      updateUserLocal(res.data.data.user)
      toast.success('Profile updated!')
    } finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="font-display font-black text-3xl mb-8">My Profile</h1>

      {/* Avatar section */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center text-brand-400 font-black text-2xl">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-display font-bold text-xl">{user?.name}</p>
          <p className="text-ink-muted text-sm">{user?.email}</p>
          <span className="badge-blue mt-1 inline-flex capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'profile', label: 'Profile', Icon: User }, { id: 'password', label: 'Password', Icon: Lock }].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`pill-tab flex items-center gap-2 ${tab === id ? 'pill-tab-active' : 'pill-tab-inactive'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {tab === 'profile' && (
        <form onSubmit={handleProfile} className="card p-6 space-y-5 animate-fade-in">
          <div>
            <label className="text-sm text-ink-muted mb-1.5 block">Full Name</label>
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm text-ink-muted mb-1.5 block">Email</label>
            <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm text-ink-muted mb-1.5 block">Phone</label>
            <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              className="input-field" placeholder="+1 555 000 0000" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader size="sm" /> Saving...</> : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Password form */}
      {tab === 'password' && (
        <form onSubmit={handlePassword} className="card p-6 space-y-5 animate-fade-in">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword',     label: 'New Password' },
            { key: 'confirm',         label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm text-ink-muted mb-1.5 block">{label}</label>
              <input type="password" value={pwForm[key]}
                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                className="input-field" placeholder="********" required minLength={key !== 'currentPassword' ? 8 : 1} />
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader size="sm" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  )
}

export default Profile

