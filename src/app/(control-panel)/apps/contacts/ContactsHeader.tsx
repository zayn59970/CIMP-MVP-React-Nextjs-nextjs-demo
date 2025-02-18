import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { ChangeEvent, useEffect, useState } from 'react';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { setSearchText, resetSearchText, selectSearchText } from './contactsAppSlice';
import { selectFilteredContactList, useGetContactsListQuery } from './ContactsApi';

import { supabaseClient} from '@/utils/supabaseClient';

/**
 * The contacts header.
 */
function ContactsHeader() {
	const dispatch = useAppDispatch();
	const searchText = useAppSelector(selectSearchText);
	const [contacts, setContacts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const getData = async () =>{
		const { data, error } = await supabaseClient
		.from('contact')
		.select('*');
		if (error) {
			console.log('error', error);
			return error;
		}
		setIsLoading(false);
	return data;
	}
	useEffect(() => {
		getData().then(data => {
			if (!Array.isArray(data)) {
				console.error('Failed to fetch Contacts:', data);
				return;
			}
			setContacts(data);
		});
    }, []);











	// const { data, isLoading } = useGetContactsListQuery();

	const filteredData = useAppSelector(selectFilteredContactList(contacts));

	useEffect(() => {
		return () => {
			dispatch(resetSearchText());
		};
	}, [dispatch]);

	if (isLoading) {
		return null;
	}

	return (
		<div className="p-24 sm:p-32 w-full">
			<PageBreadcrumb className="mb-8" />

			<div className="flex flex-col space-y-4">
				<motion.span
					initial={{ x: -20 }}
					animate={{ x: 0, transition: { delay: 0.2 } }}
				>
					<Typography className="text-4xl font-extrabold leading-none tracking-tight">Contacts</Typography>
				</motion.span>
				<motion.span
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
				>
					<Typography
						component={motion.span}
						className="text-base font-medium ml-2"
						color="text.secondary"
					>
						{`${filteredData?.length} contacts`}
					</Typography>
				</motion.span>
			</div>
			<div className="flex flex-1 items-center mt-16 space-x-8">
				<Box
					component={motion.div}
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
					className="flex flex-1 w-full sm:w-auto items-center px-12 border-1 rounded-lg h-36"
				>
					<FuseSvgIcon color="action">heroicons-outline:magnifying-glass</FuseSvgIcon>

					<Input
						placeholder="Search contacts"
						className="flex flex-1"
						disableUnderline
						fullWidth
						value={searchText}
						inputProps={{
							'aria-label': 'Search'
						}}
						onChange={(ev: ChangeEvent<HTMLInputElement>) => dispatch(setSearchText(ev))}
					/>
				</Box>
				<Button
					className=""
					variant="contained"
					color="secondary"
					component={NavLinkAdapter}
					to="/apps/contacts/new"
				>
					<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
					<span className="hidden sm:flex mx-8">Add</span>
				</Button>
			</div>
		</div>
	);
}

export default ContactsHeader;
