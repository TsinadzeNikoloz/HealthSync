import { API_URL } from "../utils/constants";
import { getAuthHeaders } from "../utils/helpers";
import type {
  User,
  LoginFormData,
  SignupFormData,
  UpdatePasswordFormData,
  AvailabilitySlot,
} from "../types";

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
export async function login({
  email,
  password,
}: LoginFormData): Promise<
  { status: "success"; user: User; token: string } | { status: "pending" }
> {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (data.status === "pending") {
    return { status: "pending" };
  }

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  localStorage.setItem("jwt", data.token);

  return { status: "success", user: data.data.user, token: data.token };
}

// ---------------------------------------------------------------------------
// VERIFY OTP (Two-Factor Authentication)
// ---------------------------------------------------------------------------
export async function verifyOTP({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_URL}/users/verifyOTP`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  localStorage.setItem("jwt", data.token);

  return { user: data.data.user, token: data.token };
}

// ---------------------------------------------------------------------------
// SIGNUP
// ---------------------------------------------------------------------------
export async function signup(
  formData: SignupFormData
): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_URL}/users/signup`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  localStorage.setItem("jwt", data.token);

  return { user: data.data.user, token: data.token };
}

// ---------------------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------------------
export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/users/logout`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  localStorage.removeItem("jwt");
}

// ---------------------------------------------------------------------------
// GET CURRENT USER
// ---------------------------------------------------------------------------
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("jwt");
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/users/getMe`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (data.status !== "success") return null;

    // factory.getOne() wraps in data.doc
    return data.data.doc as User;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// UPDATE ME (profile – supports file upload via FormData)
// ---------------------------------------------------------------------------
export async function updateMe(formData: FormData): Promise<User> {
  const token = localStorage.getItem("jwt");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  // Do NOT set Content-Type – the browser sets it with the boundary for FormData

  const res = await fetch(`${API_URL}/users/updateMe`, {
    method: "PATCH",
    credentials: "include",
    headers,
    body: formData,
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // user.updateMe wraps in data.user
  return data.data.user as User;
}

// ---------------------------------------------------------------------------
// UPDATE PASSWORD
// ---------------------------------------------------------------------------
export async function updatePassword(
  passwords: UpdatePasswordFormData
): Promise<void> {
  const res = await fetch(`${API_URL}/users/updateMyPassword`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(passwords),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // Response has token at root level
  localStorage.setItem("jwt", data.token);
}

// ---------------------------------------------------------------------------
// UPDATE AVAILABILITY (doctors only — sends JSON, not FormData)
// ---------------------------------------------------------------------------
export async function updateAvailability(
  availability: AvailabilitySlot[],
): Promise<User> {
  const res = await fetch(`${API_URL}/users/updateMe`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify({ availability }),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  return data.data.user as User;
}

// ---------------------------------------------------------------------------
// FORGOT PASSWORD
// ---------------------------------------------------------------------------
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/forgotPassword`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }
}

// ---------------------------------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------------------------------
export async function resetPassword(
  token: string,
  password: string,
  passwordConfirm: string
) {
  const res = await fetch(`${API_URL}/users/resetPassword/${token}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, passwordConfirm }),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  localStorage.setItem("jwt", data.token);

  return data;
}
