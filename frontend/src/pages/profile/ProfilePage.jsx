import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/services';
import {
  User,
  Lock,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Save,
  KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    bio: user?.bio || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password fields
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      updateUser(res.data);
      toast.success('Profile details updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      await authAPI.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success('Password changed successfully');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update password';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile & Account Settings</h1>
          <p className="page-subtitle">
            Manage your personal contact details, security credentials, and preferences
          </p>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="card p-6 sm:p-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center text-2xl shadow-lg shadow-indigo-100">
          {user?.first_name?.[0] || 'U'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">
              {user?.first_name} {user?.last_name}
            </h2>
            <span className="badge-purple uppercase text-[10px] tracking-wider font-extrabold">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            Department: {user?.department || 'Operations'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Form */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-indigo-600" /> Personal Information
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  required
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email (Immutable)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Department</label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Bio</label>
              <textarea
                rows={2}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Professional background..."
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="btn-primary w-full justify-center"
            >
              {updatingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-600" /> Security & Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                placeholder="••••••••••••"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="••••••••••••"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                placeholder="••••••••••••"
                className="form-input"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                <ShieldCheck size={14} className="text-emerald-500" /> Password requirements:
              </div>
              <p>• At least 8 characters long</p>
              <p>• Include uppercase & lowercase letters and numbers</p>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="btn-primary w-full justify-center"
            >
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
