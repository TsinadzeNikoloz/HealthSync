import { API_URL, PAGE_SIZE } from "../utils/constants";
import { getAuthHeaders } from "../utils/helpers";
import type {
  MedicalRecord,
  CreateMedicalRecordFormData,
  FilterParam,
  SortParam,
} from "../types";

// ---------------------------------------------------------------------------
// GET ALL MEDICAL RECORDS (with filter, sort, pagination)
// ---------------------------------------------------------------------------
export async function getMedicalRecords({
  filter,
  sortBy,
  page,
  search,
}: {
  filter?: FilterParam | null;
  sortBy?: SortParam | null;
  page?: number;
  search?: string;
}): Promise<{ data: MedicalRecord[]; count: number }> {
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

  const res = await fetch(`${API_URL}/medical-records?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getAll() → data.docs + results count
  return { data: data.data.docs as MedicalRecord[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET SINGLE MEDICAL RECORD
// ---------------------------------------------------------------------------
export async function getMedicalRecord(id: string): Promise<MedicalRecord> {
  const res = await fetch(`${API_URL}/medical-records/${id}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // factory.getOne() → data.doc
  return data.data.doc as MedicalRecord;
}

// ---------------------------------------------------------------------------
// GET PATIENT RECORDS
// ---------------------------------------------------------------------------
export async function getPatientRecords(
  patientId: string
): Promise<MedicalRecord[]> {
  const res = await fetch(`${API_URL}/medical-records/patient/${patientId}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // Custom controller → data.medicalRecords (different key!)
  return data.data.medicalRecords as MedicalRecord[];
}

// ---------------------------------------------------------------------------
// GET RECORD BY APPOINTMENT
// ---------------------------------------------------------------------------
export async function getRecordByAppointment(
  appointmentId: string
): Promise<MedicalRecord> {
  const res = await fetch(
    `${API_URL}/medical-records/appointment/${appointmentId}`,
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

  // Custom controller → data.medicalRecord
  return data.data.medicalRecord as MedicalRecord;
}

// ---------------------------------------------------------------------------
// CREATE MEDICAL RECORD
// ---------------------------------------------------------------------------
export async function createMedicalRecord(
  recordData: CreateMedicalRecordFormData
): Promise<MedicalRecord> {
  const res = await fetch(`${API_URL}/medical-records`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(recordData),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // Custom controller create → data.medicalRecord (different from factory!)
  return data.data.medicalRecord as MedicalRecord;
}

// ---------------------------------------------------------------------------
// UPDATE MEDICAL RECORD
// ---------------------------------------------------------------------------
export async function updateMedicalRecord({
  id,
  updates,
}: {
  id: string;
  updates: Partial<CreateMedicalRecordFormData>;
}): Promise<MedicalRecord> {
  const res = await fetch(`${API_URL}/medical-records/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // Custom controller update → data.medicalRecord
  return data.data.medicalRecord as MedicalRecord;
}

// ---------------------------------------------------------------------------
// DELETE MEDICAL RECORD
// ---------------------------------------------------------------------------
export async function deleteMedicalRecord(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/medical-records/${id}`, {
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
