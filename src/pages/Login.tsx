import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Mail, Sparkles } from "lucide-react";
import { isValidEmail, loginWithEmailPassword, registerEmailAccount, setAuthUser } from "@/lib/auth";
import { getUserProfile, saveUserProfile } from "@/lib/profile";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: { theme?: string; size?: string; width?: number; text?: string; shape?: string }) => void;
        };
      };
    };
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Payload = token.split(".")[1] || "";
  const payload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(payload) as Record<string, unknown>;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || "", []);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!googleClientId || !window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: ({ credential }) => {
        try {
          const payload = decodeJwtPayload(credential);
          const verifiedEmail = String(payload.email || "");
          if (!isValidEmail(verifiedEmail)) { setError("Google account email is invalid."); return; }

          setAuthUser({
            id: String(payload.sub || crypto.randomUUID()),
            name: String(payload.name || verifiedEmail.split("@")[0]),
            email: verifiedEmail,
            avatar: String(payload.picture || ""),
            provider: "google",
          });
          navigate(nextPath);
        } catch {
          setError("Google sign-in failed. Please try again.");
        }
      },
    });

    googleBtnRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline", size: "large", width: 360,
      text: mode === "signup" ? "signup_with" : "signin_with", shape: "pill",
    });
  }, [googleClientId, mode, nextPath, navigate]);

  useEffect(() => {
    const scriptId = "google-identity-script";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleEmailAuth = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    if (mode === "signup") {
      if (!name.trim()) { setError("Name is required."); return; }
      if (!dob) { setError("Date of birth is required."); return; }
      if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) { setError("Enter a valid phone number."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }

      const result = registerEmailAccount({ name: name.trim(), email, phone: phone.trim(), dob, password });
      if (!result.ok) { setError((result as { ok: false; message: string }).message); return; }

      setAuthUser({ id: result.account.id, name: result.account.name, email: result.account.email, provider: "email" });
      saveUserProfile({ name: result.account.name, email: result.account.email, phone: result.account.phone, dob: result.account.dob, password: result.account.password, gender: "", theme: "dark" });
      navigate(nextPath);
      return;
    }

    const loginResult = loginWithEmailPassword(email, password);
    if (!loginResult.ok) { setError((loginResult as { ok: false; message: string }).message); return; }

    setAuthUser({ id: loginResult.account.id, name: loginResult.account.name, email: loginResult.account.email, provider: "email" });
    saveUserProfile({ name: loginResult.account.name, email: loginResult.account.email, phone: loginResult.account.phone, dob: loginResult.account.dob, password: loginResult.account.password, gender: "", theme: getUserProfile().theme });
    navigate(nextPath);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=1920&q=80')" }} />
      <div className="absolute inset-0 bg-slate-900/65" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-2xl p-7">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-lg">Welcome to ShopAI</p>
            <p className="text-xs text-slate-500">Login to ask AI shopping questions</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === "login" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setMode("login")}>Login</button>
          <button className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === "signup" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setMode("signup")}>Sign Up</button>
        </div>

        {googleClientId && <div ref={googleBtnRef} className="flex justify-center mb-4" />}

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === "signup" && (
            <>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Name</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Your full name" required />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Date of Birth</span>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Phone Number</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+919876543210" required />
                </label>
              </div>
            </>
          )}

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Email</span>
            <div className="mt-1 relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" required />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Password</span>
            <div className="mt-1 relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Minimum 8 characters" required />
            </div>
          </label>

          {mode === "signup" && (
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Confirm Password</span>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Re-enter password" required />
            </label>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-sm font-bold">
            {mode === "signup" ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
