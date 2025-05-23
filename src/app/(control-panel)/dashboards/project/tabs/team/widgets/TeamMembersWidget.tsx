import Typography from '@mui/material/Typography';
import { memo, use, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useGetProjectDashboardWidgetsQuery } from '../../../ProjectDashboardApi';
import TeamMemberType from './types/TeamMemberType';
import { supabaseClient } from '@/utils/supabaseClient';
import { Avatar, darken } from '@mui/material';

/**
 * The TeamMembersWidget widget.
 */
function TeamMembersWidget() {
	const { data: widgets, isLoading } = useGetProjectDashboardWidgetsQuery();
const [users, setUsers] = useState([]);
useEffect(() => {
	const fetchUsers = async () => {
		const { data, error } = await supabaseClient
			.from('users')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching users:', error);
		} else {
			setUsers(data);
		}
	};
	fetchUsers();
}, []);

	if (isLoading) {
		return <FuseLoading />;
	}

	const members = widgets?.teamMembers as TeamMemberType[];

	if (!members) {
		return null;
	}

	const container = {
		show: {
			transition: {
				staggerChildren: 0.04
			}
		}
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-24 w-full min-w-0"
		>
			{users.map((member) => (
				<Paper
					component={motion.div}
					variants={item}
					className="flex flex-col flex-auto items-center shadow rounded-xl overflow-hidden"
					key={member.id}
				>
					<div className="flex flex-col flex-auto w-full p-32 text-center">
						<div className="w-128 h-128 mx-auto rounded-full overflow-hidden">
						<Avatar
						sx={(theme) => ({
							background: (theme) => darken(theme.palette.background.default, 0.05),
							color: theme.palette.text.secondary
						})}
						className=" w-full h-full mt-4"
						alt="user photo"
						src={member?.photoURL}
					>
						{member?.displayName?.[0]}
					</Avatar>
						</div>
						<Typography className="mt-24 font-medium">{member.displayName}</Typography>
						{/* <Typography color="text.secondary">{member.role}</Typography> */}
					</div>
					<div className="flex items-center w-full border-t divide-x">
						<a
							className="flex flex-auto items-center justify-center py-16 hover:bg-hover"
							href={`mailto:${member.email}`}
							role="button"
						>
							<FuseSvgIcon
								size={20}
								color="action"
							>
								heroicons-solid:envelope
							</FuseSvgIcon>
							<Typography className="ml-8">Email</Typography>
						</a>
						<a
							className="flex flex-auto items-center justify-center py-16 hover:bg-hover"
							href={`tel${member.phone}`}
							role="button"
						>
							<FuseSvgIcon
								size={20}
								color="action"
							>
								heroicons-solid:phone
							</FuseSvgIcon>
							<Typography className="ml-8">Call</Typography>
						</a>
					</div>
				</Paper>
			))}
		</motion.div>
	);
}

export default memo(TeamMembersWidget);
