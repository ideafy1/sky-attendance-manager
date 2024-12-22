export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  password?: string;
  isAdmin: boolean;
  attendance?: Record<string, AttendanceRecord>;
  lastLogin?: {
    date: string;
    time: string;
    location?: string;
    ipAddress?: string;
    photo?: string;
  };
  isFirstLogin?: boolean;
}

export interface AttendanceRecord {
  date: string;
  time: string;
  status: 'P' | 'A' | 'L' | 'PL';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photo?: string;
  ipAddress?: string;
}

export interface RegularizationRequest {
  id: string;
  userId: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}