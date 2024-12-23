import { useState } from 'react';
import { Button } from './ui/button';
import RegularizationRequestsDialog from './RegularizationRequestsDialog';
import { useToast } from "@/hooks/use-toast";

const RegularizationRequestsButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleRequestHandled = () => {
    toast({
      title: "Success",
      description: "Request handled successfully"
    });
  };

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        className="mt-4"
      >
        Regularization Requests
      </Button>
      <RegularizationRequestsDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onRequestHandled={handleRequestHandled}
      />
    </>
  );
};

export default RegularizationRequestsButton;