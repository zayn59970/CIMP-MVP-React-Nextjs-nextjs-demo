'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import IconButton from '@mui/material/IconButton';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { useDebounce, useDeepCompareEffect } from '@fuse/hooks';
import ListItemButton from '@mui/material/ListItemButton';
import useNavigate from '@fuse/hooks/useNavigate';
import { supabaseClient } from '@/utils/supabaseClient';
import { useParams } from 'next/navigation';

type BoardSettings = {
	cardCoverImages: boolean;
	subscribed: boolean;
};

type BoardSettingsFormProps = {
	onClose: () => void;
};

function BoardSettingsForm({ onClose }: BoardSettingsFormProps) {
	const navigate = useNavigate();
	const [board, setBoard] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const params = useParams();
	const boardId = params?.boardId as string;

	const { control, watch, reset } = useForm<BoardSettings>({
		mode: 'onChange',
		defaultValues: {
			cardCoverImages: false,
			subscribed: false
		}
	});

	const boardSettingsForm = watch();

	const fetchBoard = async () => {
		const { data, error } = await supabaseClient
			.from('scrumboard_board')
			.select('*')
			.eq('id', boardId)
			.single();

		if (error) {
			console.error('Failed to fetch board:', error.message);
		} else {
			setBoard(data);
			if (data?.settings) {
				reset(data.settings);
			}
		}

		setLoading(false);
	};

	const updateBoardSettings = useDebounce(async (updatedSettings: BoardSettings) => {
		if (!board) return;
		const { error } = await supabaseClient
			.from('scrumboard_board')
			.update({ settings: updatedSettings })
			.eq('id', board.id);

		if (error) {
			console.error('Failed to update board settings:', error.message);
		}
	}, 600);

	useDeepCompareEffect(() => {
		if (_.isEmpty(boardSettingsForm) || _.isEqual(boardSettingsForm, board?.settings)) return;
		updateBoardSettings(boardSettingsForm);
	}, [boardSettingsForm, board]);

	useEffect(() => {
		if (boardId) fetchBoard();
	}, [boardId]);

	const handleDeleteBoard = async () => {
		if (!board?.id) return;

		// First delete cards and lists
		const { error: cardsError } = await supabaseClient
			.from('scrumboard_card')
			.delete()
			.eq('boardid', board.id);

		const { error: listsError } = await supabaseClient
			.from('scrumboard_list')
			.delete()
			.eq('boardid', board.id);

		// Then delete the board itself
		const { error: boardError } = await supabaseClient
			.from('scrumboard_board')
			.delete()
			.eq('id', board.id);

		if (cardsError || listsError || boardError) {
			console.error('Failed to delete board:', cardsError || listsError || boardError);
			return;
		}

		navigate('/apps/scrumboard/boards');
	};

	if (loading || !board) return null;

	return (
		<div className="relative w-full">
			<IconButton
				className="absolute top-0 right-0 z-10"
				onClick={onClose}
				color="inherit"
				size="small"
			>
				<FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
			</IconButton>

			<List className="pt-32">
				<ListItem>
					<ListItemIcon className="min-w-36">
						<FuseSvgIcon>heroicons-outline:photo</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primary="Card Cover Images" />
					<ListItemSecondaryAction>
						<Controller
							name="cardCoverImages"
							control={control}
							render={({ field: { onChange, value } }) => (
								<Switch onChange={(ev) => onChange(ev.target.checked)} checked={!!value} />
							)}
						/>
					</ListItemSecondaryAction>
				</ListItem>

				<Controller
					name="subscribed"
					control={control}
					render={({ field: { onChange, value } }) => (
						<ListItem>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>
									{value ? 'heroicons-outline:eye' : 'heroicons-outline:eye-slash'}
								</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Subscribe" />
							<ListItemSecondaryAction>
								<Switch onChange={(ev) => onChange(ev.target.checked)} checked={!!value} />
							</ListItemSecondaryAction>
						</ListItem>
					)}
				/>

				<ListItemButton onClick={handleDeleteBoard}>
					<ListItemIcon className="min-w-36">
						<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primary="Delete Board" />
				</ListItemButton>
			</List>
		</div>
	);
}

export default BoardSettingsForm;
