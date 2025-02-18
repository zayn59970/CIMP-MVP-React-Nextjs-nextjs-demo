import _ from 'lodash';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import { useState, MouseEvent, useEffect } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ListItemButton from '@mui/material/ListItemButton';
import { NotesLabel, NotesNote, useGetNotesLabelsQuery } from '../../NotesApi';

type NoteFormLabelMenuProps = {
	note: NotesNote;
	onChange: (T: NotesNote['labels']) => void;
	ref?: React.Ref<HTMLDivElement>;
};

function NoteFormLabelMenu(props: NoteFormLabelMenuProps) {
	const { note, onChange, ref } = props;

	// const { data: labels } = useGetNotesLabelsQuery();
	const [labels, setLabels] = useState<NotesLabel[]>([]);
	  const [isLoading, setIsLoading] = useState(true);
	  const [error, setError] = useState<string | null>(null);
	
	  const fetchTasks = async () => {
		setIsLoading(true);
		const { data } = await useGetNotesLabelsQuery();
	
		if (data) {
		  setLabels(data);
		} else if (error) {
		  setError(error);
		}
	
		setIsLoading(false);
	  };
	
	  /** Subscribe to real-time changes */
	  useEffect(() => {
		fetchTasks();
	  }, []);

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	function handleMenuClick(event: MouseEvent<HTMLElement>) {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	}

	function handleMenuClose() {
		setAnchorEl(null);
	}

	function handleToggleLabel(id: string) {
		onChange(_.xor(note.labels, [id]));
	}

	return (
		<div ref={ref}>
			<IconButton
				className=""
				onClick={handleMenuClick}
				size="small"
				component="div"
			>
				<FuseSvgIcon size={20}>heroicons-outline:tag</FuseSvgIcon>
			</IconButton>
			<Popover
				hideBackdrop
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={handleMenuClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				className="pointer-events-none"
				classes={{
					paper: 'pointer-events-auto py-8 prevent-add-close'
				}}
			>
				<ClickAwayListener onClickAway={handleMenuClose}>
					<List className="p-0">
						{labels.map((label) => (
							<ListItemButton
								key={label.id}
								dense
								onClick={() => handleToggleLabel(label.id)}
							>
								<FuseSvgIcon
									className="list-item-icon"
									size={20}
									color="action"
								>
									{note.labels.includes(label.id)
										? 'heroicons-outline:check-circle'
										: 'heroicons-outline:minus-circle'}
								</FuseSvgIcon>
								<ListItemText
									className="truncate px-8"
									primary={label.title}
									disableTypography
								/>
							</ListItemButton>
						))}
					</List>
				</ClickAwayListener>
			</Popover>
		</div>
	);
}

export default NoteFormLabelMenu;
