import { Employee } from "@/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import AddEmployeeButton from "./AddEmployeeButton";
import RegularizationRequestsButton from "./RegularizationRequestsButton";

interface AdminDashboardProps {
  employees: Employee[];
  onViewDetails: (employee: Employee) => void;
}

const AdminDashboard = ({ employees, onViewDetails }: AdminDashboardProps) => {
  return (
    <Card className="col-span-2 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Employee ID</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t">
                <td className="p-2">{emp.name}</td>
                <td className="p-2">{emp.email}</td>
                <td className="p-2">{emp.employeeId}</td>
                <td className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(emp)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-6">
        <AddEmployeeButton />
        <RegularizationRequestsButton />
      </div>
    </Card>
  );
};

export default AdminDashboard;