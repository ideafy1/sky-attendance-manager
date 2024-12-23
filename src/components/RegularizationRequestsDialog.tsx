import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { RegularizationRequest } from "@/types";
import { handleRegularizationRequest, fetchRegularizationRequests } from "@/services/firebase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RegularizationRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestHandled: () => void;
}

const RegularizationRequestsDialog = ({
  isOpen,
  onClose,
  onRequestHandled
}: RegularizationRequestsDialogProps) => {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const fetchedRequests = await fetchRegularizationRequests();
        setRequests(fetchedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: "Error",
          description: "Failed to load regularization requests",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await handleRegularizationRequest(requestId, action);
      toast({
        title: "Success",
        description: `Request ${action}d successfully`
      });
      setRequests(requests.filter(req => req.id !== requestId));
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Regularization Requests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <p className="text-center">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-muted-foreground">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex justify-end gap-4 mt-4">
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