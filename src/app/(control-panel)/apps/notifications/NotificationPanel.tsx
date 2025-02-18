import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { closeSnackbar, enqueueSnackbar, useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Button from '@mui/material/Button';
import _ from 'lodash';
import usePathname from '@fuse/hooks/usePathname';
import NotificationCard from './NotificationCard';
import {
	closeNotificationPanel,
	selectNotificationPanelState,
	toggleNotificationPanel
} from './notificationPanelSlice';
import {
	useCreateNotificationMutation,
	useDeleteNotificationMutation,
	useDeleteNotificationsMutation,
	useGetAllNotificationsQuery,
	Notification
} from './NotificationApi';
import NotificationModel from './models/NotificationModel';
import NotificationTemplate from './NotificationTemplate';

const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
	'& .MuiDrawer-paper': {
		backgroundColor: theme.palette.background.default,
		width: 320
	}
}));

/**
 * The notification panel.
 */
function NotificationPanel() {
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const state = useAppSelector(selectNotificationPanelState);

	// const [deleteNotification] = useDeleteNotificationMutation();

	// const [deleteNotifications] = useDeleteNotificationsMutation();
	// const [addNotification] = useCreateNotificationMutation();

	const [notifications, setNotifications] = useState<Notification[]>([]);
		const [isLoading, setIsLoading] = useState(true);
		const [error, setError] = useState<string | null>(null);
	  
		const fetchTasks = async () => {
		  setIsLoading(true);
		  const { data } = await useGetAllNotificationsQuery();
		 
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

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		if (state) {
			dispatch(closeNotificationPanel());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname, dispatch]);

	useEffect(() => {
		const item = NotificationModel({
			title: 'New Fuse React version is released! ',
			description: ' Checkout the release notes for more information. 🚀 ',
			link: '/documentation/changelog',
			icon: 'heroicons-solid:fire',
			variant: 'secondary'
		});

		setTimeout(async () => {
				try {
					const res = await useCreateNotificationMutation(item); // Handle async call and unwrap the result
					console.log(res);
				} catch (err) {
				  console.error("Error creating label:", err);
				  // Optionally, set error state to display an error message
				}
			enqueueSnackbar(item.title, {
				key: item.id,
				autoHideDuration: 6000,
				content: (
					<NotificationTemplate
						item={item}
						onClose={() => {
							closeSnackbar(item.id);
						}}
					/>
				)
			});
		}, 2000);
	}, [closeSnackbar, enqueueSnackbar]);

	function handleClose() {
		dispatch(closeNotificationPanel());
	}

	// function handleDismiss(id: string) {
	// 	deleteNotification(id);
	// }

	// function handleDismissAll() {
	// 	deleteNotifications(notifications.map((notification) => notification.id));
	// }

	async function handleDismissAll() {
			try {
			  await useDeleteNotificationsMutation(notifications.map((noti: Notification) => noti.id));  // Ensure async operation
			} catch (err) {
			  console.error("Error deleting label:", err);
			  // Optionally, set error state here
			}
		  }
		  async function handleDismiss(id: string) {
				try {
				  await useDeleteNotificationMutation(id);  // Ensure async operation
				} catch (err) {
				  console.error("Error deleting label:", err);
				  // Optionally, set error state here
				}
			  }
	async function demoNotification() {
		const item = NotificationModel({ title: 'Great Job! this is awesome.' });

		try {
			await useCreateNotificationMutation(item); // Handle async call and unwrap the result
		   } catch (err) {
			 console.error("Error creating label:", err);
			 // Optionally, set error state to display an error message
		   }

		enqueueSnackbar(item.title, {
			key: item.id,

			// autoHideDuration: 3000,
			content: (
				<NotificationTemplate
					item={item}
					onClose={() => {
						closeSnackbar(item.id);
					}}
				/>
			)
		});
	}

	return (
		<StyledSwipeableDrawer
			open={state}
			anchor="right"
			onOpen={() => {}}
			onClose={() => dispatch(toggleNotificationPanel())}
			disableSwipeToOpen
		>
			<IconButton
				className="absolute right-0 top-0 z-999 m-4"
				onClick={handleClose}
				size="large"
			>
				<FuseSvgIcon color="action">heroicons-outline:x-mark</FuseSvgIcon>
			</IconButton>

			<FuseScrollbars className="flex flex-col p-16 h-full">
				{notifications && notifications?.length > 0 ? (
					<div className="flex flex-auto flex-col">
						<div className="mb-36 flex items-end justify-between pt-136">
							<Typography className="text-4xl font-semibold leading-none">Notifications</Typography>
							<Typography
								className="cursor-pointer text-md underline"
								color="secondary"
								onClick={handleDismissAll}
							>
								dismiss all
							</Typography>
						</div>
						{_.orderBy(notifications, ['time'], ['desc']).map((item) => (
							<NotificationCard
								key={item.id}
								className="mb-16"
								item={item}
								onClose={handleDismiss}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-1 items-center justify-center p-16">
						<Typography
							className="text-center text-xl"
							color="text.secondary"
						>
							There are no notifications for now.
						</Typography>
					</div>
				)}
				<div className="flex items-center justify-center py-16">
					<Button
						size="small"
						variant="outlined"
						onClick={demoNotification}
					>
						Create a notification example
					</Button>
				</div>
			</FuseScrollbars>
		</StyledSwipeableDrawer>
	);
}

export default NotificationPanel;
