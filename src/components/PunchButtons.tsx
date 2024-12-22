import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PunchButtonsProps {
  onPunchIn: () => void;
  onPunchOut: () => void;
  isPunchedIn: boolean;
  isLoading: boolean;
}

const PunchButtons = ({ onPunchIn, onPunchOut, isPunchedIn, isLoading }: PunchButtonsProps) => {
  const { toast } = useToast();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const timeString = `${currentHour}:${currentMinutes}`;

  const handlePunchOut = () => {
    if (currentHour < 18 || (currentHour === 18 && currentMinutes < 30)) {
      toast({
        title: "Cannot Punch Out",
        description: "You can only punch out after 6:30 PM",
        variant: "destructive"
      });
      return;
    }

    onPunchOut();
  };

  return (
    <div className="flex gap-4 justify-center mb-6">
      <Button
        onClick={onPunchIn}
        disabled={isPunchedIn || isLoading}
      >
        {isLoading ? "Processing..." : "PUNCH IN"}
      </Button>
      <Button
        onClick={handlePunchOut}
        disabled={!isPunchedIn || isLoading}
        variant="secondary"
      >
        PUNCH OUT
      </Button>
    </div>
  );
};

export default PunchButtons;