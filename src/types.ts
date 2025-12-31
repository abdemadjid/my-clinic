export type VisitStatus = 'WAITING' | 'IN_ROOM' | 'FINISHED';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: Date;
  gender?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  visits?: Visit[]; // Optional array of visits
}



// Also update Visit interface to be clearer:
export interface Visit {
  id: string;
  queueNumber: number;
  patientId: string;
  patientName: string;
  patientPhone: string;
  status: VisitStatus;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient; // Optional patient relation
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}

// For creating a new visit

export interface CreateVisitDto {
  patientId: string; // Changed from patientName/patientPhone to patientId
  reason?: string;
  // Remove patientName, patientPhone, createNewPatient
  createNewPatient?: boolean; // Whether to create new patient or use existing

}

// For creating a new patient
export interface CreatePatientDto {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string; // ISO string format
  gender?: string;
  address?: string;
}

// For updating a visit
export interface UpdateVisitDto {
  status?: VisitStatus;
  reason?: string;
}

// For updating a patient
export interface UpdatePatientDto {
  name?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

// For patient list with statistics
export interface PatientWithStats extends Patient {
  visitCount?: number;
  lastVisitDate?: Date;
}

// For API responses
export interface VisitsResponse {
  visits: Visit[];
  total: number;
  stats: {
    waiting: number;
    inRoom: number;
    finished: number;
  };
}

export interface PatientsResponse {
  patients: PatientWithStats[];
  total: number;
  stats: {
    total: number;
    newToday: number;
    withVisits: number;
  };
}

// For search/filter functionality
export interface PatientFilter {
  name?: string;
  phone?: string;
  dateFrom?: string;
  dateTo?: string;
  hasVisits?: boolean;
}

export interface VisitFilter {
  patientId?: string;
  status?: VisitStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}