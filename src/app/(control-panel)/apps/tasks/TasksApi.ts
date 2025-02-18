// import { apiService as api } from 'src/store/apiService';
// import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

// export const addTagTypes = ['tasks_list', 'tasks_item', 'tasks_tags'] as const;

// const TasksApi = api
// 	.enhanceEndpoints({
// 		addTagTypes
// 	})
// 	.injectEndpoints({
// 		endpoints: (build) => ({
// 			getTasks: build.query<GetTasksApiResponse, GetTasksApiArg>({
// 				query: () => ({ url: `/api/mock/tasks/items` }),
// 				providesTags: ['tasks_list']
// 			}),
// 			reorderTasks: build.mutation<ReorderTasksApiResponse, ReorderTasksApiArg>({
// 				query: ({ startIndex, endIndex }) => {
// 					return {
// 						url: `/api/mock/tasks/reorder`,
// 						method: 'POST',
// 						body: { startIndex, endIndex }
// 					};
// 				},
// 				invalidatesTags: ['tasks_list'],
// 				async onQueryStarted(_, { dispatch, queryFulfilled }) {
// 					try {
// 						await queryFulfilled;
// 						dispatch(
// 							showMessage({
// 								message: 'List Order Saved',
// 								autoHideDuration: 2000,
// 								anchorOrigin: {
// 									vertical: 'top',
// 									horizontal: 'right'
// 								}
// 							})
// 						);
// 					} catch (err) {
// 						console.error(err);
// 						dispatch(showMessage({ message: 'Error saving list order' }));
// 					}
// 				}
// 			}),
// 			createTasksItem: build.mutation<CreateTasksItemApiResponse, CreateTasksItemApiArg>({
// 				query: (task) => ({
// 					url: `/api/mock/tasks/items`,
// 					method: 'POST',
// 					body: task
// 				}),
// 				invalidatesTags: ['tasks_list']
// 			}),
// 			getTasksItem: build.query<GetTasksItemApiResponse, GetTasksItemApiArg>({
// 				query: (taskId) => ({ url: `/api/mock/tasks/items/${taskId}` }),
// 				providesTags: ['tasks_item']
// 			}),
// 			deleteTasksItem: build.mutation<DeleteTasksItemApiResponse, DeleteTasksItemApiArg>({
// 				query: (taskId) => ({
// 					url: `/api/mock/tasks/items/${taskId}`,
// 					method: 'DELETE'
// 				}),
// 				invalidatesTags: ['tasks_list']
// 			}),
// 			updateTasksItems: build.mutation<UpdateTasksItemsApiResponse, UpdateTasksItemsApiArg>({
// 				query: (tasks) => ({
// 					url: `/api/mock/tasks/items`,
// 					method: 'PUT',
// 					body: tasks
// 				}),
// 				invalidatesTags: ['tasks_item', 'tasks_list'],
// 				async onQueryStarted(updatedTasks, { dispatch, queryFulfilled }) {
// 					const patchResult = dispatch(
// 						TasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
// 							// Update the draft state with the optimistic update
// 							updatedTasks.forEach((updatedTask) => {
// 								const index = draft.findIndex((task) => task.id === updatedTask.id);

// 								if (index !== -1) {
// 									draft[index] = { ...draft[index], ...updatedTask };
// 								}
// 							});
// 						})
// 					);
// 					try {
// 						await queryFulfilled;
// 					} catch {
// 						patchResult.undo(); // Rollback if the mutation fails
// 					}
// 				}
// 			}),
// 			updateTasksItem: build.mutation<UpdateTasksItemApiResponse, UpdateTasksItemApiArg>({
// 				query: (task) => ({
// 					url: `/api/mock/tasks/items/${task.id}`,
// 					method: 'PUT',
// 					body: task
// 				}),
// 				invalidatesTags: ['tasks_item', 'tasks_list']
// 			}),
// 			getTasksTags: build.query<GetTasksTagsApiResponse, GetTasksTagsApiArg>({
// 				query: () => ({ url: `/api/mock/tasks/tags` }),
// 				providesTags: ['tasks_tags']
// 			}),
// 			createTasksTag: build.mutation<CreateTasksTagApiResponse, CreateTasksTagApiArg>({
// 				query: (tag) => ({
// 					url: `/api/mock/tasks/tags`,
// 					method: 'POST',
// 					body: tag
// 				}),
// 				invalidatesTags: ['tasks_tags']
// 			})
// 		}),
// 		overrideExisting: false
// 	});
// export { TasksApi };

// export type GetTasksApiResponse = /** status 200 OK */ Task[];
// export type GetTasksApiArg = void;

// export type ReorderTasksApiResponse = /** status 200 OK */ Task[];
// export type ReorderTasksApiArg = { startIndex: number; endIndex: number };

// export type CreateTasksItemApiResponse = /** status 201 Created */ Task;
// export type CreateTasksItemApiArg = Task;

// export type GetTasksItemApiResponse = /** status 200 OK */ Task;
// export type GetTasksItemApiArg = string;

// export type DeleteTasksItemApiResponse = unknown;
// export type DeleteTasksItemApiArg = string;

// export type UpdateTasksItemsApiResponse = /** status 200 OK */ Task[];
// export type UpdateTasksItemsApiArg = Partial<Task>[];

// export type UpdateTasksItemApiResponse = /** status 200 OK */ Task;
// export type UpdateTasksItemApiArg = Task;

// export type GetTasksTagsApiResponse = /** status 200 OK */ Tag[];
// export type GetTasksTagsApiArg = void;

// export type CreateTasksTagApiResponse = /** status 200 OK */ Tag;
// export type CreateTasksTagApiArg = Tag;

// export type Task = {
// 	id: string;
// 	type: string;
// 	title: string;
// 	notes: string;
// 	completed: boolean;
// 	dueDate?: string | null;
// 	priority: number;
// 	tags: string[];
// 	assignedTo?: null | string;
// 	subTasks: {
// 		id: string;
// 		title: string;
// 		completed: boolean;
// 	}[];
// 	order: number;
// };

// export type Tag = {
// 	id: string;
// 	title: string;
// };

// export const {
// 	useGetTasksQuery,
// 	useCreateTasksItemMutation,
// 	useGetTasksItemQuery,
// 	useDeleteTasksItemMutation,
// 	useUpdateTasksItemMutation,
// 	useUpdateTasksItemsMutation,
// 	useGetTasksTagsQuery,
// 	useCreateTasksTagMutation,
// 	useReorderTasksMutation
// } = TasksApi;

// export type TasksApiType = {
// 	[TasksApi.reducerPath]: ReturnType<typeof TasksApi.reducer>;
// };

// -------------------------------------------------- Old Code ------------------------------------//

// import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
// import { supabaseClient } from '@/utils/supabaseClient';

// export const addTagTypes = ['tasks_list', 'tasks_item', 'tasks_tags'] as const;

// // Reorder function
// const reorder = (list: Task[], startIndex: number, endIndex: number): Task[] => {
// 	const result = Array.from(list);
// 	const [removed] = result.splice(startIndex, 1);
// 	result.splice(endIndex, 0, removed);

// 	return result.map((task, index) => ({ ...task, order: index }));
// };

// const TasksApi = {
// 	useGetTasksQuery: async () => {
// 		const { data, error } = await supabaseClient
// 			.from('tasks')
// 			.select('*')
// 			.order('order', { ascending: true }); // Ensure order is maintained
// 		if (error) throw error;
// 		return data;
// 	},

// 	useReorderTasksMutation: async ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
// 		// Fetch all tasks
// 		const { data: tasks, error } = await supabaseClient
// 			.from('tasks')
// 			.select('*')
// 			.order('order', { ascending: true });

// 		if (error) throw error;

// 		// Reorder the tasks
// 		const reorderedTasks = reorder(tasks, startIndex, endIndex);

// 		// Update each task's order in Supabase
// 		const updates = reorderedTasks.map(task =>
// 			supabaseClient.from('tasks').update({ order: task.order }).eq('id', task.id)
// 		);

// 		await Promise.all(updates);
		
// 	},

// 	useCreateTasksItemMutation: async (task: Task) => {
// 		const { data, error } = await supabaseClient.from('tasks').insert([task]).select().single();
// 		if (error) throw error;
// 		return data;
// 	},

// 	useGetTasksItemQuery: async (taskId: string) => {
// 		const { data, error } = await supabaseClient.from('tasks').select('*').eq('id', taskId).single();
// 		if (error) throw error;
// 		return data;
// 	},

// 	useDeleteTasksItemMutation: async (taskId: string) => {
// 		const { error } = await supabaseClient.from('tasks').delete().eq('id', taskId);
// 		if (error) throw error;
// 	},

// 	useUpdateTasksItemMutation: async (task: Task) => {
// 		const { data, error } = await supabaseClient.from('tasks').update(task).eq('id', task.id).select().single();
// 		if (error) throw error;
// 		return data;
// 	},

// 	useUpdateTasksItemsMutation: async (tasks: Partial<Task>[]) => {
// 		const promises = tasks.map(task =>
// 			supabaseClient.from('tasks').update(task).eq('id', task.id)
// 		);
// 		await Promise.all(promises);
// 	},

// 	useGetTasksTagsQuery: async () => {
// 		const { data, error } = await supabaseClient.from('task_tags').select('*');
// 		if (error) throw error;
// 		return data;
// 	},

// 	useCreateTasksTagMutation: async (tag: Tag) => {
// 		const { data, error } = await supabaseClient.from('task_tags').insert([tag]).select().single();
// 		if (error) throw error;
// 		return data;
// 	}
// };

// export { TasksApi };



// --------------------------------------- New Code That works ----------------------------------//


import { supabaseClient } from '@/utils/supabaseClient';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

export const addTagTypes = ['tasks_list', 'tasks_item', 'tasks_tags'] as const;

const TasksApi = {
	// Get all tasks
	useGetTasksQuery: async () => {
		try {
			const { data, error } = await supabaseClient.from('task').select('*');

			if (error) throw error;

			return { data, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	},

	// Reorder tasks
	useReorderTasksMutation: async ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
		try {
			// Fetch tasks
			const { data: tasks, error } = await supabaseClient.from('task').select('*');

			if (error) throw error;

			// Reorder locally
			const reorderedTasks = reorder(tasks, startIndex, endIndex);

			// Update order in Supabase
			const updates = reorderedTasks.map((task: Task, index) => ({ id: task.id, order: index }));
			const { error: updateError } = await supabaseClient.from('task').upsert(updates);

			if (updateError) throw updateError;

			// Show success message
			showMessage({
				message: 'List Order Saved',
				autoHideDuration: 2000,
				anchorOrigin: { vertical: 'top', horizontal: 'right' }
			});

			return { data: reorderedTasks, isLoading: false, error: null };
		} catch (error) {
			showMessage({ message: 'Error saving list order' });
			return { data: null, isLoading: false, error };
		}
	},

	// Create a task
	useCreateTasksItemMutation: async (task: Task) => {
		try {
			const { data, error } = await supabaseClient.from('task').insert([task]).select().single();

			if (error) throw error;

			return { data, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	},

	// Get a single task
	useGetTasksItemQuery: async (taskId: string) => {
		try {
			const { data, error } = await supabaseClient.from('task').select('*').eq('id', taskId).single();

			if (error) throw error;

			return { data, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	},

	// Delete a task
	useDeleteTasksItemMutation: async (taskId: string) => {
		try {
			const { error } = await supabaseClient.from('task').delete().eq('id', taskId);

			if (error) throw error;

			return { data: true, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	},

	// Update a task
	useUpdateTasksItemMutation: async (task: Task) => {
		try {
			const { data, error } = await supabaseClient.from('task').update(task).eq('id', task.id).select().single();

			if (error) throw error;

			return { data, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	},

	// Get tags
	useGetTasksTagsQuery: async () => {
		try {
			const { data, error } = await supabaseClient.from('tag').select('*');

			if (error) throw error;
// console.log(data);
			return { data, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	},

	// Create a tag
	useCreateTasksTagMutation: async (tag: Tag) => {
		try {
			const { data, error } = await supabaseClient.from('tag').insert([tag]).select().single();

			if (error) throw error;

			return { data, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	},
	useUpdateTasksItemsMutation: async (tasks: Task[]) => {
		try {
			const { data, error } = await supabaseClient.from('task').upsert(tasks);
	
			if (error) throw error;
	
			return { data, isLoading: false, error: null };
		} catch (error) {
			return { data: null, isLoading: false, error };
		}
	}
};

// Utility function for reordering
const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
};

export { TasksApi };

export type Task = {
	id: string;
	type: string;
	title: string;
	notes: string;
	completed: boolean;
	dueDate?: string | null;
	priority: number;
	tags: string[];
	assignedTo?: null | string;
	subTasks: {
		id: string;
		title: string;
		completed: boolean;
	}[];
	order: number;
};

export type Tag = {
	id: string;
	title: string;
};

export const {
	useGetTasksQuery,
	useCreateTasksItemMutation,
	useGetTasksItemQuery,
	useDeleteTasksItemMutation,
	useUpdateTasksItemMutation,
	useUpdateTasksItemsMutation,
	useGetTasksTagsQuery,
	useCreateTasksTagMutation,
	useReorderTasksMutation
} = TasksApi;