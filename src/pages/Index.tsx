import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const firebaseConfig = {
  apiKey: "AIzaSyAXvihOdAIOsBOonbv5pxyeFrNJE2aUCsA",
  authDomain: "skyinve-96c28.firebaseapp.com",
  databaseURL: "https://skyinve-96c28-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skyinve-96c28",
  storageBucket: "skyinve-96c28.firebasestorage.app",
  messagingSenderId: "812146837776",
  appId: "1:812146837776:web:1ded0395564e8ae9177d95",
  measurementId: "G-7ZX26GXV2Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface EmployeeData {
  id: string;
  name: string;
  email: string;
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

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [showNewEmployeeDialog, setShowNewEmployeeDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    id: '',
    email: '',
    password: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchEmployeeData(user.email!);
        if (employeeData?.isAdmin) {
          await fetchAllEmployees();
        }
      }
    });

    return () => unsubscribe();
  }, [user?.email]);

  const fetchEmployeeData = async (email: string) => {
    try {
      const q = query(collection(db, 'users'), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data() as EmployeeData;
        setEmployeeData(data);
        console.log("Employee data fetched:", data);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const employeesList = querySnapshot.docs.map(doc => doc.data() as EmployeeData);
      setEmployees(employeesList);
      console.log("All employees fetched:", employeesList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("employeeId", "==", employeeId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          title: "Error",
          description: "Employee ID not found",
          variant: "destructive"
        });
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
      
      // Update last login info
      const location = await fetch('https://ipapi.co/json/').then(res => res.json());
      const loginInfo = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        location: `${location.city}, ${location.country}`,
        ipAddress: location.ip
      };

      await setDoc(doc(db, 'users', querySnapshot.docs[0].id), {
        ...userData,
        lastLogin: loginInfo
      }, { merge: true });

      console.log("Logged in successfully:", userCredential.user);
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

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        setEmployeeData(null);
        setEmployees([]);
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
      } catch (error: any) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user document in Firestore
      await addDoc(collection(db, 'users'), {
        ...newEmployee,
        isAdmin: false,
        attendance: {},
        lastLogin: null
      });

      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      setShowNewEmployeeDialog(false);
      setNewEmployee({ name: '', id: '', email: '', password: '' });
      await fetchAllEmployees();

    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md p-6">
          <div className="mb-6 text-center">
            <img 
              src="https://snap-emp-tracker.lovable.app/lovable-uploads/406b5f0c-4670-4e06-8166-fdfc696f6146.png" 
              alt="Sky Investments Logo"
              className="mx-auto h-16 mb-4"
            />
            <h1 className="text-2xl font-bold">Sky Investments</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

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
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance Calendar</h2>
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
            {employeeData && (
              <div className="space-y-2">
                <p><strong>Name:</strong> {employeeData.name}</p>
                <p><strong>Employee ID:</strong> {employeeData.id}</p>
                {employeeData.lastLogin && (
                  <>
                    <p><strong>Last Login:</strong> {employeeData.lastLogin.date} {employeeData.lastLogin.time}</p>
                    <p><strong>Location:</strong> {employeeData.lastLogin.location}</p>
                    <p><strong>IP Address:</strong> {employeeData.lastLogin.ipAddress}</p>
                    {employeeData.lastLogin.photo && (
                      <img 
                        src={employeeData.lastLogin.photo} 
                        alt="Login Photo" 
                        className="mt-2 max-w-xs rounded-lg"
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        {employeeData?.isAdmin && (
          <Card className="mt-6 p-6">
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
                    <th className="text-left p-2">Employee ID</th>
                    <th className="text-left p-2">Last Login</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-t">
                      <td className="p-2">{emp.name}</td>
                      <td className="p-2">{emp.id}</td>
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

        <Dialog open={showNewEmployeeDialog} onOpenChange={setShowNewEmployeeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <Input
                placeholder="Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                required
              />
              <Input
                placeholder="Employee ID"
                value={newEmployee.id}
                onChange={(e) => setNewEmployee({...newEmployee, id: e.target.value})}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Employee"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <p><strong>Name:</strong> {selectedEmployee.name}</p>
                    <p><strong>Employee ID:</strong> {selectedEmployee.id}</p>
                    <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Last Login Details</h3>
                    {selectedEmployee.lastLogin ? (
                      <>
                        <p><strong>Date:</strong> {selectedEmployee.lastLogin.date}</p>
                        <p><strong>Time:</strong> {selectedEmployee.lastLogin.time}</p>
                        <p><strong>Location:</strong> {selectedEmployee.lastLogin.location}</p>
                        <p><strong>IP Address:</strong> {selectedEmployee.lastLogin.ipAddress}</p>
                      </>
                    ) : (
                      <p>No login records available</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Attendance Calendar</h3>
                  <Calendar
                    mode="single"
                    selected={new Date()}
                    className="rounded-md border"
                  />
                </div>
                {selectedEmployee.lastLogin?.photo && (
                  <div>
                    <h3 className="font-semibold mb-2">Latest Login Photo</h3>
                    <img 
                      src={selectedEmployee.lastLogin.photo}
                      alt="Login Photo"
                      className="max-w-xs rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;