import Dialog from '@mui/material/Dialog';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import NewLabelForm from './NewLabelForm';
import LabelItemForm from './LabelItemForm';
import { closeLabelsDialog, selectLabelsDialogOpen } from '../../notesAppSlice';
import { useGetNotesLabelsQuery } from '../../NotesApi';
import { useEffect, useState } from 'react';

/**
 * The labels dialog.
 */
function LabelsDialog() {
	const dispatch = useAppDispatch();
	const labelsDialogOpen = useAppSelector(selectLabelsDialogOpen);
	// const { data: labels } = useGetNotesLabelsQuery();

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
	return (
		<Dialog
			classes={{
				paper: 'w-full max-w-320 p-16 md:p-24 m-24'
			}}
			onClose={() => dispatch(closeLabelsDialog())}
			open={Boolean(labelsDialogOpen)}
		>
			<Typography className="text-2xl mb-16 font-semibold">Edit Labels</Typography>

			<List dense>
				<NewLabelForm />

				{labels?.map((item) => (
					<LabelItemForm
						label={item}
						key={item.id}
					/>
				))}
			</List>
		</Dialog>
	);
}

export default LabelsDialog;
