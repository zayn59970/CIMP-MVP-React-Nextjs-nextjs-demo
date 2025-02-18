// import { apiService as api } from 'src/store/apiService';

// export const addTagTypes = [
// 	'notes_list',
// 	'notes_item',
// 	'notes_labels',
// 	'notes_label',
// 	'notes_archived_items',
// 	'notes_reminder_items'
// ] as const;

// const NotesApi = api
// 	.enhanceEndpoints({
// 		addTagTypes
// 	})
// 	.injectEndpoints({
// 		endpoints: (build) => ({
// 			getNotesList: build.query<GetNotesListApiResponse, GetNotesListApiArg>({
// 				query: (routeParams) => {
// 					const { filter, id } = routeParams;

// 					if (filter === 'labels') {
// 						return {
// 							url: `/api/mock/notes/items`,
// 							params: {
// 								labels: id
// 							}
// 						};
// 					}

// 					if (filter === 'archive') {
// 						return {
// 							url: `/api/mock/notes/items`,
// 							params: {
// 								archived: true
// 							}
// 						};
// 					}

// 					if (filter === 'reminders') {
// 						return {
// 							url: `/api/mock/notes/items`,
// 							params: {
// 								reminder: 'not_null'
// 							}
// 						};
// 					}

// 					return {
// 						url: `/api/mock/notes/items`
// 					};
// 				},
// 				providesTags: ['notes_list']
// 			}),
// 			createNotesItem: build.mutation<CreateNotesItemApiResponse, CreateNotesItemApiArg>({
// 				query: (note) => ({
// 					url: `/api/mock/notes/items`,
// 					method: 'POST',
// 					body: note
// 				}),
// 				invalidatesTags: ['notes_list', 'notes_item']
// 			}),
// 			getNotesItem: build.query<GetNotesItemApiResponse, GetNotesItemApiArg>({
// 				query: (queryArg) => ({
// 					url: `/api/mock/notes/items/${queryArg.noteId}`
// 				}),
// 				providesTags: ['notes_item']
// 			}),
// 			updateNotesItem: build.mutation<UpdateNotesItemApiResponse, UpdateNotesItemApiArg>({
// 				query: (note) => ({
// 					url: `/api/mock/notes/items/${note.id}`,
// 					method: 'PUT',
// 					body: note
// 				}),
// 				invalidatesTags: ['notes_item', 'notes_list']
// 			}),
// 			deleteNotesItem: build.mutation<DeleteNotesItemApiResponse, DeleteNotesItemApiArg>({
// 				query: (noteId) => ({
// 					url: `/api/mock/notes/items/${noteId}`,
// 					method: 'DELETE'
// 				}),
// 				invalidatesTags: ['notes_list']
// 			}),
// 			getNotesLabels: build.query<GetNotesLabelsApiResponse, GetNotesLabelsApiArg>({
// 				query: () => ({ url: `/api/mock/notes/labels` }),
// 				providesTags: ['notes_labels']
// 			}),
// 			createNotesLabel: build.mutation<CreateNotesLabelApiResponse, CreateNotesLabelApiArg>({
// 				query: (noteLabel) => ({
// 					url: `/api/mock/notes/labels`,
// 					method: 'POST',
// 					body: noteLabel
// 				}),
// 				invalidatesTags: ['notes_label', 'notes_labels']
// 			}),
// 			getNotesLabel: build.query<GetNotesLabelApiResponse, GetNotesLabelApiArg>({
// 				query: (queryArg) => ({
// 					url: `/api/mock/notes/labels/${queryArg.labelId}`
// 				}),
// 				providesTags: ['notes_label']
// 			}),
// 			updateNotesLabel: build.mutation<UpdateNotesLabelApiResponse, UpdateNotesLabelApiArg>({
// 				query: (notesLabel) => ({
// 					url: `/api/mock/notes/labels/${notesLabel.id}`,
// 					method: 'PUT',
// 					body: notesLabel
// 				}),
// 				invalidatesTags: ['notes_labels']
// 			}),
// 			deleteNotesLabel: build.mutation<DeleteNotesLabelApiResponse, DeleteNotesLabelApiArg>({
// 				query: (labelId) => ({
// 					url: `/api/mock/notes/labels/${labelId}`,
// 					method: 'DELETE'
// 				}),
// 				invalidatesTags: ['notes_labels']
// 			}),
// 			getNotesArchivedItems: build.query<GetNotesArchivedItemsApiResponse, GetNotesArchivedItemsApiArg>({
// 				query: () => ({ url: `/api/mock/notes/archive` }),
// 				providesTags: ['notes_archived_items']
// 			}),
// 			getNotesReminderItems: build.query<GetNotesReminderItemsApiResponse, GetNotesReminderItemsApiArg>({
// 				query: () => ({ url: `/api/mock/notes/reminder` }),
// 				providesTags: ['notes_reminder_items']
// 			})
// 		}),
// 		overrideExisting: false
// 	});
// export { NotesApi };

// export type RouteParams = Partial<{
// 	filter: string;
// 	id: string;
// }>;

// export type GetNotesListApiResponse = /** status 200 OK */ NotesNote[];
// export type GetNotesListApiArg = RouteParams;

// export type CreateNotesItemApiResponse = unknown;
// export type CreateNotesItemApiArg = NotesNote;

// export type GetNotesItemApiResponse = /** status 200 OK */ NotesNote;
// export type GetNotesItemApiArg = {
// 	/** note id */
// 	noteId: string;
// };

// export type UpdateNotesItemApiResponse = unknown;
// export type UpdateNotesItemApiArg = NotesNote;

// export type DeleteNotesItemApiResponse = unknown;
// export type DeleteNotesItemApiArg = string;

// export type GetNotesLabelsApiResponse = /** status 200 OK */ NotesLabel[];
// export type GetNotesLabelsApiArg = void;

// export type CreateNotesLabelApiResponse = unknown;
// export type CreateNotesLabelApiArg = NotesLabel;

// export type GetNotesLabelApiResponse = /** status 200 OK */ NotesLabel;
// export type GetNotesLabelApiArg = {
// 	/** label id */
// 	labelId: string;
// };

// export type UpdateNotesLabelApiResponse = unknown;
// export type UpdateNotesLabelApiArg = NotesLabel;

// export type DeleteNotesLabelApiResponse = unknown;
// export type DeleteNotesLabelApiArg = string;

// export type GetNotesArchivedItemsApiResponse = /** status 200 OK */ NotesNote[];
// export type GetNotesArchivedItemsApiArg = void;

// export type GetNotesReminderItemsApiResponse = /** status 200 OK */ NotesNote[];
// export type GetNotesReminderItemsApiArg = void;

// export type NoteListItemType = {
// 	id: string;
// 	content: string;
// 	completed: boolean;
// };

// export type NotesNote = {
// 	id: string;
// 	title: string;
// 	content: string;
// 	tasks?: NoteListItemType[];
// 	image?: string | null;
// 	reminder?: string | null;
// 	labels: string[];
// 	archived: boolean;
// 	createdAt: string;
// 	updatedAt?: string | null;
// };

// export type NotesLabel = {
// 	id: string;
// 	title: string;
// };

// export const {
// 	useGetNotesListQuery,
// 	useCreateNotesItemMutation,
// 	useGetNotesItemQuery,
// 	useUpdateNotesItemMutation,
// 	useDeleteNotesItemMutation,
// 	useGetNotesLabelsQuery,
// 	useCreateNotesLabelMutation,
// 	useGetNotesLabelQuery,
// 	useUpdateNotesLabelMutation,
// 	useDeleteNotesLabelMutation,
// 	useGetNotesArchivedItemsQuery,
// 	useGetNotesReminderItemsQuery
// } = NotesApi;

// export type NotesApiType = {
// 	[NotesApi.reducerPath]: ReturnType<typeof NotesApi.reducer>;
// };
import { supabaseClient } from '@/utils/supabaseClient';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

const NotesApi = {
  // Get notes list
  useGetNotesListQuery: async ({ filter, id }: Partial<{ filter: string; id: string }>) => {
    try {
      let query = supabaseClient.from('notes_note').select('*');

      if (filter === 'labels' && id) {
        query = query.contains('labels', [id]);
      } else if (filter === 'archive') {
        query = query.eq('archived', true);
      } else if (filter === 'reminders') {
        query = query.not('reminder', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Create a note
  useCreateNotesItemMutation: async (note: NotesNote) => {
    try {
      const { data, error } = await supabaseClient.from('notes_note').insert([note]);
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Get a single note
  useGetNotesItemQuery: async (noteId: string) => {
    try {
      const { data, error } = await supabaseClient.from('notes_note').select('*').eq('id', noteId).single();
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Update a note
  useUpdateNotesItemMutation: async (note: NotesNote) => {
    try {
      const { data, error } = await supabaseClient.from('notes_note').update(note).eq('id', note.id);
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Delete a note
  useDeleteNotesItemMutation: async (noteId: string) => {
    try {
      const { error } = await supabaseClient.from('notes_note').delete().eq('id', noteId);
      if (error) throw error;
      return { data: true, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Get labels
  useGetNotesLabelsQuery: async () => {
    try {
      const { data, error } = await supabaseClient.from('notes_label').select('*');
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Create a label
  useCreateNotesLabelMutation: async (noteLabel: {}) => {
    try {
      const { data, error } = await supabaseClient.from('notes_label').insert([noteLabel]);
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Get a single label
  useGetNotesLabelQuery: async (labelId: string) => {
    try {
      const { data, error } = await supabaseClient.from('notes_label').select('*').eq('id', labelId).single();
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Update a label
  useUpdateNotesLabelMutation: async (notesLabel: NotesLabel) => {
    try {
      const { data, error } = await supabaseClient.from('notes_label').update(notesLabel).eq('id', notesLabel.id);
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Delete a label
  useDeleteNotesLabelMutation: async (labelId: string) => {
    try {
      const { error } = await supabaseClient.from('notes_label').delete().eq('id', labelId);
      if (error) throw error;
      return { data: true, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Get archived notes
  useGetNotesArchivedItemsQuery: async () => {
    try {
      const { data, error } = await supabaseClient.from('notes_note').select('*').eq('archived', true);
      if (error) throw error;
      return { data: data || [], isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Get notes with reminders
  useGetNotesReminderItemsQuery: async () => {
    try {
      const { data, error } = await supabaseClient.from('notes_note').select('*').not('reminder', 'is', null);
      if (error) throw error;
      return { data: data || [], isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  }
};

export const {
  useGetNotesListQuery,
  useCreateNotesItemMutation,
  useGetNotesItemQuery,
  useUpdateNotesItemMutation,
  useDeleteNotesItemMutation,
  useGetNotesLabelsQuery,
  useCreateNotesLabelMutation,
  useGetNotesLabelQuery,
  useUpdateNotesLabelMutation,
  useDeleteNotesLabelMutation,
  useGetNotesArchivedItemsQuery,
  useGetNotesReminderItemsQuery
} = NotesApi;

// Type Definitions
export type NotesNote = {
  id: string;
  title: string;
  content: string;
  tasks?: NoteListItemType[];
  image?: string | null;
  reminder?: string | null;
  labels: string[];
  archived: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type NotesLabel = { id: string; title: string };

export type NoteListItemType = { id: string; content: string; completed: boolean };

export type RouteParams = Partial<{
	filter: string;
	id: string;
}>;