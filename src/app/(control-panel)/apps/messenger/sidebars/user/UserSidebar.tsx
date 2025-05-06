import { useEffect, useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Box, Toolbar, IconButton, Typography, InputAdornment } from '@mui/material';
import _ from 'lodash';
import { lighten } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import MessengerAppContext from '@/app/(control-panel)/apps/messenger/contexts/MessengerAppContext';
import Statuses from '../../components/Statuses';
import UserAvatar from '../../components/UserAvatar';
import { supabaseClient } from "@/utils/supabaseClient";
import { useSession } from 'next-auth/react';

function UserSidebar() {
	const { setUserSidebarOpen } = useContext(MessengerAppContext);
	const [user, setUser] = useState<any>(null);
	const { control, handleSubmit, reset, formState, watch } = useForm({});
	const { isValid, dirtyFields, errors } = formState;
 const { data } = useSession();

  const userId = data?.db?.id || "unknown-user-id";

	// Load user profile from Supabase
	useEffect(() => {
		async function fetchUser() {
			
			const { data, error: userError } = await supabaseClient
				.from('users')
				.select('*')
				.eq('id', userId)
				.single();

			if (userError) {
				console.error('Error fetching user profile', userError.message);
				return;
			}

			setUser(data);
			reset(data);
		}

		fetchUser();
	}, [reset]);

	async function onSubmit(formData: any) {
		if (!userId) return;

		const { error } = await supabaseClient
			.from('users')
			.update({ status: formData.status })
			.eq('id', userId);

		if (error) {
			console.error('Failed to update status:', error.message);
		} else {
			setUser((prev: any) => ({ ...prev, status: formData.status }));
			setUserSidebarOpen(false)
		}
	}

	const formValues = watch();

	if (!user || _.isEmpty(formValues)) {
		return null;
	}
const handleCloseSidebar = () => {
		setUserSidebarOpen(false);
		reset(user);
	};
	return (
		<div className="flex flex-col flex-auto h-full">
			<Box
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<Toolbar className="flex items-center px-24 border-b-1">
					<IconButton onClick={() => setUserSidebarOpen(false)}>
						<FuseSvgIcon>heroicons-outline:arrow-small-left</FuseSvgIcon>
					</IconButton>
					<Typography className="px-8 font-semibold text-2xl">Profile</Typography>
				</Toolbar>
			</Box>
			<div className="flex flex-col justify-center items-center py-32">
				<UserAvatar
					className="w-160 h-160 text-64"
					user={user}
				/>
			</div>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="px-24"
			>
				<TextField
					className="w-full"
					label="Name"
					value={user.displayName}
					disabled
					variant="outlined"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon size={20}>heroicons-solid:user-circle</FuseSvgIcon>
							</InputAdornment>
						)
					}}
				/>

				<TextField
					className="mt-16 w-full"
					label="Email"
					value={user.email}
					disabled
					variant="outlined"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon size={20}>heroicons-solid:envelope</FuseSvgIcon>
							</InputAdornment>
						)
					}}
				/>

				<FormControl component="fieldset" className="w-full mt-16">
					<FormLabel component="legend">Status</FormLabel>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<RadioGroup {...field}>
								{Statuses.map((status) => (
									<FormControlLabel
										key={status.value}
										value={status.value}
										control={<Radio />}
										label={
											<div className="flex items-center">
												<Box className="w-8 h-8 rounded-full" sx={{ backgroundColor: status.color }} />
												<span className="mx-8">{status.title}</span>
											</div>
										}
									/>
								))}
							</RadioGroup>
						)}
					/>
				</FormControl>

				<div className="flex items-center justify-end mt-32">
					<Button className="mx-8" onClick={handleCloseSidebar}>Cancel</Button>
					<Button
						className="mx-8"
						variant="contained"
						color="secondary"
						disabled={_.isEmpty(dirtyFields) || !isValid}
						type="submit"
					>
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}

export default UserSidebar;
