// import { apiService as api } from 'src/store/apiService';
// import { ReactNode } from 'react';

// export const addTagTypes = ['notifications', 'notification'] as const;

// const NotificationApi = api
// 	.enhanceEndpoints({
// 		addTagTypes
// 	})
// 	.injectEndpoints({
// 		endpoints: (build) => ({
// 			getAllNotifications: build.query<GetAllNotificationsApiResponse, GetAllNotificationsApiArg>({
// 				query: () => ({ url: `/api/mock/notifications` }),
// 				providesTags: ['notifications']
// 			}),
// 			createNotification: build.mutation<CreateNotificationApiResponse, CreateNotificationApiArg>({
// 				query: (notification) => ({
// 					url: `/api/mock/notifications`,
// 					method: 'POST',
// 					body: notification
// 				}),
// 				invalidatesTags: ['notifications']
// 			}),
// 			deleteNotifications: build.mutation<DeleteNotificationsApiResponse, DeleteNotificationsApiArg>({
// 				query: (notificationIds) => ({
// 					url: `/api/mock/notifications`,
// 					method: 'DELETE',
// 					body: notificationIds
// 				}),
// 				invalidatesTags: ['notifications']
// 			}),
// 			getNotification: build.query<GetNotificationApiResponse, GetNotificationApiArg>({
// 				query: (notificationId) => ({
// 					url: `/api/mock/notifications/${notificationId}`
// 				}),
// 				providesTags: ['notification']
// 			}),
// 			deleteNotification: build.mutation<DeleteNotificationApiResponse, DeleteNotificationApiArg>({
// 				query: (notificationId) => ({
// 					url: `/api/mock/notifications/${notificationId}`,
// 					method: 'DELETE'
// 				}),
// 				invalidatesTags: ['notifications']
// 			})
// 		}),
// 		overrideExisting: false
// 	});
// export default NotificationApi;

// export type GetAllNotificationsApiResponse = /** status 200 OK */ Notification[];
// export type GetAllNotificationsApiArg = void;

// export type CreateNotificationApiResponse = unknown;
// export type CreateNotificationApiArg = Notification;

// export type DeleteNotificationsApiResponse = unknown;
// export type DeleteNotificationsApiArg = string[];

// export type GetNotificationApiResponse = /** status 200 OK */ Notification;
// export type GetNotificationApiArg = string; /** notification id */

// export type DeleteNotificationApiResponse = unknown;
// export type DeleteNotificationApiArg = string; /** notification id */

// export type Notification = {
// 	id?: string;
// 	icon?: string;
// 	title?: string;
// 	description?: string;
// 	time?: string;
// 	read?: boolean;
// 	link?: string;
// 	useRouter?: boolean;
// 	variant?: 'success' | 'info' | 'error' | 'warning' | 'alert' | 'primary' | 'secondary';
// 	image?: string;
// 	children?: ReactNode;
// };

// export const {
// 	useGetAllNotificationsQuery,
// 	useCreateNotificationMutation,
// 	useDeleteNotificationsMutation,
// 	useGetNotificationQuery,
// 	useDeleteNotificationMutation
// } = NotificationApi;

import { supabaseClient } from '@/utils/supabaseClient'; // Import your Supabase client
import { ReactNode } from 'react';

export const addTagTypes = ['notifications', 'notification'] as const;

const NotificationApi = {
  // Get all notifications
  useGetAllNotificationsQuery: async (userId: string) => {
    try {
      // Step 1: Fetch dismissed notification IDs for the user
      const { data: dismissedData, error: dismissedError } = await supabaseClient
        .from('dismissed_notifications')
        .select('notification_id')
        .eq('user_id', userId);
  
      if (dismissedError) throw dismissedError;
  
      const dismissedIds = (dismissedData || []).map((item) => item.notification_id);
  
      // Step 2: Fetch notifications NOT in those IDs
      let query = supabaseClient.from('notification').select('*');
  
      if (dismissedIds.length > 0) {
        query = query.not('id', 'in', `(${dismissedIds.join(',')})`);
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
  
      return { data: data || [], isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },  

  // Create a notification
  useCreateNotificationMutation: async (notification: Notification) => {
    try {
      const { data, error } = await supabaseClient
        .from('notification') // Replace with your Supabase table name
        .insert([notification]);

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Get a single notification
  useGetNotificationQuery: async (notificationId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('notification') // Replace with your Supabase table name
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Delete notifications
  useDeleteNotificationsMutation: async (notificationIds: string[]) => {
    try {
      const { error } = await supabaseClient
        .from('notification') // Replace with your Supabase table name
        .delete()
        .in('id', notificationIds);

      if (error) throw error;
      return { data: true, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  // Delete a single notification
  useDeleteNotificationMutation: async (notificationId: string) => {
    try {
      const { error } = await supabaseClient
        .from('notification') // Replace with your Supabase table name
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { data: true, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },
   useGetUndismissedNotificationsQuery : async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('notification')
        .select('*')
        .not(
          'id',
          'in',
          supabaseClient
            .from('dismissed_notifications')
            .select('notification_id')
            .eq('user_id', userId)
        );
  
      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },
   useDismissNotificationMutation : async (userId: string, notificationId: string) => {
    try {
      const { error } = await supabaseClient
        .from('dismissed_notifications')
        .insert({ user_id: userId, notification_id: notificationId });
  
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

export const {
  useGetAllNotificationsQuery,
  useCreateNotificationMutation,
  useGetNotificationQuery,
  useDeleteNotificationsMutation,
  useDeleteNotificationMutation,
  useGetUndismissedNotificationsQuery,
  useDismissNotificationMutation,
} = NotificationApi;

// Type Definitions
export type Notification = {
  id?: string;
  icon?: string;
  title?: string;
  description?: string;
  time?: string;
  read?: boolean;
  link?: string;
  useRouter?: boolean;
  variant?: 'success' | 'info' | 'error' | 'warning' | 'alert' | 'primary' | 'secondary';
  image?: string;
  children?: ReactNode;
};
