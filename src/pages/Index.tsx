import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Employee } from '@/types';
import { loginUser, signOut, getAllEmployees, addNewEmployee, markAttendance, submitRegularization } from '@/services/firebase';
import CameraCapture from '@/components/CameraCapture';
import LocationTracker from '@/components/LocationTracker';
import RegularizeForm from '@/components/RegularizeForm';

const Index = () => {
  const [user, setUser] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewEmployeeDialog, setShowNewEmployeeDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRegularizeForm, setShowRegularizeForm] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

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

      const userData = await loginUser(employeeId, password);
      setUser(userData);
      
      if (userData.isFirstLogin) {
        setShowCameraCapture(true);
        setShowLocationTracker(true);
      }
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCapture = async (photoUrl: string) => {
    setShowCameraCapture(false);
    if (user) {
      try {
        await markAttendance(user.id, photoUrl, {
          latitude: 0,
          longitude: 0,
          address: 'Loading...'
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

  const handleLocationUpdate = async (location: { latitude: number; longitude: number; address: string }) => {
    setShowLocationTracker(false);
    if (user) {
      try {
        await markAttendance(user.id, user.lastLogin?.photo || '', location);
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        });
      } catch (error: any) {
        console.error('Error updating location:', error);
        toast({
          title: "Error",
          description: "Failed to update location",
          variant: "destructive"
        });
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowRegularizeForm(true);
    }
  };

  const handleRegularizeSubmit = async (data: { date: string; time: string; reason: string }) => {
    if (user) {
      try {
        await submitRegularization(user.id, data);
        toast({
          title: "Success",
          description: "Regularization request submitted successfully",
        });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showCameraCapture && (
              <Card className="col-span-2 p-6">
                <h2 className="text-xl font-semibold mb-4">Capture Photo</h2>
                <CameraCapture onCapture={handlePhotoCapture} />
              </Card>
            )}

            {showLocationTracker && (
              <Card className="col-span-2 p-6">
                <h2 className="text-xl font-semibold mb-4">Getting Location</h2>
                <LocationTracker onLocationUpdate={handleLocationUpdate} />
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Attendance Calendar</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </Card>

            {user && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.lastLogin && (
                    <>
                      <p><strong>Last Login:</strong> {user.lastLogin.date} {user.lastLogin.time}</p>
                      <p><strong>Location:</strong> {user.lastLogin.location}</p>
                      {user.lastLogin.photo && (
                        <img 
                          src={user.lastLogin.photo} 
                          alt="Login Photo" 
                          className="mt-2 max-w-xs rounded-lg"
                        />
                      )}
                    </>
                  )}
                </div>
              </Card>
            )}

            {user.isAdmin && (
              <Card className="col-span-2 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                  <Button onClick={() => setShowNewEmployeeDialog(true)}>
                    Add New Employee
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Last Login</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-t">
                          <td className="p-2">{emp.name}</td>
                          <td className="p-2">{emp.email}</td>
                          <td className="p-2">
                            {emp.lastLogin ? `${emp.lastLogin.date} ${emp.lastLogin.time}` : 'Never'}
                          </td>
                          <td className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEmployee(emp)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {selectedDate && (
          <RegularizeForm
            date={selectedDate}
            isOpen={showRegularizeForm}
            onClose={() => setShowRegularizeForm(false)}
            onSubmit={handleRegularizeSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
