import { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import PunchInFlow from "./PunchInFlow";

interface PunchButtonsProps {
  onPunchIn: (photoUrl: string, location: { latitude: number; longitude: number; address: string }) => Promise<void>;
  onPunchOut: () => void;
  isPunchedIn: boolean;
  isLoading: boolean;
  isAlreadyPunchedIn: boolean;
}

const PunchButtons = ({ onPunchIn, onPunchOut, isPunchedIn, isLoading, isAlreadyPunchedIn }: PunchButtonsProps) => {
  const [showPunchInFlow, setShowPunchInFlow] = useState(false);
  const { toast } = useToast();

  const handlePunchOut = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours < 18 || (hours === 18 && minutes < 30)) {
      toast({
        title: "Cannot Punch Out",
        description: "You can only punch out after 6:30 PM",
        variant: "destructive"
      });
      return;
    }

    onPunchOut();
  };

  if (showPunchInFlow && !isPunchedIn) {
    return <PunchInFlow onPunchInComplete={onPunchIn} isAlreadyPunchedIn={isAlreadyPunchedIn} />;
  }

  return (
    <div className="flex gap-4 justify-center mb-6">
      <Button 
        onClick={() => setShowPunchInFlow(true)} 
        disabled={isPunchedIn || isLoading || isAlreadyPunchedIn}
        className="w-32"
      >
        Punch In
      </Button>
      <Button 
        onClick={handlePunchOut} 
        disabled={!isPunchedIn || isLoading}
        variant="outline"
        className="w-32"
      >
        Punch Out
      </Button>
    </div>
  );
};

export default PunchButtons;