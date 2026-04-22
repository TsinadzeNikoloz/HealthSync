import apiClient from './apiClient';
import { buildQueryParams } from './buildQueryParams';
import type {
	Appointment,
	CreateAppointmentFormData,
	FilterParam,
	SortParam,
} from '../types';

// ---------------------------------------------------------------------------
// GET AVAILABLE SLOTS for a doctor on a given date
// ---------------------------------------------------------------------------
export async function getAvailableSlots({
	doctorId,
	date,
	duration,
}: {
	doctorId: string;
	date: string;
	duration?: number;
}): Promise<string[]> {
	const params: Record<string, string> = { date };
	if (duration) params.duration = String(duration);

	const { data } = await apiClient.get(`/users/availability/${doctorId}`, {
		params,
	});
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
	dateFrom,
	dateTo,
}: {
	filter?: FilterParam | null;
	sortBy?: SortParam | null;
	page?: number;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}): Promise<{ data: Appointment[]; count: number }> {
	const params = buildQueryParams({ filter, sortBy, page, search });
	if (dateFrom) params['date[gte]'] = dateFrom;
	if (dateTo) params['date[lte]'] = dateTo;

	const { data } = await apiClient.get('/appointments', { params });
	return { data: data.data.docs as Appointment[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET MY APPOINTMENTS (for patients)
// ---------------------------------------------------------------------------
export async function getMyAppointments({
	filter,
	sortBy,
	page,
	dateFrom,
	dateTo,
}: {
	filter?: FilterParam | null;
	sortBy?: SortParam | null;
	page?: number;
	dateFrom?: string;
	dateTo?: string;
} = {}): Promise<{ data: Appointment[]; count: number }> {
	const params = buildQueryParams({ filter, sortBy, page });
	if (dateFrom) params['date[gte]'] = dateFrom;
	if (dateTo) params['date[lte]'] = dateTo;

	const { data } = await apiClient.get('/appointments/my-appointments', {
		params,
	});
	return { data: data.data.docs as Appointment[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET SINGLE APPOINTMENT
// ---------------------------------------------------------------------------
export async function getAppointment(id: string): Promise<Appointment> {
	const { data } = await apiClient.get(`/appointments/${id}`);
	return data.data.doc as Appointment;
}

// ---------------------------------------------------------------------------
// CREATE APPOINTMENT
// ---------------------------------------------------------------------------
export async function createAppointment(
	appointmentData: CreateAppointmentFormData,
): Promise<Appointment> {
	const { data } = await apiClient.post('/appointments', appointmentData);
	return data.data.doc as Appointment;
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
	const { data } = await apiClient.patch(`/appointments/${id}`, updates);
	return data.data.doc as Appointment;
}

// ---------------------------------------------------------------------------
// DELETE APPOINTMENT
// ---------------------------------------------------------------------------
export async function deleteAppointment(id: string): Promise<void> {
	await apiClient.delete(`/appointments/${id}`);
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
	const { data } = await apiClient.get(
		`/appointments/checkout-session/${serviceId}`,
		{ params: { doctor, date } },
	);
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
	const { data } = await apiClient.post('/appointments/create-from-checkout', {
		service,
		doctor,
		date,
		price,
	});
	return data.data.doc as Appointment;
}

// ---------------------------------------------------------------------------
// GET APPOINTMENT STATS (admin only)
// ---------------------------------------------------------------------------
export interface AppointmentStats {
	totalRevenue: number;
	totalAppointments: number;
	completionRate: number;
	cancellationRate: number;
	revenueByMonth: { month: string; revenue: number }[];
	mostBooked: { name: string; count: number }[];
}

export async function getAppointmentStats(): Promise<AppointmentStats> {
	const { data } = await apiClient.get('/appointments/stats');
	return data.data as AppointmentStats;
}
