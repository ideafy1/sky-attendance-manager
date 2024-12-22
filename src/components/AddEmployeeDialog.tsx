import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { addNewEmployee } from "@/services/firebase";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployeeDialog = ({ isOpen, onClose, onSuccess }: AddEmployeeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const employeeData = {
        name: formData.get('name') as string,
        employeeId: formData.get('employeeCode') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        isAdmin: false
      };

      await addNewEmployee(employeeData);
      toast({
        title: "Success",
        description: "Employee added successfully"
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="name"
              placeholder="Name"
              required
            />
          </div>
          <div>
            <Input
              name="employeeCode"
              placeholder="Employee Code"
              required
            />
          </div>
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;