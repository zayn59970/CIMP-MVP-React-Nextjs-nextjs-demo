'use client';

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'src/store/hooks';
import { styled } from '@mui/material/styles';
import BoardAddList from './board-list/BoardAddList';
import BoardList from './board-list/BoardList';
import BoardCardDialog from './dialogs/card/BoardCardDialog';
import BoardHeader from './BoardHeader';
import {
	useUpdateScrumboardBoardListOrderMutation,
	useUpdateScrumboardBoardCardOrderMutation
} from '../../ScrumboardApi';
import useGetScrumboardBoard from '../../hooks/useGetScrumboardBoard';
import { supabaseClient } from "@/utils/supabaseClient";
import React from 'react';
import { useParams } from 'next/navigation';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .container': {
		maxWidth: '100%!important'
	},
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	}
}));

/**
 * The board component.
 */
function Board() {
	const dispatch = useAppDispatch();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	
	  // Get board members from board.members
	  const [board, setBoard] = React.useState<any>(null); // To store board data
	  const { boardId } = useParams(); // Get the boardId from route params
	 console.log('boardId', boardId);
	  // Fetch board details from Supabase
	  React.useEffect(() => {
		const fetchBoard = async () => {
		  try {
			const { data, error } = await supabaseClient
			  .from("scrumboard_board") // Replace "scrumboard" with your actual table name
			  .select("*")
			  .eq("id", boardId)
			  .single();
	
			if (error) {
			  console.error("Error fetching board:", error.message);
			  return;
			}
	
			setBoard(data);
		  } catch (err) {
			console.error("Unexpected error fetching board:", err);
		  }
		};
	
		if (boardId) {
		  fetchBoard();
		}
	  }, [boardId]);
console.log('boardsssssssssssssssss', board);

	const [reorderList] = useUpdateScrumboardBoardListOrderMutation();
	const [reorderCard] = useUpdateScrumboardBoardCardOrderMutation();

	function onDragEnd(result: DropResult) {
		const { source, destination } = result;

		// dropped nowhere
		if (!destination) {
			return;
		}

		// did not move anywhere - can bail early
		if (source.droppableId === destination.droppableId && source.index === destination.index) {
			return;
		}

		// reordering list
		if (result.type === 'list') {
			reorderList({
				orderResult: result,
				board
			})
				.unwrap()
				.then(() => {
					dispatch(
						showMessage({
							message: 'List Order Saved',
							autoHideDuration: 2000,
							anchorOrigin: {
								vertical: 'top',
								horizontal: 'right'
							}
						})
					);
				});
		}

		// reordering card
		if (result.type === 'card') {
			reorderCard({
				orderResult: result,
				board
			})
				.unwrap()
				.then(() => {
					dispatch(
						showMessage({
							message: 'Card Order Saved',
							autoHideDuration: 2000,
							anchorOrigin: {
								vertical: 'top',
								horizontal: 'right'
							}
						})
					);
				});
		}
	}

	if (!board) {
		return null;
	}

	return (
		<>
			<Root
				header={<BoardHeader />}
				content={
					board?.lists ? (
						<div className="flex flex-1 overflow-x-auto overflow-y-hidden h-full">
							<DragDropContext onDragEnd={onDragEnd}>
								<Droppable
									droppableId="list"
									type="list"
									direction="horizontal"
								>
									{(provided) => (
										<div
											ref={provided.innerRef}
											className="flex py-16 md:py-24 px-8 md:px-12"
										>
											{board?.lists.map((list, index) => (
												<BoardList
													boardId={board.id}
													key={list.id}
													listId={list.id}
													cardIds={list.cards}
													index={index}
												/>
											))}

											{provided.placeholder}

											<BoardAddList />
										</div>
									)}
								</Droppable>
							</DragDropContext>
						</div>
					) : null
				}
				scroll={isMobile ? 'normal' : 'content'}
			/>
			<BoardCardDialog />
		</>
	);
}

export default Board;
