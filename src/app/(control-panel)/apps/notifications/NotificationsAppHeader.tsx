import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { closeSnackbar, enqueueSnackbar, useSnackbar } from "notistack";
import PageBreadcrumb from "src/components/PageBreadcrumb";
import {
  Notification,
  useCreateNotificationMutation,
  useDeleteNotificationsMutation,
  useDismissNotificationMutation,
  useGetAllNotificationsQuery,
} from "./NotificationApi";
import NotificationModel from "./models/NotificationModel";
import NotificationTemplate from "./NotificationTemplate";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminNotificationForm from "./AdminNotificationForm";

/**
 * The Notifications app header.
 */
function NotificationsAppHeader({ refresh }: { refresh: () => void }) {
  // const [addNotification] = useCreateNotificationMutation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  // const [deleteNotifications] = useDeleteNotificationsMutation();
  // const { data: notifications } = useGetAllNotificationsQuery();
  const { data } = useSession();

  const userId = data?.db?.id || "unknown-user-id";
  const userRole = data?.db?.role?.[0] || "unknown-user";

  const isAdmin = userRole === "admin";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data } = await useGetAllNotificationsQuery(userId);

    if (error) {
      setError(error);
    } else {
      setNotifications(data);
    }

    setIsLoading(false);
  };

  /** Subscribe to real-time changes */
  useEffect(() => {
    fetchTasks();
  }, []);
//   async function handleDismissAll() {
//     try {
//       await useDeleteNotificationsMutation(
//         notifications.map((noti: Notification) => noti.id)
//       ); // Ensure async operation
//       fetchTasks();
//       refresh();
//     } catch (err) {
//       console.error("Error deleting label:", err);
//       // Optionally, set error state here
//     }
//   }
const handleDismissAll = async () => {
    try {
      for (const notification of notifications) {
        await useDismissNotificationMutation( userId, notification.id );
      }
      refresh();
    } catch (err) {
      console.error("Error dismissing notifications:", err);
    }
  };
  // deleteNotifications(notifications.map((notification) => notification.id));

  //   async function demoNotification() {
  //     const item = NotificationModel({ title: "Great Job! this is awesome." });

  //     enqueueSnackbar(item.title, {
  //       key: item.id,

  //       // autoHideDuration: 3000,
  //       content: (
  //         <NotificationTemplate
  //           item={item}
  //           onClose={() => {
  //             closeSnackbar(item.id);
  //           }}
  //         />
  //       ),
  //     });
  //     try {
  //       await useCreateNotificationMutation(item); // Handle async call and unwrap the result
  //       refresh();
  //     } catch (err) {
  //       console.error("Error creating label:", err);
  //       // Optionally, set error state to display an error message
  //     }
  //     // addNotification(item);
  //   }

  return (
    <div className="flex w-full container">
      <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-24 pb-0">
        <div className="flex flex-col flex-auto">
          <PageBreadcrumb className="mb-8" />

          <Typography className="text-4xl font-extrabold leading-none tracking-tight mb-4">
            Notifications
          </Typography>
          <Typography
            className="font-medium tracking-tight"
            color="text.secondary"
          >
            Lists all notifications
          </Typography>
        </div>
        <div className="flex items-center mt-24 sm:mt-0 sm:mx-8 space-x-8">
          {isAdmin && <AdminNotificationForm refresh={refresh} />}

          <Button
            className="whitespace-nowrap"
            variant="contained"
            color="secondary"
			onClick={handleDismissAll} // ✅ fixed onClick
            startIcon={
              <FuseSvgIcon size={20}>heroicons-solid:bell</FuseSvgIcon>
            }
          >
            Dissmiss All
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotificationsAppHeader;
