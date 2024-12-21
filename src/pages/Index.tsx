import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

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

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      console.log("Auth state changed:", user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First find the user email based on employee ID
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

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Now login with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
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

        {/* Main content will go here */}
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
            {/* Employee info will go here */}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;