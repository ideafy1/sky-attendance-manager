import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Employee, AttendanceRecord } from '@/types';
import { 
  loginUser, 
  signOut, 
  getAllEmployees, 
  markAttendance, 
  submitRegularization,
  checkTodayAttendance 
} from '@/services/firebase';
import { setupInitialData } from '@/services/initialData';
import RegularizeForm from '@/components/RegularizeForm';
import EmployeeDetailsDialog from '@/components/EmployeeDetailsDialog';
import AdminDashboard from '@/components/AdminDashboard';
import AttendanceBoxes from '@/components/AttendanceBoxes';
import PunchButtons from '@/components/PunchButtons';
import EmployeeInfo from '@/components/EmployeeInfo';
import AttendanceCalendar from '@/components/AttendanceCalendar';

const Index = () => {
  const [user, setUser] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showRegularizeForm, setShowRegularizeForm] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAlreadyPunchedIn, setIsAlreadyPunchedIn] = useState(false);
  const { toast } = useToast();
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [regularizeCount, setRegularizeCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await setupInitialData();
        await fetchEmployees();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const checkAttendance = async () => {
      if (user) {
        const hasPunchedIn = await checkTodayAttendance(user.employeeId);
        setIsAlreadyPunchedIn(hasPunchedIn);
      }
    };

    checkAttendance();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const employeesList = await getAllEmployees();
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const employeeId = formData.get('employeeId') as string;
      const password = formData.get('password') as string;

      console.log('Attempting login with:', { employeeId });
      const userData = await loginUser(employeeId, password);
      setUser(userData);
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async (photoUrl: string, location: { latitude: number; longitude: number; address: string }) => {
    if (user && !isAlreadyPunchedIn) {
      try {
        await markAttendance(user.employeeId, photoUrl, location);
        setIsAlreadyPunchedIn(true);
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        });
      } catch (error: any) {
        console.error('Error marking attendance:', error);
        toast({
          title: "Error",
          description: "Failed to mark attendance",
          variant: "destructive"
        });
      }
    }
  };

  const handleRegularizeSubmit = async (data: { date: string; loginTime: string; logoutTime: string; reason: string }) => {
    if (user) {
      try {
        await submitRegularization(user.employeeId, data);
        toast({
          title: "Success",
          description: "Regularization request submitted successfully",
        });
        setShowRegularizeForm(false);
      } catch (error: any) {
        console.error('Error submitting regularization:', error);
        toast({
          title: "Error",
          description: "Failed to submit regularization request",
          variant: "destructive"
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };

  const handleRegularizeClick = () => {
    setSelectedDate(new Date());
    setShowRegularizeForm(true);
  };

  const handleAbsentClick = () => {
    setSelectedDate(new Date());
    setShowRegularizeForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img 
              src="https://snap-emp-tracker.lovable.app/lovable-uploads/406b5f0c-4670-4e06-8166-fdfc696f6146.png" 
              alt="Sky Investments Logo"
              className="h-12 mr-4"
            />
            <h1 className="text-2xl font-bold">Sky Investments</h1>
          </div>
          {user && (
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          )}
        </div>

        {!user ? (
          <Card className="w-full max-w-md p-6 mx-auto">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                name="employeeId"
                placeholder="Employee ID"
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <PunchButtons 
                onPunchIn={handlePunchIn}
                onPunchOut={handleLogout}
                isPunchedIn={isAlreadyPunchedIn}
                isLoading={loading}
                isAlreadyPunchedIn={isAlreadyPunchedIn}
              />

              <AttendanceBoxes 
                presentCount={presentCount}
                absentCount={absentCount}
                regularizeCount={regularizeCount}
                lateCount={lateCount}
                onAbsentClick={handleAbsentClick}
                onRegularizeClick={handleRegularizeClick}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <AttendanceCalendar
                    selectedDate={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setShowRegularizeForm(true);
                      }
                    }}
                    attendanceData={user.attendance || {}}
                  />
                </Card>

                <EmployeeInfo 
                  employee={user} 
                  todayAttendance={todayAttendance} 
                />
              </div>

              {user.isAdmin && (
                <AdminDashboard 
                  employees={employees}
                  onViewDetails={(emp) => {
                    setSelectedEmployee(emp);
                    setShowEmployeeDetails(true);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {selectedDate && (
          <RegularizeForm
            date={selectedDate}
            isOpen={showRegularizeForm}
            onClose={() => {
              setShowRegularizeForm(false);
              setSelectedDate(null);
            }}
            onSubmit={handleRegularizeSubmit}
            defaultLoginTime="09:30"
            defaultLogoutTime="18:30"
          />
        )}

        <EmployeeDetailsDialog
          employee={selectedEmployee}
          isOpen={showEmployeeDetails}
          onClose={() => {
            setShowEmployeeDetails(false);
            setSelectedEmployee(null);
          }}
        />
      </div>
    </div>
  );
};

export default Index;
