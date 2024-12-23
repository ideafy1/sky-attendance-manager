import { useState } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import CameraCapture from './CameraCapture';
import LocationTracker from './LocationTracker';
import { useToast } from "@/hooks/use-toast";

interface PunchInFlowProps {
  onPunchInComplete: (photoUrl: string, location: { latitude: number; longitude: number; address: string }) => Promise<void>;
}

const PunchInFlow = ({ onPunchInComplete }: PunchInFlowProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const { toast } = useToast();

  const handlePhotoCapture = async (capturedPhotoUrl: string) => {
    console.log('Photo captured:', capturedPhotoUrl);
    setPhotoUrl(capturedPhotoUrl);
    setShowCamera(false);
  };

  const handleLocationUpdate = async (location: { latitude: number; longitude: number; address: string }) => {
    console.log('Location captured:', location);
    if (photoUrl) {
      try {
        await onPunchInComplete(photoUrl, location);
        toast({
          title: "Success",
          description: "Your attendance has been marked for the day.",
        });
      } catch (error) {
        console.error('Error completing punch in:', error);
        toast({
          title: "Error",
          description: "Failed to mark attendance",
          variant: "destructive"
        });
      }
    }
  };

  if (!showCamera) {
    return (
      <Card className="p-4 text-center">
        <Button onClick={() => setShowCamera(true)}>Start Camera</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CameraCapture onCapture={handlePhotoCapture} />
      {photoUrl && <LocationTracker onLocationUpdate={handleLocationUpdate} />}
    </div>
  );
};

export default PunchInFlow;