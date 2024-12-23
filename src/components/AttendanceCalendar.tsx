import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AttendanceCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date | undefined) => void;
  attendanceData: Record<string, {
    status: 'P' | 'PL' | 'A' | 'R';
    time: string;
    logoutTime?: string;
  }>;
}

const AttendanceCalendar = ({ selectedDate, onSelect, attendanceData }: AttendanceCalendarProps) => {
  const today = new Date();

  const getDayColor = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = attendanceData[dateStr];
    
    if (!attendance) {
      // If it's today and no attendance yet, show as red
      if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return 'bg-red-500';
      }
      // For past dates with no attendance
      if (date < today) {
        return 'bg-red-500';
      }
      return '';
    }

    // If attendance exists
    if (attendance.status === 'P' && !attendance.logoutTime) {
      return 'bg-yellow-500'; // No punch out
    }
    if (attendance.status === 'PL') {
      return 'bg-yellow-500'; // Late attendance
    }
    if (attendance.status === 'P') {
      return 'bg-green-500'; // On time and complete attendance
    }
    if (attendance.status === 'A') {
      return 'bg-red-500'; // Absent
    }
    return '';
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onSelect}
      className="rounded-md border"
      modifiers={{
        marked: (date) => Boolean(getDayColor(date)),
      }}
      modifiersStyles={{
        marked: {
          backgroundColor: getDayColor(new Date()),
          borderRadius: '50%',
          color: 'white',
        }
      }}
    />
  );
};

export default AttendanceCalendar;