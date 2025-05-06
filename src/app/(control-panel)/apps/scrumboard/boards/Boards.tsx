"use client";

import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import FuseLoading from "@fuse/core/FuseLoading";
import PageBreadcrumb from "src/components/PageBreadcrumb";
import BoardItem from "./BoardItem";
import NewBoardItem from "./NewBoardItem";
import { supabaseClient } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Board {
  id: string;
  title: string;
  description: string;
  icon: string;
  lastActivity: string;
  members: string[];
  settings: {
    subscribed: boolean;
    cardCoverImages: boolean;
  };
  lists: { id: string; cards?: string[] }[];
}

function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data } = useSession();

  const userRole = data?.db?.role?.[0] || "unknown-user";
  const userId = data?.db?.id || "unknown-user-id";
  const isAdmin = userRole === "admin";

  const fetchBoards = async (): Promise<void> => {
    let query = supabaseClient.from("scrumboard_board").select("*");

    if (!isAdmin) {
      query = query.contains("members", [userId]);
    }

    const { data: result, error } = await query;

    if (error) {
      console.error("Error fetching boards:", error);
      return;
    }

    setBoards(result || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, [isAdmin, userId]);

  const handleBoardAdded = async (): Promise<void> => {
    setIsLoading(true);
    await fetchBoards();
    setIsLoading(false);
  };

  const container = {
    show: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) return <FuseLoading />;

  return (
    <div className="flex grow shrink-0 flex-col items-center container p-24 sm:p-40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
      >
        <div className="flex flex-col mt-16 md:mt-96">
          <PageBreadcrumb className="justify-center mb-8" />
          <Typography className="text-3xl md:text-6xl font-extrabold tracking-tight leading-7 sm:leading-10 text-center">
            Scrumboard Boards
          </Typography>
        </div>
      </motion.div>

      {boards.length === 0 ? (
        <Typography className="mt-40 text-center text-lg text-gray-500">
          {isAdmin
            ? "No boards found. Click the plus button to create one."
            : "You don't have access to any boards yet."}
        </Typography>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 mt-32 md:mt-64"
        >
          {boards.map((scrumboard) => (
            <motion.div
              variants={item}
              className="min-w-full sm:min-w-224 min-h-360"
              key={scrumboard.id}
            >
              <BoardItem board={scrumboard} />
            </motion.div>
          ))}

          {isAdmin && (
            <motion.div
              variants={item}
              className="min-w-full sm:min-w-224 min-h-360"
            >
              <NewBoardItem onBoardAdded={handleBoardAdded} />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default Boards;
