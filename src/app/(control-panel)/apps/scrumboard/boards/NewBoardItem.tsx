'use client';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import { useState } from 'react';
import BoardAddForm from './[boardId]/dialogs/card/BoardAddForm';

interface NewBoardItemProps {
  onBoardAdded: () => Promise<void>;
}

/**
 * The new board item component.
 */
const NewBoardItem: React.FC<NewBoardItemProps> = ({ onBoardAdded }) => {
  const [open, setOpen] = useState(false);

  const handleNewBoard = () => {
    setOpen(true);
  };

  const handleCloseBoard = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{ borderColor: 'divider' }}
        className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer border-2 border-gray-300 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
        onClick={handleNewBoard}
        role="button"
        tabIndex={0}
      >
        <FuseSvgIcon size={48} color="disabled">
          heroicons-outline:plus
        </FuseSvgIcon>
      </Box>

      <BoardAddForm
        open={open}
        onClose={handleCloseBoard}
        onBoardAdded={onBoardAdded}
      />
    </>
  );
};

export default NewBoardItem;
