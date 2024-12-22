import { Card } from "./ui/card";
import { Employee, AttendanceRecord } from "@/types";
import { format } from "date-fns";

interface EmployeeInfoProps {
  employee: Employee;
  todayAttendance?: AttendanceRecord;
}

const EmployeeInfo = ({ employee, todayAttendance }: EmployeeInfoProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const notPunchedInText = "Did not punch in yet";

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Employee Code:</strong> {employee.employeeId}</p>
          <p><strong>Email ID:</strong> {employee.email}</p>
          <p><strong>Today's Date:</strong> {format(new Date(), 'dd MMM yyyy')}</p>
        </div>
        <div>
          <p><strong>Today's Login Time:</strong> {todayAttendance?.time || notPunchedInText}</p>
          <p><strong>Today's Logout Time:</strong> {todayAttendance?.logoutTime || notPunchedInText}</p>
          <p><strong>Today's IP Address:</strong> {todayAttendance?.ipAddress || notPunchedInText}</p>
          <p><strong>Today's Location:</strong> {todayAttendance?.location.address || notPunchedInText}</p>
        </div>
      </div>
      {todayAttendance?.photo && (
        <div>
          <p><strong>Today's Photo:</strong></p>
          <img 
            src={todayAttendance.photo} 
            alt="Attendance Photo" 
            className="max-w-xs rounded-lg mt-2"
          />
        </div>
      )}
    </Card>
  );
};

export default EmployeeInfo;