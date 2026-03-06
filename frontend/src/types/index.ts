// === ENUMS ===
export type UserRole = "USER" | "DOCTOR" | "ADMIN";

export type ServiceCategory =
  | "CONSULTATION"
  | "TREATMENT"
  | "DIAGNOSTIC"
  | "THERAPY"
  | "SURGERY";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

// === AVAILABILITY ===
export interface AvailabilitySlot {
  dayOfWeek: number; // 0=Sunday … 6=Saturday
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

// === NOTIFICATION ===
export interface Notification {
  _id: string;
  id: string;
  user: string;
  message: string;
  type: "appointment" | "record" | "system";
  link?: string;
  read: boolean;
  createdAt: string;
}

// === USER ===
export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  photo: string;
  role: UserRole;
  specialty?: string;
  bio?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  availability?: AvailabilitySlot[];
  createdAt: string;
}

// === SERVICE ===
export interface Service {
  _id: string;
  id: string;
  name: string;
  duration: number;
  maxPatients: number;
  category: ServiceCategory;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  doctors: Pick<User, "_id" | "name" | "email">[];
  reviews?: Review[];
}

// === REVIEW ===
export interface Review {
  _id: string;
  id: string;
  review: string;
  rating: number;
  user: Pick<User, "_id" | "name" | "photo">;
  service: string | Service;
  createdAt: string;
}

// === APPOINTMENT ===
export interface Appointment {
  _id: string;
  id: string;
  service: Pick<Service, "_id" | "name" | "category" | "price">;
  patient: Pick<User, "_id" | "name" | "email">;
  doctor: Pick<User, "_id" | "name" | "email">;
  date: string;
  time?: string;
  status: AppointmentStatus;
  price: number;
  paid: boolean;
  createdAt: string;
}

// === MEDICAL RECORD ===
export interface MedicalRecord {
  _id: string;
  id: string;
  patient: Pick<User, "_id" | "name" | "email">;
  doctor: Pick<User, "_id" | "name" | "email">;
  appointment: {
    _id: string;
    service: Pick<Service, "_id" | "name" | "category">;
    date: string;
    status: AppointmentStatus;
  };
  diagnosis: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  createdAt: string;
}

// === FORM TYPES ===
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: string;
}

export interface UpdatePasswordFormData {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

export interface CreateAppointmentFormData {
  service: string;
  patient: string;
  doctor: string;
  date: string;
  price: number;
  status?: AppointmentStatus;
}

export interface CreateServiceFormData {
  name: string;
  duration: number;
  maxPatients: number;
  category: ServiceCategory;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  isActive?: boolean;
  doctors?: string[];
}

export interface CreateMedicalRecordFormData {
  patient: string;
  appointment: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
}

export interface CreateReviewFormData {
  review: string;
  rating: number;
  service: string;
}

// === COMPAT EXPORTS (mock→real migration) ===
export const AppointmentStatus = {
  PENDING: 'PENDING' as const,
  CONFIRMED: 'CONFIRMED' as const,
  CANCELLED: 'CANCELLED' as const,
  COMPLETED: 'COMPLETED' as const,
} as const;

export const Role = {
  PATIENT: 'USER' as const,
  DOCTOR: 'DOCTOR' as const,
  ADMIN: 'ADMIN' as const,
} as const;
export type Role = UserRole;

export type ClinicService = Service;

// === QUERY PARAMS ===
export interface FilterParam {
  field: string;
  value: string;
}

export interface SortParam {
  field: string;
  direction: "asc" | "desc";
}
