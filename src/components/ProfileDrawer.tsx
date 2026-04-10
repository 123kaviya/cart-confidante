import { FormEvent, useEffect, useState } from "react";
import { X, MoonStar, UserRound, CalendarDays, ShieldCheck } from "lucide-react";
import { getUserProfile, logoutUser, saveUserProfile, type UserProfile } from "@/lib/profile";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoggedOut: () => void;
}

export function ProfileDrawer({ isOpen, onClose, onLoggedOut }: ProfileDrawerProps) {
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setProfile(getUserProfile());
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }, [isOpen]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!profile.name.trim()) { setError("Name is required."); return; }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
      if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    }

    if (profile.phone && !/^\+?[0-9]{10,15}$/.test(profile.phone.trim())) {
      setError("Enter a valid phone number (10 to 15 digits)."); return;
    }

    const finalProfile: UserProfile = {
      ...profile,
      name: profile.name.trim(),
      password: newPassword ? newPassword : profile.password,
    };

    saveUserProfile(finalProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <>
      {isOpen && (
        <button className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[1px]" onClick={onClose} aria-label="Close profile drawer overlay" />
      )}

      <aside className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 shadow-2xl border-l border-slate-700 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="px-5 py-4 border-b border-slate-700 bg-gradient-to-r from-cyan-600 via-blue-600 to-fuchsia-600 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserRound className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Profile Settings</p>
              <p className="text-xs text-cyan-100">Update your account details and preferences</p>
            </div>
            <button onClick={onClose} className="ml-auto p-2 rounded-lg hover:bg-white/20 transition" aria-label="Close profile drawer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-y-auto">
            <label className="block">
              <span className="text-xs text-cyan-100 font-semibold">Name</span>
              <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/80 text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Your full name" />
            </label>

            <label className="block">
              <span className="text-xs text-cyan-100 font-semibold">Email</span>
              <input value={profile.email} readOnly className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-cyan-100" />
            </label>

            <label className="block">
              <span className="text-xs text-cyan-100 font-semibold">Phone Number</span>
              <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/80 text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="e.g. +919876543210" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-cyan-100 font-semibold">Gender</span>
                <select value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value as UserProfile["gender"] }))} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-cyan-100 font-semibold">Date of Birth</span>
                <div className="mt-1 relative">
                  <CalendarDays className="w-4 h-4 text-cyan-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input type="date" value={profile.dob} onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))} className="w-full rounded-xl border border-slate-600 bg-slate-900 text-slate-100 pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-700 p-3 bg-slate-900/60">
              <p className="text-xs text-cyan-100 font-bold mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" /> Change Password
              </p>
              <div className="space-y-2">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-slate-600 bg-slate-900 text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-slate-600 bg-slate-900 text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                <p className="text-[11px] text-slate-300">Minimum 8 characters.</p>
              </div>
            </div>

            <label className="rounded-2xl border border-cyan-500/40 bg-slate-900/70 px-3 py-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-sm text-cyan-100 font-semibold flex items-center gap-1.5">
                <MoonStar className="w-4 h-4" /> Dark Theme
              </span>
              <input type="checkbox" checked={profile.theme === "dark"} onChange={(e) => setProfile((p) => ({ ...p, theme: e.target.checked ? "dark" : "light" }))} className="h-4 w-4 accent-cyan-500" />
            </label>

            {error && <p className="text-xs text-red-600 border border-red-200 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2.5 font-bold text-sm">
              {saved ? "Saved" : "Save Profile"}
            </button>

            <button type="button" onClick={() => { logoutUser(); onLoggedOut(); }} className="w-full rounded-xl border border-rose-400/50 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 py-2.5 font-bold text-sm transition">
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
