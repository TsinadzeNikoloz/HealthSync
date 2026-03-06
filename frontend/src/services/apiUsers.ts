import { API_URL, PAGE_SIZE } from "../utils/constants";
import { getAuthHeaders } from "../utils/helpers";
import type { User, FilterParam, SortParam } from "../types";

// ---------------------------------------------------------------------------
// GET ALL USERS (with filter, sort, pagination)
// ---------------------------------------------------------------------------
export async function getUsers({
  filter,
  sortBy,
  page,
  search,
}: {
  filter?: FilterParam | null;
  sortBy?: SortParam | null;
  page?: number;
  search?: string;
}): Promise<{ data: User[]; count: number }> {
  const params = new URLSearchParams();

  // Search
  if (search) params.set("search", search);

  // Filtering
  if (filter) {
    params.set(filter.field, filter.value);
  }

  // Sorting
  if (sortBy) {
    const prefix = sortBy.direction === "desc" ? "-" : "";
    params.set("sort", `${prefix}${sortBy.field}`);
  }

  // Pagination
  if (page) {
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
  }

  const res = await fetch(`${API_URL}/users?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getAll() → data.docs + results count
  return { data: data.data.docs as User[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET ALL DOCTORS (public)
// ---------------------------------------------------------------------------
export async function getDoctors({
  filter,
  sortBy,
  page,
  search,
}: {
  filter?: FilterParam | null;
  sortBy?: SortParam | null;
  page?: number;
  search?: string;
}): Promise<{ data: User[]; count: number }> {
  const params = new URLSearchParams();

  if (search) params.set("search", search);

  if (filter) {
    params.set(filter.field, filter.value);
  }

  if (sortBy) {
    const prefix = sortBy.direction === "desc" ? "-" : "";
    params.set("sort", `${prefix}${sortBy.field}`);
  }

  if (page) {
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
  }

  const res = await fetch(`${API_URL}/users/doctors?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  return { data: data.data.docs as User[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET SINGLE USER
// ---------------------------------------------------------------------------
export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getOne() → data.doc
  return data.data.doc as User;
}

// ---------------------------------------------------------------------------
// CREATE USER (admin only)
// ---------------------------------------------------------------------------
export async function createUser(
  userData: Record<string, unknown>
): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.createOne() → data.data
  return data.data.data as User;
}

// ---------------------------------------------------------------------------
// UPDATE USER (admin only)
// ---------------------------------------------------------------------------
export async function updateUser({
  id,
  updates,
}: {
  id: string;
  updates: Partial<User>;
}): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.updateOne() → data.data
  return data.data.data as User;
}

// ---------------------------------------------------------------------------
// DELETE USER (admin only)
// ---------------------------------------------------------------------------
export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  // factory.deleteOne() returns 204 No Content
  if (res.status !== 204) {
    const data = await res.json();
    throw new Error(data.message);
  }
}
