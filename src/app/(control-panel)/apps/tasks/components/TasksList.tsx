import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DropResult,
} from "@hello-pangea/dnd";
import FuseLoading from "@fuse/core/FuseLoading";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import TaskListItem from "./TaskListItem";
import SectionListItem from "./SectionListItem";
import { Task } from "../TasksApi";
import useReorderTasks from "../hooks/useReorderTasks";
import { supabaseClient } from "@/utils/supabaseClient";
import { useSession } from "next-auth/react";

function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const reorderList = useReorderTasks();
  const { data } = useSession();

  const userRole = data?.db?.role?.[0] || "unknown-user";
  const userId = data?.db?.id || "unknown-user-id";
  const isAdmin = userRole === "admin";
  const { reorderTasks } = useReorderTasks();

  const orderedTasks = useMemo(() => {
    return _.merge([], tasks).sort((a: Task, b: Task) => a.order - b.order);
  }, [tasks]);

  /** Fetch tasks from Supabase */
  const fetchTasks = async () => {
    setIsLoading(true);

    const query = supabaseClient.from("task").select("*");

    if (!isAdmin) {
      query.eq("assignedTo", userId);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setTasks(data);
    }

    setIsLoading(false);
  };

  /** Subscribe to real-time changes */
  useEffect(() => {
    fetchTasks();

    // Create a real-time channel
    const channel = supabaseClient
      .channel("tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task" },
        (payload) => {
          console.log("Task Change Detected:", payload);

          setTasks((prevTasks: Task[]) => {
            if (payload.eventType === "INSERT") {
              return [...prevTasks, payload.new as Task];
            }
            if (payload.eventType === "UPDATE") {
              return prevTasks.map((task) =>
                task.id === (payload.new as Task).id
                  ? (payload.new as Task)
                  : task
              );
            }
            if (payload.eventType === "DELETE") {
              return prevTasks.filter(
                (task) => task.id !== (payload.old as Task).id
              );
            }
            return prevTasks;
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <FuseLoading />;
  }

  if (!tasks || tasks.length === 0) {
    const noTaskMessage = isAdmin
      ? "There are no tasks in the system."
      : "You have no assigned tasks.";

    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          {noTaskMessage}
        </Typography>
      </div>
    );
  }

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const { index: destinationIndex } = destination;
    const { index: sourceIndex } = source;

    if (destinationIndex === sourceIndex) {
      return;
    }

    reorderTasks({ startIndex: sourceIndex, endIndex: destinationIndex });
  }

  return (
    <List className="w-full m-0 p-0 border-x-1">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list" type="list" direction="vertical">
          {(provided: DroppableProvided) => (
            <>
              <div ref={provided.innerRef}>
                {orderedTasks.map((item) => {
                  if (item.type === "task") {
                    return <TaskListItem key={item.id} data={item} />;
                  }
                  if (item.type === "section") {
                    return <SectionListItem key={item.id} data={item} />;
                  }
                  return null;
                })}
              </div>
              {provided.placeholder}
            </>
          )}
        </Droppable>
      </DragDropContext>
    </List>
  );
}

export default TasksList;
