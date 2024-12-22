import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface AttendanceBoxProps {
  title: string;
  count: number;
  type: 'present' | 'absent' | 'regularize' | 'late';
  onClick?: () => void;
}

const AttendanceBox = ({ title, count, type, onClick }: AttendanceBoxProps) => {
  const isClickable = type === 'absent' || type === 'regularize';

  return (
    <Card 
      className={cn(
        "p-4 text-center transition-colors",
        isClickable && "cursor-pointer hover:bg-accent",
        "w-full md:w-1/4"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{count}</p>
    </Card>
  );
};

export default AttendanceBox;