import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { format } from "date-fns";
import { Employee } from "@/types";

interface EmployeeDetailsDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeDetailsDialog = ({ employee, isOpen, onClose }: EmployeeDetailsDialogProps) => {
  if (!employee) return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = employee.attendance?.[today];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Basic Information</h3>
              <p><strong>Name:</strong> {employee.name}</p>
              <p><strong>Employee ID:</strong> {employee.employeeId}</p>
              <p><strong>Email:</strong> {employee.email}</p>
            </div>
            <div>
              <h3 className="font-semibold">Today's Attendance</h3>
              {todayAttendance ? (
                <>
                  <p><strong>Date:</strong> {format(new Date(todayAttendance.timestamp), 'dd MMM yyyy')}</p>
                  <p><strong>Time:</strong> {format(new Date(todayAttendance.timestamp), 'HH:mm:ss')}</p>
                  <p><strong>Status:</strong> {todayAttendance.status}</p>
                  <p><strong>IP Address:</strong> {todayAttendance.ipAddress}</p>
                  <p><strong>Location:</strong> {`${todayAttendance.location.latitude}, ${todayAttendance.location.longitude}`}</p>
                </>
              ) : (
                <p>No attendance recorded for today</p>
              )}
            </div>
          </div>
          {todayAttendance?.photo && (
            <div>
              <h3 className="font-semibold mb-2">Today's Photo</h3>
              <img 
                src={todayAttendance.photo} 
                alt="Attendance Photo" 
                className="max-w-sm rounded-lg"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsDialog;