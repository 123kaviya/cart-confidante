import { clearAuthUser, getAuthUser, setAuthUser } from "@/lib/auth";

export type ThemePreference = "light" | "dark";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  gender: "" | "male" | "female" | "other" | "prefer_not_to_say";
  dob: string;
  password: string;
  theme: ThemePreference;
}

const PROFILE_STORAGE_KEY = "shopai_user_profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  password: "",
  theme: "dark",
};

export function applyTheme(theme: ThemePreference): void {
  document.documentElement.classList.toggle("dark-theme", theme === "dark");
}

export function getUserProfile(): UserProfile {
  const authUser = getAuthUser();
  const fallback: UserProfile = {
    ...DEFAULT_PROFILE,
    name: authUser?.name || "",
    email: authUser?.email || "",
  };

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...fallback,
      ...parsed,
      name: parsed.name || fallback.name,
      email: parsed.email || fallback.email,
      theme: parsed.theme === "light" ? "light" : "dark",
    };
  } catch {
    return fallback;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  applyTheme(profile.theme);

  const authUser = getAuthUser();
  if (authUser) {
    setAuthUser({
      ...authUser,
      name: profile.name || authUser.name,
    });
  }
}

export function logoutUser(): void {
  clearAuthUser();
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  applyTheme("dark");
}
