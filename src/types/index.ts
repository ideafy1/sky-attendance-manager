export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  password?: string;
  isAdmin: boolean;
  attendance?: Record<string, string>;
  lastLogin?: {
    date: string;
    time: string;
    location?: string;
    ipAddress?: string;
    photo?: string;
  };
}

export interface AttendanceRecord {
  date: string;
  status: 'P' | 'A' | 'L' | 'PL';
  time?: string;
  location?: string;
  photo?: string;
}