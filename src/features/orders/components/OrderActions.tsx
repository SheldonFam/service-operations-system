import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUpdateOrder } from "../hooks/useOrders";
import { AssignTechDialog } from "./AssignTechDialog";
import { PostponeDialog } from "@/features/jobs/components/PostponeDialog";
import type { Order, UserRole } from "@/lib/types";
import { toast } from "sonner";
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Play,
  Wrench,
  PauseCircle,
} from "lucide-react";

interface OrderActionsProps {
  order: Order;
  userRole: UserRole;
  onUpdated: () => void;
}

export function OrderActions({
  order,
  userRole,
  onUpdated,
}: OrderActionsProps) {
  const navigate = useNavigate();
  const { updateOrder, loading } = useUpdateOrder();
  const [assignOpen, setAssignOpen] = useState(false);
  const [postponeOpen, setPostponeOpen] = useState(false);

  const handleStatusUpdate = async (newStatus: string, successMsg: string) => {
    const { error } = await updateOrder(order.id, {
      status: newStatus as Order["status"],
    });
    if (error) {
      toast.error(error);
    } else {
      toast.success(successMsg);
      onUpdated();
    }
  };

  const showAssign =
    userRole === "admin" &&
    (order.status === "new" || order.status === "postponed");
  const showClose = userRole === "admin" && order.status === "reviewed";
  const showReview = userRole === "manager" && order.status === "job_done";
  const showStart = userRole === "technician" && order.status === "assigned";
  const showComplete =
    userRole === "technician" && order.status === "in_progress";

  if (!showAssign && !showClose && !showReview && !showStart && !showComplete) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Admin: Assign/Reassign technician */}
      {showAssign && (
          <>
            <Button onClick={() => setAssignOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {order.status === "postponed" ? "Reassign" : "Assign Technician"}
            </Button>
            <AssignTechDialog
              order={order}
              open={assignOpen}
              onClose={() => setAssignOpen(false)}
              onAssigned={onUpdated}
            />
          </>
        )}

      {/* Admin: Close Order */}
      {showClose && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" />
              {loading ? "Closing..." : "Close Order"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark order {order.order_no} as closed. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleStatusUpdate("closed", "Order closed successfully")
                }
              >
                Close Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Manager: Mark as Reviewed */}
      {showReview && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {loading ? "Reviewing..." : "Mark as Reviewed"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as reviewed?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm that you have reviewed the service record for order{" "}
                {order.order_no}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleStatusUpdate("reviewed", "Order marked as reviewed")
                }
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Technician: Start Job */}
      {showStart && (
        <Button
          className="w-full sm:w-auto"
          size="lg"
          onClick={() => handleStatusUpdate("in_progress", "Job started!")}
          disabled={loading}
        >
          <Play className="mr-2 h-4 w-4" />
          {loading ? "Starting..." : "Start Job"}
        </Button>
      )}

      {/* Technician: Complete Job / Postpone */}
      {showComplete && (
        <>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              size="lg"
              onClick={() => navigate(`/orders/${order.id}/complete`)}
            >
              <Wrench className="mr-2 h-4 w-4" />
              Complete Job
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              size="lg"
              onClick={() => setPostponeOpen(true)}
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Postpone
            </Button>
          </div>
          <PostponeDialog
            order={order}
            open={postponeOpen}
            onClose={() => setPostponeOpen(false)}
            onPostponed={onUpdated}
          />
        </>
      )}
    </div>
  );
}
