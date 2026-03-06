import { API_URL, SERVICES_PAGE_SIZE } from "../utils/constants";
import { getAuthHeaders } from "../utils/helpers";
import type {
  Service,
  CreateServiceFormData,
  FilterParam,
  SortParam,
} from "../types";

// ---------------------------------------------------------------------------
// GET ALL SERVICES (with filter, sort, pagination)
// ---------------------------------------------------------------------------
export async function getServices({
  filter,
  sortBy,
  page,
  search,
}: {
  filter?: FilterParam | null;
  sortBy?: SortParam | null;
  page?: number;
  search?: string;
}): Promise<{ data: Service[]; count: number }> {
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
    params.set("limit", String(SERVICES_PAGE_SIZE));
  }

  const res = await fetch(`${API_URL}/services?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getAll() → data.docs + results count
  return { data: data.data.docs as Service[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET SINGLE SERVICE
// ---------------------------------------------------------------------------
export async function getService(id: string): Promise<Service> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getOne() → data.doc
  return data.data.doc as Service;
}

// ---------------------------------------------------------------------------
// GET TOP 5 SERVICES (top-rated, cheapest)
// ---------------------------------------------------------------------------
export async function getTopServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/services/top-5-cheap`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  return data.data.docs as Service[];
}

// ---------------------------------------------------------------------------
// GET SERVICE STATS
// ---------------------------------------------------------------------------
export async function getServiceStats(): Promise<unknown[]> {
  const res = await fetch(`${API_URL}/services/service-stats`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // service stats → data.stats
  return data.data.stats;
}

// ---------------------------------------------------------------------------
// CREATE SERVICE
// ---------------------------------------------------------------------------
export async function createService(
  serviceData: CreateServiceFormData
): Promise<Service> {
  const res = await fetch(`${API_URL}/services`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(serviceData),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.createOne() → data.data
  return data.data.data as Service;
}

// ---------------------------------------------------------------------------
// UPDATE SERVICE
// ---------------------------------------------------------------------------
export async function updateService({
  id,
  updates,
}: {
  id: string;
  updates: Partial<CreateServiceFormData>;
}): Promise<Service> {
  const res = await fetch(`${API_URL}/services/${id}`, {
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
  return data.data.data as Service;
}

// ---------------------------------------------------------------------------
// DELETE SERVICE
// ---------------------------------------------------------------------------
export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, {
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
