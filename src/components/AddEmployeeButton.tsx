import { useState } from 'react';
import { Button } from './ui/button';
import AddEmployeeDialog from './AddEmployeeDialog';
import { useToast } from "@/hooks/use-toast";

const AddEmployeeButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Employee added successfully"
    });
  };

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        className="mt-4"
      >
        Add New Employee
      </Button>
      <AddEmployeeDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default AddEmployeeButton;