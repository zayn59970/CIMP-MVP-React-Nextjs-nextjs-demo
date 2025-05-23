import { createSelector } from '@reduxjs/toolkit';
import { apiService as api } from 'src/store/apiService';
import FuseUtils from '@fuse/utils';
import { selectSearchText } from './contactsAppSlice';

export const addTagTypes = ['contacts_item', 'contacts', 'contacts_tag', 'contacts_tags', 'countries'] as const;

const ContactsApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getContactsList: build.query<GetContactsListApiResponse, GetContactsListApiArg>({
				query: () => ({ url: `/api/mock/contacts/items` }),
				providesTags: ['contacts']
			}),
			createContactsItem: build.mutation<CreateContactsItemApiResponse, CreateContactsItemApiArg>({
				query: (queryArg) => ({
					url: `/api/mock/contacts/items`,
					method: 'POST',
					body: queryArg.contact
				}),
				invalidatesTags: ['contacts']
			}),
			getContactsItem: build.query<GetContactsItemApiResponse, GetContactsItemApiArg>({
				query: (contactId) => ({
					url: `/api/mock/contacts/items/${contactId}`
				}),
				providesTags: ['contacts_item']
			}),
			updateContactsItem: build.mutation<UpdateContactsItemApiResponse, UpdateContactsItemApiArg>({
				query: (contact) => ({
					url: `/api/mock/contacts/items/${contact.id}`,
					method: 'PUT',
					body: contact
				}),
				invalidatesTags: ['contacts_item', 'contacts']
			}),
			deleteContactsItem: build.mutation<DeleteContactsItemApiResponse, DeleteContactsItemApiArg>({
				query: (contactId) => ({
					url: `/api/mock/contacts/items/${contactId}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['contacts']
			}),
			getContactsTag: build.query<GetContactsTagApiResponse, GetContactsTagApiArg>({
				query: (tagId) => ({ url: `/api/mock/contacts/tags/${tagId}` }),
				providesTags: ['contacts_tag']
			}),
			updateContactsTag: build.mutation<UpdateContactsTagApiResponse, UpdateContactsTagApiArg>({
				query: (tag) => ({
					url: `/api/mock/contacts/tags/${tag.id}`,
					method: 'PUT',
					body: tag
				}),
				invalidatesTags: ['contacts_tags']
			}),
			deleteContactsTag: build.mutation<DeleteContactsTagApiResponse, DeleteContactsTagApiArg>({
				query: (tagId) => ({
					url: `/api/mock/contacts/tags/${tagId}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['contacts_tags']
			}),
			getContactsTags: build.query<GetContactTagsApiResponse, GetContactTagsApiArg>({
				query: () => ({ url: `/api/mock/contacts/tags` }),
				providesTags: ['contacts_tags']
			}),
			getContactsCountries: build.query<GetContactsCountriesApiResponse, GetContactsCountriesApiArg>({
				query: () => ({ url: `/api/mock/countries` }),
				providesTags: ['countries']
			}),
			createContactsTag: build.mutation<CreateContactsTagApiResponse, CreateContactsTagApiArg>({
				query: (queryArg) => ({
					url: `/api/mock/contacts/tags`,
					method: 'POST',
					body: queryArg.tag
				}),
				invalidatesTags: ['contacts_tags']
			})
		}),
		overrideExisting: false
	});

export default ContactsApi;

export type GetContactsItemApiResponse = /** status 200 User Found */ Contact;
export type GetContactsItemApiArg = string;

export type UpdateContactsItemApiResponse = /** status 200 Contact Updated */ Contact;
export type UpdateContactsItemApiArg = Contact;

export type DeleteContactsItemApiResponse = unknown;
export type DeleteContactsItemApiArg = string;

export type GetContactsListApiResponse = /** status 200 OK */ Contact[];
export type GetContactsListApiArg = void;

export type CreateContactsItemApiResponse = /** status 201 Created */ Contact;
export type CreateContactsItemApiArg = {
	contact: Contact;
};

export type GetContactsTagApiResponse = /** status 200 Tag Found */ Tag;
export type GetContactsTagApiArg = string;

export type GetContactsCountriesApiResponse = /** status 200 */ Country[];
export type GetContactsCountriesApiArg = void;

export type UpdateContactsTagApiResponse = /** status 200 */ Tag;
export type UpdateContactsTagApiArg = Tag;

export type DeleteContactsTagApiResponse = unknown;
export type DeleteContactsTagApiArg = string;

export type GetContactTagsApiResponse = /** status 200 OK */ Tag[];
export type GetContactTagsApiArg = void;

export type CreateContactsTagApiResponse = /** status 200 OK */ Tag;
export type CreateContactsTagApiArg = {
	tag: Tag;
};

export type ContactPhoneNumber = {
	country: string;
	phoneNumber: string;
	label?: string;
};

export type ContactEmail = {
	email: string;
	label?: string;
};

export type Contact = {
	id: string;
	avatar?: string;
	background?: string;
	name: string;
	displayName?: string;
	email?: string;
	photoURL?: string;
	emails?: ContactEmail[];
	phoneNumbers?: ContactPhoneNumber[];
	title?: string;
	company?: string;
	birthday?: string;
	address?: string;
	notes?: string;
	tags?: string[];
};

export type Tag = {
	id: string;
	title: string;
};

export type Country = {
	id?: string;
	title?: string;
	iso?: string;
	code?: string;
	flagImagePos?: string;
};

export type GroupedContacts = {
	group: string;
	children?: Contact[];
};

export type AccumulatorType = Record<string, GroupedContacts>;

export const {
	useGetContactsItemQuery,
	useUpdateContactsItemMutation,
	useDeleteContactsItemMutation,
	useGetContactsListQuery,
	useCreateContactsItemMutation,
	useGetContactsTagQuery,
	useGetContactsCountriesQuery,
	useUpdateContactsTagMutation,
	useDeleteContactsTagMutation,
	useGetContactsTagsQuery,
	useCreateContactsTagMutation
} = ContactsApi;

export type ContactsApiType = {
	[ContactsApi.reducerPath]: ReturnType<typeof ContactsApi.reducer>;
};

/**
 * Select filtered contacts
 */
export const selectFilteredContactList = (contacts: Contact[]) =>
	createSelector([selectSearchText], (searchText) => {
		if (!contacts) {
			return [];
		}

		if (searchText.length === 0) {
			return contacts;
		}

		return FuseUtils.filterArrayByString<Contact>(contacts, searchText);
	});

/**
 * Select grouped contacts
 */
export const selectGroupedFilteredContacts = (contacts: Contact[]) =>
	createSelector([selectFilteredContactList(contacts)], (contacts) => {
		if (!contacts) {
			return [];
		}

		// Use displayName or fallback to email
		const sortedContacts = [...contacts]?.sort((a, b) => {
			const nameA = a.displayName || a.email || '';
			const nameB = b.displayName || b.email || '';
			return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
		});

		const groupedObject: Record<string, GroupedContacts> = sortedContacts.reduce<AccumulatorType>((acc, contact) => {
			// Use displayName or fallback to email
			const name = contact.displayName || contact.email || '';
			const group = name.charAt(0).toUpperCase();

			if (!acc[group]) {
				acc[group] = { group, children: [contact] };
			} else {
				acc[group].children?.push(contact);
			}

			return acc;
		}, {});

		return groupedObject;
	});
