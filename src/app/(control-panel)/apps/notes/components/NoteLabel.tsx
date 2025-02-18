import Chip from '@mui/material/Chip';
import clsx from 'clsx';
import Link from '@fuse/core/Link';
import { darken } from '@mui/material/styles';
import { MouseEvent, useEffect, useState } from 'react';
import _ from 'lodash';
import { NotesLabel, useGetNotesLabelsQuery } from '../NotesApi';

type NoteLabelProps = {
	id: string;
	linkable?: boolean;
	onDelete?: () => void;
	className?: string;
	classes?: {
		root?: string;
		label?: string;
		deleteIcon?: string;
	};
};

/**
 * The note label.
 */
function NoteLabel(props: NoteLabelProps) {
	const { id, linkable, onDelete, className, classes } = props;
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
	if (!labels) {
		return null;
	}

	const label = _.find(labels, { id });

	if (!label) {
		return null;
	}

	const linkProps = linkable
		? {
				element: Link,
				onClick: (ev: MouseEvent) => {
					ev.stopPropagation();
				},
				to: `/apps/notes/labels/${label.id}`
			}
		: {};

	return (
		<Chip
			{...linkProps}
			label={label.title}
			classes={{
				root: clsx('h-24 border-0', className),
				label: 'px-12 py-4 text-sm font-medium leading-none',
				deleteIcon: 'w-16',
				...classes
			}}
			sx={{
				color: 'text.secondary',
				backgroundColor: (theme) => darken(theme.palette.background.default, 0.03)
			}}
			variant="outlined"
			onDelete={onDelete}
		/>
	);
}

export default NoteLabel;
