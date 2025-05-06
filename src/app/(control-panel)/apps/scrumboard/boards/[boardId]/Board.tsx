"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import FusePageSimple from "@fuse/core/FusePageSimple";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "src/store/hooks";
import { styled } from "@mui/material/styles";
import BoardAddList from "./board-list/BoardAddList";
import BoardList from "./board-list/BoardList";
import BoardCardDialog from "./dialogs/card/BoardCardDialog";
import BoardHeader from "./BoardHeader";
import {
  useUpdateScrumboardBoardListOrderMutation,
  useUpdateScrumboardBoardCardOrderMutation,
} from "../../ScrumboardApi";
import useGetScrumboardBoard from "../../hooks/useGetScrumboardBoard";
import { supabaseClient } from "@/utils/supabaseClient";
import React, { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .container": {
    maxWidth: "100%!important",
  },
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

/**
 * The board component.
 */
function Board() {
  const dispatch = useAppDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const { data } = useSession();

  const userRole = data?.db?.role?.[0] || "unknown-user";
  const userId = data?.db?.id || "unknown-user-id";
  const isAdmin = userRole === "admin";

  const [refreshKey, setRefreshKey] = useState(0);
  const contentScrollEl = useRef<HTMLDivElement>(null);

  const handleCardAdded = () => {
    // Increment refresh key to re-trigger fetch or re-render
    setRefreshKey((prev) => prev + 1);
    if (contentScrollEl.current) {
      contentScrollEl.current.scrollTop = contentScrollEl.current.scrollHeight;
    }
    console.log("refreshKey", refreshKey);
  };
  // Get board members from board.members
  const [board, setBoard] = React.useState<any>(null); // To store board data
  const { boardId } = useParams(); // Get the boardId from route params
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
  }, [boardId, refreshKey]);

  
  async function onDragEnd(result: DropResult) {
	const { source, destination, type } = result;
  
	if (!destination || !board) return;
  
	// No movement
	if (
	  source.droppableId === destination.droppableId &&
	  source.index === destination.index
	) {
	  return;
	}
  
	const newLists = [...board.lists];
  
	// Reorder entire lists
	if (type === "list") {
	  const [movedList] = newLists.splice(source.index, 1);
	  newLists.splice(destination.index, 0, movedList);
	}
  
	// Reorder cards within or across lists
	if (type === "card") {
	  const sourceListIndex = newLists.findIndex((l) => l.id === source.droppableId);
	  const destListIndex = newLists.findIndex((l) => l.id === destination.droppableId);
  
	  if (sourceListIndex === -1 || destListIndex === -1) return;
  
	  const sourceCards = [...(newLists[sourceListIndex].cards || [])];
	  const destCards = [...(newLists[destListIndex].cards || [])];
  
	  const [movedCard] = sourceCards.splice(source.index, 1);
  
	  if (source.droppableId === destination.droppableId) {
		sourceCards.splice(destination.index, 0, movedCard);
		newLists[sourceListIndex].cards = sourceCards;
	  } else {
		destCards.splice(destination.index, 0, movedCard);
		newLists[sourceListIndex].cards = sourceCards;
		newLists[destListIndex].cards = destCards;
	  }
	}
  
	// Persist updated list structure to Supabase
	const { error } = await supabaseClient
	  .from("scrumboard_board")
	  .update({ lists: newLists })
	  .eq("id", board.id);
  
	if (error) {
	  console.error("Error updating board order:", error.message);
	  return;
	}
  
	dispatch(
	  showMessage({
		message: `${type === "list" ? "List" : "Card"} Order Saved`,
		autoHideDuration: 2000,
		anchorOrigin: {
		  vertical: "top",
		  horizontal: "right",
		},
	  })
	);
  
	setRefreshKey((prev) => prev + 1); // refresh UI
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
            <div
              className="flex flex-1 overflow-x-auto overflow-y-hidden h-full"
              ref={contentScrollEl}
            >
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
                          handleCardAdded={handleCardAdded}
                          refreshKey={refreshKey}
                          contentScrollEl={contentScrollEl}
                        />
                      ))}

                      {provided.placeholder}

                      {isAdmin && <BoardAddList refreshKey={handleCardAdded} />}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ) : null
        }
        scroll={isMobile ? "normal" : "content"}
      />
      <BoardCardDialog refreshKey={handleCardAdded} />
    </>
  );
}

export default Board;
