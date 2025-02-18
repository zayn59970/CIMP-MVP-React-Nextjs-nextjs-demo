import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItem from '@mui/material/ListItem';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEffect, useState } from 'react';
import { useDebounce } from '@fuse/hooks';
import _ from 'lodash';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	NotesLabel,
	useDeleteNotesLabelMutation,
	useGetNotesLabelsQuery,
	useUpdateNotesLabelMutation
} from '../../NotesApi';
import FuseLoading from '@fuse/core/FuseLoading';

type LabelFormProps = {
	label: NotesLabel;
};

/**
 * The new label form.
 */
function NewLabelForm(props: LabelFormProps) {
	const { label } = props;

	const [labels, setLabels] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
  
	const fetchTasks = async () => {
	  setIsLoading(true);
	  const { data } = await useGetNotesLabelsQuery();
	 
	  if (error) {
		setError(error);
	  } else {
		setLabels(data);
	  }
  
	  setIsLoading(false);
	};
  
	/** Subscribe to real-time changes */
	useEffect(() => {
		fetchTasks();
	}, []);
	/**
	 * Form Validation Schema
	 */
	const schema = z.object({
		id: z.string().nonempty(),
		title: z
			.string()
			.nonempty('You must enter a label title')
			.refine(
				(title) => {
					// Check if title exists in labelListArray
					return !labels.some((label) => label.title === title);
				},
				{
					message: 'This label title already exists'
				}
			)
	});

	const { control, formState, reset, watch } = useForm<NotesLabel>({
		mode: 'onChange',
		defaultValues: label,
		resolver: zodResolver(schema)
	});

	const { errors, dirtyFields, isValid } = formState;
	const watchedLabelForm = watch();

	useEffect(() => {
		reset(label);
	}, [label, reset]);

	/**
	 * On Change Handler
	 */
	const handleOnChange = useDebounce((_label: NotesLabel) => {
		useUpdateNotesLabelMutation(_label);
	  }, 600);
	  
	  // Effect hook for handling updates
	  useEffect(() => {
		if (isValid && !_.isEmpty(dirtyFields) && !_.isEqual(label, watchedLabelForm)) {
		  handleOnChange(watchedLabelForm);
		}
	  }, [watchedLabelForm, label, handleOnChange, dirtyFields]);
	  
	  async function handleOnRemove() {
		try {
		  await useDeleteNotesLabelMutation(label.id);  // Ensure async operation
		} catch (err) {
		  console.error("Error deleting label:", err);
		  // Optionally, set error state here
		}
	  }
	  

	if (isLoading) return <FuseLoading />;
 
  	return (
		<ListItem
			className="p-0 mb-12"
			dense
		>
			<Controller
				name="title"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className={clsx('flex flex-1')}
						error={!!errors.title}
						helperText={errors?.title?.message}
						placeholder="Create new label"
						variant="outlined"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon
										color="action"
										size={16}
									>
										heroicons-outline:tag
									</FuseSvgIcon>
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										onClick={handleOnRemove}
										className="p-0"
										aria-label="Delete"
										size="small"
									>
										<FuseSvgIcon color="action">heroicons-outline:trash</FuseSvgIcon>
									</IconButton>
								</InputAdornment>
							)
						}}
					/>
				)}
			/>
		</ListItem>
	);
}

export default NewLabelForm;
