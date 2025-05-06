import Dialog from '@mui/material/Dialog';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { closeCardDialog, selectCardDialogOpen } from '../../../../scrumboardSlice';
import BoardCardForm from './BoardCardForm';
import { useRef, useState } from 'react';

/**
 * The board card dialog component.
 */
function BoardCardDialog({refreshKey}: any) {
	const dispatch = useAppDispatch();
	const cardDialogOpen = useAppSelector(selectCardDialogOpen);
	

	return (
		<Dialog
			classes={{
				paper: 'max-w-lg w-full m-8 sm:m-24'
			}}
			onClose={() => dispatch(closeCardDialog())}
			open={cardDialogOpen}
		>
			<BoardCardForm refreshKey={refreshKey}/>
		</Dialog>
	);
}

export default BoardCardDialog;
