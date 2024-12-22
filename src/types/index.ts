export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  password?: string;
  isAdmin: boolean;
  createdAt: string;
  attendance?: Record<string, AttendanceRecord>;
  uid?: string;
  isFirstLogin?: boolean;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  time: string;
  logoutTime?: string;
  ipAddress: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photo: string;
  status: 'P' | 'PL' | 'A' | 'R';
  timestamp: string;
}

export interface RegularizationRequest {
  id: string;
  employeeId: string;
  date: string;
  loginTime: string;
  logoutTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  employeeName?: string;
}