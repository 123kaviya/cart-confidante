export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "email";
}

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
}

const AUTH_STORAGE_KEY = "shopai_auth_user";
const ACCOUNTS_STORAGE_KEY = "shopai_email_accounts";

export function getAuthUser(): AuthUser | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

function getEmailAccounts(): EmailAccount[] {
  const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as EmailAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEmailAccounts(accounts: EmailAccount[]): void {
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function registerEmailAccount(input: Omit<EmailAccount, "id">): { ok: true; account: EmailAccount } | { ok: false; message: string } {
  const normalizedEmail = input.email.trim().toLowerCase();
  const accounts = getEmailAccounts();

  if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const account: EmailAccount = {
    ...input,
    id: crypto.randomUUID(),
    email: normalizedEmail,
  };

  saveEmailAccounts([account, ...accounts]);
  return { ok: true, account };
}

export function loginWithEmailPassword(email: string, password: string): { ok: true; account: EmailAccount } | { ok: false; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getEmailAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

  if (!account || account.password !== password) {
    return { ok: false, message: "Invalid email or password." };
  }

  return { ok: true, account };
}
