import { API_URL, PAGE_SIZE } from "../utils/constants";
import { getAuthHeaders } from "../utils/helpers";
import type {
  Appointment,
  CreateAppointmentFormData,
  FilterParam,
  SortParam,
} from "../types";

// ---------------------------------------------------------------------------
// GET AVAILABLE SLOTS for a doctor on a given date
// ---------------------------------------------------------------------------
export async function getAvailableSlots({
  doctorId,
  date,
  serviceId,
}: {
  doctorId: string;
  date: string;
  serviceId?: string;
}): Promise<string[]> {
  const params = new URLSearchParams({ date });
  if (serviceId) params.set("serviceId", serviceId);

  const res = await fetch(
    `${API_URL}/users/availability/${doctorId}?${params.toString()}`,
    { method: "GET", credentials: "include" },
  );

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  return data.data.slots as string[];
}

// ---------------------------------------------------------------------------
// GET ALL APPOINTMENTS (with filter, sort, pagination) - for ADMIN/DOCTOR
// ---------------------------------------------------------------------------
export async function getAppointments({
  filter,
  sortBy,
  page,
  search,
}: {
  filter?: FilterParam | null;
  sortBy?: SortParam | null;
  page?: number;
  search?: string;
}): Promise<{ data: Appointment[]; count: number }> {
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

  const res = await fetch(`${API_URL}/appointments?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getAll() → data.docs + results count
  return { data: data.data.docs as Appointment[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET MY APPOINTMENTS (for patients)
// ---------------------------------------------------------------------------
export async function getMyAppointments({
  filter,
  sortBy,
  page,
}: {
  filter?: FilterParam | null;
  sortBy?: SortParam | null;
  page?: number;
} = {}): Promise<{
  data: Appointment[];
  count: number;
}> {
  const params = new URLSearchParams();

  if (filter) params.set(filter.field, filter.value);

  if (sortBy) {
    const prefix = sortBy.direction === "desc" ? "-" : "";
    params.set("sort", `${prefix}${sortBy.field}`);
  }

  if (page) {
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
  }

  const res = await fetch(
    `${API_URL}/appointments/my-appointments?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    }
  );

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  return { data: data.data.docs as Appointment[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET SINGLE APPOINTMENT
// ---------------------------------------------------------------------------
export async function getAppointment(id: string): Promise<Appointment> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getOne() → data.doc
  return data.data.doc as Appointment;
}

// ---------------------------------------------------------------------------
// CREATE APPOINTMENT
// ---------------------------------------------------------------------------
export async function createAppointment(
  appointmentData: CreateAppointmentFormData
): Promise<Appointment> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.createOne() → data.data
  return data.data.data as Appointment;
}

// ---------------------------------------------------------------------------
// UPDATE APPOINTMENT
// ---------------------------------------------------------------------------
export async function updateAppointment({
  id,
  updates,
}: {
  id: string;
  updates: Partial<CreateAppointmentFormData>;
}): Promise<Appointment> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
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
  return data.data.data as Appointment;
}

// ---------------------------------------------------------------------------
// DELETE APPOINTMENT
// ---------------------------------------------------------------------------
export async function deleteAppointment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
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

// ---------------------------------------------------------------------------
// GET CHECKOUT SESSION (Stripe)
// ---------------------------------------------------------------------------
export async function getCheckoutSession({
  serviceId,
  doctor,
  date,
}: {
  serviceId: string;
  doctor: string;
  date: string;
}): Promise<{ url: string }> {
  const params = new URLSearchParams({ doctor, date });

  const res = await fetch(
    `${API_URL}/appointments/checkout-session/${serviceId}?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    }
  );

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // Stripe session contains the checkout URL
  return { url: data.session.url };
}

// ---------------------------------------------------------------------------
// CREATE APPOINTMENT FROM CHECKOUT (after Stripe redirect)
// ---------------------------------------------------------------------------
export async function createAppointmentFromCheckout({
  service,
  doctor,
  date,
  price,
}: {
  service: string;
  doctor: string;
  date: string;
  price: string;
}): Promise<Appointment> {
  const res = await fetch(`${API_URL}/appointments/create-from-checkout`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify({ service, doctor, date, price }),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  return data.data.appointment as Appointment;
}
