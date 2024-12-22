export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  password?: string;
  isAdmin: boolean;
  createdAt: string;
  attendance?: Record<string, AttendanceRecord>;
}

export interface AttendanceRecord {
  employeeId: string;
  formattedTime: string;
  ipAddress: string;
  location: {
    accuracy: number;
    latitude: number;
    longitude: number;
  };
  photo: string;
  status: 'P' | 'PL' | 'A';
  timestamp: string;
}

export interface RegularizationRequest {
  id: string;
  employeeId: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}