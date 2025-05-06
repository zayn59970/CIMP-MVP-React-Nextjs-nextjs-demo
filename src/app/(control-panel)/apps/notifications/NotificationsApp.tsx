"use client";

import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple/FusePageSimple";
import Typography from "@mui/material/Typography";
import Masonry from "react-masonry-css";
import _ from "lodash";
import {
  Notification,
  useDeleteNotificationMutation,
  useDismissNotificationMutation,
  useGetAllNotificationsQuery,
} from "./NotificationApi";
import NotificationCard from "./NotificationCard";
import NotificationsAppHeader from "./NotificationsAppHeader";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function NotificationsApp() {
  // const [deleteNotification] = useDeleteNotificationMutation();

  // const { data: notifications, isLoading } = useGetAllNotificationsQuery();
  const { data } = useSession();
  const userId = data?.db?.id || "unknown-user-id";

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
  }, [userId]);

  console.log("Notifications:", notifications);
  // async function handleDismiss(id: string) {
  // 		try {
  // 		  await useDeleteNotificationMutation(id);  // Ensure async operation
  // 		  fetchTasks();

  // 		} catch (err) {
  // 		  console.error("Error deleting label:", err);
  // 		  // Optionally, set error state here
  // 		}
  // 	  }
  const handleDismiss = async (id: string) => {
    await useDismissNotificationMutation(userId, id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <FusePageSimple
      header={<NotificationsAppHeader refresh={fetchTasks} />}
      content={
        <div className="flex flex-col w-full p-16 mt-0 sm:mt-8">
          <Masonry
            breakpointCols={{
              default: 4,
              960: 3,
              600: 2,
              480: 1,
            }}
            className="my-masonry-grid flex w-full"
            columnClassName="my-masonry-grid_column flex flex-col p-8"
          >
            {_.orderBy(notifications, ["time"], ["desc"]).map(
              (notification) => (
                <NotificationCard
                  key={notification.id}
                  className="mb-16"
                  item={notification}
                  onClose={handleDismiss}
                />
              )
            )}
          </Masonry>

          {notifications.length === 0 && (
            <div className="flex flex-1 items-center justify-center p-64">
              <Typography
                className="text-center text-xl"
                color="text.secondary"
              >
                There are no notifications for now.
              </Typography>
            </div>
          )}
        </div>
      }
    />
  );
}

export default NotificationsApp;
