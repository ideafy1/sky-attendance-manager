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
  const bgColor = {
    present: 'bg-green-600',
    absent: 'bg-red-600',
    regularize: 'bg-blue-500',
    late: 'bg-yellow-500'
  }[type];

  return (
    <Card 
      className={cn(
        "p-4 text-center transition-colors text-white",
        bgColor,
        isClickable && "cursor-pointer hover:opacity-90",
        "w-full md:w-1/4 rounded-lg"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{count}</p>
    </Card>
  );
};

const AttendanceBoxes = ({
  presentCount,
  absentCount,
  regularizeCount,
  lateCount,
  onAbsentClick,
  onRegularizeClick
}: {
  presentCount: number;
  absentCount: number;
  regularizeCount: number;
  lateCount: number;
  onAbsentClick: () => void;
  onRegularizeClick: () => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <AttendanceBox
        title="Present (P)"
        count={presentCount}
        type="present"
      />
      <AttendanceBox
        title="Absent (A)"
        count={absentCount}
        type="absent"
        onClick={onAbsentClick}
      />
      <AttendanceBox
        title="Regularize (R)"
        count={regularizeCount}
        type="regularize"
        onClick={onRegularizeClick}
      />
      <AttendanceBox
        title="Late (L)"
        count={lateCount}
        type="late"
      />
    </div>
  );
};

export default AttendanceBoxes;