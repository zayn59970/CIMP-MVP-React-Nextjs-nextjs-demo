import Card from "@mui/material/Card";
import { lighten, styled } from "@mui/material/styles";
import CardContent from "@mui/material/CardContent";
import clsx from "clsx";
import React, { useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import _ from "lodash";
import BoardAddCard from "../board-card/BoardAddCard";
import BoardCard from "../board-card/BoardCard";
import BoardListHeader from "./BoardListHeader";
import { useGetScrumboardBoardListsQuery } from "../../../ScrumboardApi";
import { supabaseClient } from "@/utils/supabaseClient";
import { useSession } from "next-auth/react";

const StyledCard = styled(Card)(({ theme }) => ({
  "&": {
    transitionProperty: "box-shadow",
    transitionDuration: theme.transitions.duration.short,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
  },
}));

type BoardListProps = {
  boardId: string;
  listId: string;
  cardIds: string[];
  index: number;
  handleCardAdded: () => void;
  refreshKey: number;
  contentScrollEl: React.RefObject<HTMLDivElement>;
};

/**
 * The board list component.
 */
function BoardList(props: BoardListProps) {
  const {
    boardId,
    listId,
    cardIds,
    index,
    handleCardAdded,
    refreshKey,
    contentScrollEl,
  } = props;
  const { data } = useSession();

  const userRole = data?.db?.role?.[0] || "unknown-user";
  const userId = data?.db?.id || "unknown-user-id";
  const isAdmin = userRole === "admin";

  // State for list data and re-render trigger
  const [listItems, setListItems] = React.useState<any>(null);

  // Fetch list data on mount or when `listId` changes
  React.useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("scrumboard_list")
          .select("*")
          .eq("id", listId)
          .single();

        if (error) {
          console.error("Error fetching board:", error.message);
          return;
        }

        setListItems(data);
      } catch (err) {
        console.error("Unexpected error fetching board:", err);
      }
    };
    if (listId) {
      fetchBoard();
      console.log("refreshed happened");
    }
  }, [listId, refreshKey]);

  // Refresh handler

  if (!listItems) {
    return null;
  }

  return (
    <Draggable draggableId={listId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <StyledCard
            ref={contentScrollEl}
            sx={(theme) => ({
              backgroundColor: lighten(theme.palette.background.default, 0.02),
              ...theme.applyStyles("light", {
                backgroundColor: lighten(theme.palette.background.default, 0.4),
              }),
            })}
            className={clsx(
              snapshot.isDragging ? "shadow-lg" : "shadow-0",
              "w-256 sm:w-320 mx-8 max-h-full flex flex-col rounded-lg border"
            )}
            square
          >
            <BoardListHeader
              list={listItems}
              cardIds={cardIds}
              boardId={boardId}
              className="border-b-1"
              handleProps={provided.dragHandleProps}
              handleCardAdded={handleCardAdded}
            />

            <CardContent className="flex flex-col flex-auto h-full min-h-0 w-full p-0 overflow-auto">
              <Droppable droppableId={listId} direction="vertical" type="card">
                {(_provided) => (
                  <div
                    ref={_provided.innerRef}
                    className="flex flex-col w-full h-full p-12 min-h-1"
                  >
                    {cardIds.length === 0 ? (
                      <div className="text-center text-md text-gray-500 italic py-16">
                        No cards in this list yet.
                      </div>
                    ) : (
                      cardIds.map((cardId, index) => (
                        <BoardCard
                          key={cardId}
                          cardId={cardId}
                          boardId={boardId}
                          index={index}
                        />
                      ))
                    )}
                    {_provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>

            {isAdmin && (
              <div className="p-12">
                <BoardAddCard
                  boardId={boardId}
                  listId={listId}
                  onCardAdded={handleCardAdded}
                />
              </div>
            )}
          </StyledCard>
        </div>
      )}
    </Draggable>
  );
}

export default BoardList;
