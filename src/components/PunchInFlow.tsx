import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import CameraCapture from './CameraCapture';
import LocationTracker from './LocationTracker';
import { useToast } from "@/hooks/use-toast";

interface PunchInFlowProps {
  onPunchInComplete: (photoUrl: string, location: { latitude: number; longitude: number; address: string }) => Promise<void>;
  isAlreadyPunchedIn: boolean;
}

const PunchInFlow = ({ onPunchInComplete, isAlreadyPunchedIn }: PunchInFlowProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAlreadyPunchedIn) {
      toast({
        title: "Already Punched In",
        description: "You have already marked your attendance for today.",
        variant: "destructive"
      });
      setShowCamera(false);
    }
  }, [isAlreadyPunchedIn]);

  const handlePhotoCapture = async (capturedPhotoUrl: string) => {
    console.log('Photo captured:', capturedPhotoUrl);
    setPhotoUrl(capturedPhotoUrl);
    setShowCamera(false);
  };

  const handleLocationUpdate = async (location: { latitude: number; longitude: number; address: string }) => {
    console.log('Location captured:', location);
    if (photoUrl && !isAlreadyPunchedIn) {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isAlreadyPunchedIn) {
    return null;
  }

  if (!showCamera && !photoUrl) {
    return (
      <Card className="p-4 text-center">
        <Button onClick={() => setShowCamera(true)} disabled={isLoading || isAlreadyPunchedIn}>
          Start Camera
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showCamera && <CameraCapture onCapture={handlePhotoCapture} />}
      {photoUrl && !isLoading && <LocationTracker onLocationUpdate={handleLocationUpdate} />}
    </div>
  );
};

export default PunchInFlow;