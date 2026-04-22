import apiClient from './apiClient';
import { buildQueryParams } from './buildQueryParams';
import type {
	MedicalRecord,
	CreateMedicalRecordFormData,
	FilterParam,
	SortParam,
} from '../types';

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
	const params = buildQueryParams({ filter, sortBy, page, search });

	const { data } = await apiClient.get('/medical-records', { params });
	return { data: data.data.docs as MedicalRecord[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET SINGLE MEDICAL RECORD
// ---------------------------------------------------------------------------
export async function getMedicalRecord(id: string): Promise<MedicalRecord> {
	const { data } = await apiClient.get(`/medical-records/${id}`);
	return data.data.doc as MedicalRecord;
}

// ---------------------------------------------------------------------------
// GET PATIENT RECORDS
// ---------------------------------------------------------------------------
export async function getPatientRecords(
	patientId: string,
): Promise<MedicalRecord[]> {
	const { data } = await apiClient.get(`/medical-records/patient/${patientId}`);
	return data.data.docs as MedicalRecord[];
}

// ---------------------------------------------------------------------------
// GET RECORD BY APPOINTMENT
// ---------------------------------------------------------------------------
export async function getRecordByAppointment(
	appointmentId: string,
): Promise<MedicalRecord> {
	const { data } = await apiClient.get(
		`/medical-records/appointment/${appointmentId}`,
	);
	return data.data.doc as MedicalRecord;
}

// ---------------------------------------------------------------------------
// CREATE MEDICAL RECORD
// ---------------------------------------------------------------------------
export async function createMedicalRecord(
	recordData: CreateMedicalRecordFormData,
): Promise<MedicalRecord> {
	const { data } = await apiClient.post('/medical-records', recordData);
	return data.data.doc as MedicalRecord;
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
	const { data } = await apiClient.patch(`/medical-records/${id}`, updates);
	return data.data.doc as MedicalRecord;
}

// ---------------------------------------------------------------------------
// DELETE MEDICAL RECORD
// ---------------------------------------------------------------------------
export async function deleteMedicalRecord(id: string): Promise<void> {
	await apiClient.delete(`/medical-records/${id}`);
}
