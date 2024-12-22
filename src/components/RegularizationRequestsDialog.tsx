import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { RegularizationRequest } from "@/types";
import { handleRegularizationRequest } from "@/services/firebase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RegularizationRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requests: RegularizationRequest[];
  onRequestHandled: () => void;
}

const RegularizationRequestsDialog = ({
  isOpen,
  onClose,
  requests,
  onRequestHandled
}: RegularizationRequestsDialogProps) => {
  const { toast } = useToast();

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await handleRegularizationRequest(requestId, action);
      toast({
        title: "Success",
        description: `Request ${action}d successfully`
      });
      onRequestHandled();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Regularization Requests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Employee:</strong> {request.employeeName}</p>
                      <p><strong>Employee ID:</strong> {request.employeeId}</p>
                      <p><strong>Date:</strong> {format(new Date(request.date), 'dd MMM yyyy')}</p>
                    </div>
                    <div>
                      <p><strong>Login Time:</strong> {request.loginTime}</p>
                      <p><strong>Logout Time:</strong> {request.logoutTime}</p>
                      <p><strong>Reason:</strong> {request.reason}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleRequest(request.id, 'reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleRequest(request.id, 'approve')}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegularizationRequestsDialog;