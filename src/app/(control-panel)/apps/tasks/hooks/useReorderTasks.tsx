import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Task, useGetTasksQuery, useUpdateTasksItemsMutation } from '../TasksApi';

function useReorderTasks() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const fetchTasks = useGetTasksQuery;
	const updateTasksItems = useUpdateTasksItemsMutation;

	// Fetch tasks initially
	useEffect(() => {
		const loadTasks = async () => {
			setIsLoading(true);
			const { data, error } = await fetchTasks();
			if (!error) {
				setTasks(data);
			}
			setIsLoading(false);
		};
		loadTasks();
	}, []);

	const reorderTasks = useCallback(
		async ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
			if (!tasks.length) return;

			// Create a deep copy and sort by order
			const ordered = _.cloneDeep(tasks).sort((a, b) => a.order - b.order);

			// Remove the dragged item and insert it at the new position
			const [removed] = ordered.splice(startIndex, 1);
			ordered.splice(endIndex, 0, removed);

			// Update the order values
			const updatedTasks = ordered.map((task, index) => ({ ...task, order: index }));

			// Update the local state
			setTasks(updatedTasks);

			// Update in Supabase
			await updateTasksItems(updatedTasks);
		},
		[tasks, updateTasksItems]
	);

	return { reorderTasks, tasks, isLoading };
}

export default useReorderTasks;
