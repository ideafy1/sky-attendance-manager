import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { format } from 'date-fns';

interface RegularizeFormProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    loginTime: string;
    logoutTime: string;
    reason: string;
  }) => void;
}

const RegularizeForm = ({ date, isOpen, onClose, onSubmit }: RegularizeFormProps) => {
  const [loginTime, setLoginTime] = useState('09:30');
  const [logoutTime, setLogoutTime] = useState('18:30');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: format(date, 'yyyy-MM-dd'),
      loginTime,
      logoutTime,
      reason,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regularize Attendance - {format(date, 'dd MMM yyyy')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Login Time</label>
            <Input
              type="time"
              value={loginTime}
              onChange={(e) => setLoginTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logout Time</label>
            <Input
              type="time"
              value={logoutTime}
              onChange={(e) => setLogoutTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegularizeForm;