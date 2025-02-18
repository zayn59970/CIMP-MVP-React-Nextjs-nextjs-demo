import { Controller, useForm } from 'react-hook-form';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, MouseEvent } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { darken } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ScrumboardList,
	useDeleteScrumboardBoardListMutation,
	useUpdateScrumboardBoardListMutation
} from '../../../ScrumboardApi';
import useUpdateScrumboardBoard from '../../../hooks/useUpdateScrumboardBoard';
import { supabaseClient } from "@/utils/supabaseClient";

type FormType = {
	title: ScrumboardList['title'];
};
/**
 * Form Validation Schema
 */
const schema = z.object({
	title: z.string().nonempty('You must enter a title')
});

type BoardListHeaderProps = {
	list: ScrumboardList;
	boardId: string;
	cardIds: string[];
	handleProps: DraggableProvidedDragHandleProps | null | undefined;
	className?: string;
};

/**
 * The board list header component.
 */
function BoardListHeader(props: BoardListHeaderProps) {
	const { list, cardIds, className, handleProps } = props;
  
	const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
	const [formOpen, setFormOpen] = useState(false);
  
	const [removeList] = useDeleteScrumboardBoardListMutation();
	const [updateList] = useUpdateScrumboardBoardListMutation();
  
	const { control, formState, handleSubmit, reset } = useForm<FormType>({
	  mode: 'onChange',
	  defaultValues: {
		title: list.title
	  },
	  resolver: zodResolver(schema)
	});
  
	const { isValid, dirtyFields } = formState;
  
	useEffect(() => {
	  if (!formOpen) {
		reset({
		  title: list.title
		});
	  }
	}, [formOpen, reset, list.title]);
  
	useEffect(() => {
	  if (formOpen && anchorEl) {
		setAnchorEl(null);
	  }
	}, [anchorEl, formOpen]);
  
	function handleMenuClick(event: MouseEvent<HTMLButtonElement>) {
	  setAnchorEl(event.currentTarget);
	}
  
	function handleMenuClose() {
	  setAnchorEl(null);
	}
  
	function handleOpenForm(ev: MouseEvent<HTMLAnchorElement | HTMLLIElement>) {
	  ev.stopPropagation();
	  setFormOpen(true);
	}
  
	function handleCloseForm() {
	  setFormOpen(false);
	}
  
	async function removeListAndUpdateBoard() {
	  try {
		// Remove the list
		await removeList(list.id).unwrap();
  
		// Fetch the current board to get the latest lists
		const { data: board, error: fetchError } = await supabaseClient
		  .from('scrumboard_board')
		  .select('lists')
		  .eq('id', props.boardId)
		  .single();
  
		if (fetchError) {
		  console.error('Error fetching board:', fetchError.message);
		  return;
		}
  
		// Update the board to remove the list
		const updatedLists = board?.lists.filter((l) => l.id !== list.id) || [];
		const { error: updateError } = await supabaseClient
		  .from('scrumboard_board')
		  .update({ lists: updatedLists })
		  .eq('id', props.boardId);
  
		if (updateError) {
		  console.error('Error updating board:', updateError.message);
		}
  
		handleMenuClose();
	  } catch (error) {
		console.error('Unexpected error:', error);
	  }
	}
  
	async function onSubmit(newData: FormType) {
	  try {
		await updateList({ ...list, title: newData.title });
		handleCloseForm();
	  } catch (error) {
		console.error('Error updating list:', error);
	  }
	}
  
	return (
	  <div {...handleProps}>
		<div className={clsx('flex items-center justify-between h-48 sm:h-56 px-12', className)}>
		  <div className="flex items-center min-w-0">
			{formOpen ? (
			  <ClickAwayListener onClickAway={handleCloseForm}>
				<form
				  className="flex w-full"
				  onSubmit={handleSubmit(onSubmit)}
				>
				  <Controller
					name="title"
					control={control}
					render={({ field }) => (
					  <TextField
						{...field}
						variant="outlined"
						margin="none"
						autoFocus
						size="small"
						InputProps={{
						  endAdornment: (
							<InputAdornment position="end">
							  <IconButton
								type="submit"
								disabled={_.isEmpty(dirtyFields) || !isValid}
								size="large"
							  >
								<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>
							  </IconButton>
							</InputAdornment>
						  )
						}}
					  />
					)}
				  />
				</form>
			  </ClickAwayListener>
			) : (
			  <Typography
				className="text-base font-medium cursor-pointer"
				onClick={handleOpenForm}
			  >
				{list.title}
			  </Typography>
			)}
		  </div>
		  <div className="flex items-center">
			<Box
			  className="flex items-center justify-center min-w-24 h-24 mx-4 text-sm font-semibold leading-24 rounded-full"
			  sx={{
				backgroundColor: (theme) =>
				  darken(theme.palette.background.default, theme.palette.mode === 'light' ? 0.1 : 0.3),
				color: 'text.secondary'
			  }}
			>
			  {cardIds.length}
			</Box>
			<IconButton
			  aria-haspopup="true"
			  onClick={handleMenuClick}
			  size="small"
			>
			  <FuseSvgIcon size={20}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
			</IconButton>
			<Menu
			  id="actions-menu"
			  anchorEl={anchorEl}
			  open={Boolean(anchorEl)}
			  onClose={handleMenuClose}
			>
			  <MenuItem onClick={removeListAndUpdateBoard}>
				<ListItemIcon className="min-w-36">
				  <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
				</ListItemIcon>
				<ListItemText primary="Remove List" />
			  </MenuItem>
			  <MenuItem onClick={handleOpenForm}>
				<ListItemIcon className="min-w-36">
				  <FuseSvgIcon>heroicons-outline:pencil</FuseSvgIcon>
				</ListItemIcon>
				<ListItemText primary="Rename List" />
			  </MenuItem>
			</Menu>
		  </div>
		</div>
	  </div>
	);
  }
  
  

export default BoardListHeader;
