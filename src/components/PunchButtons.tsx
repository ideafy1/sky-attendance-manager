import { Button } from "./ui/button";

interface PunchButtonsProps {
  onPunchIn: (photoUrl: string) => void | Promise<void>;
  onPunchOut: () => void;
  isPunchedIn: boolean;
  isLoading: boolean;
}

const PunchButtons = ({ onPunchIn, onPunchOut, isPunchedIn, isLoading }: PunchButtonsProps) => {
  return (
    <div className="flex gap-4 justify-center mb-6">
      <Button 
        onClick={() => onPunchIn('')} 
        disabled={isPunchedIn || isLoading}
        className="w-32"
      >
        Punch In
      </Button>
      <Button 
        onClick={onPunchOut} 
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