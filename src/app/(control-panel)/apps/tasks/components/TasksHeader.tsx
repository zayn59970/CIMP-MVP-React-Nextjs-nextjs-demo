import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { Task } from '../TasksApi';
import { useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { supabaseClient } from '@/utils/supabaseClient';

function TasksHeader() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [remainingTasks, setRemainingTasks] = useState(0); // Fix: Use state for remaining tasks

	/** Fetch tasks from Supabase */
	const fetchTasks = async () => {
		setIsLoading(true);
		const { data, error } = await supabaseClient.from('task').select('*');

		if (error) {
			setError(error.message);
		} else {
			setTasks(data);
		}

		setIsLoading(false);
	};

	/** Subscribe to real-time changes */
	useEffect(() => {
		fetchTasks();

		const channel = supabaseClient
			.channel('tasks')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'task' },
				(payload) => {
					console.log('Task Change Detected:', payload);

					setTasks((prevTasks) => {
						switch (payload.eventType) {
							case 'INSERT':
								return [...prevTasks, payload.new as Task];
							case 'UPDATE':
								return prevTasks.map((task) =>
									task.id === (payload.new as Task).id ? (payload.new as Task) : task
								);
							case 'DELETE':
								return prevTasks.filter((task) => task.id !== (payload.old as Task).id);
							default:
								return prevTasks;
						}
					});
				}
			)
			.subscribe();

		return () => {
			supabaseClient.removeChannel(channel);
		};
	}, []);

	/** Update remainingTasks whenever tasks change */
	useEffect(() => {
		setRemainingTasks(_.filter(tasks, (item) => item.type === 'task' && !item.completed).length);
	}, [tasks]);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<div className="flex flex-col sm:flex-row space-y-16 sm:space-y-0 p-24 sm:p-32 w-full justify-between">
			<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-12">
				<div>
					<PageBreadcrumb className="mb-8" />

					<motion.span
						initial={{ x: -20 }}
						animate={{
							x: 0,
							transition: { delay: 0.2 }
						}}
					>
						<Typography className="text-4xl font-extrabold leading-none tracking-tight mb-4">
							Tasks
						</Typography>
					</motion.span>

					<motion.span
						initial={{ y: -20, opacity: 0 }}
						animate={{
							y: 0,
							opacity: 1,
							transition: { delay: 0.2 }
						}}
					>
						<Typography className="text-base font-medium ml-2" color="text.secondary">
							{`${remainingTasks} remaining tasks`}
						</Typography>
					</motion.span>
				</div>
			</div>

			<div className="flex items-center space-x-8">
				<Button
					className="whitespace-nowrap"
					component={NavLinkAdapter}
					to="/apps/tasks/new/section"
					color="primary"
					variant="contained"
				>
					<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
					<span className="mx-8">Add Section</span>
				</Button>
				<Button
					className="whitespace-nowrap"
					variant="contained"
					color="secondary"
					component={NavLinkAdapter}
					to="/apps/tasks/new/task"
				>
					<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
					<span className="mx-8">Add Task</span>
				</Button>
			</div>
		</div>
	);
}

export default TasksHeader;
