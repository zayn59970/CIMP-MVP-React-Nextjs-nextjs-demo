import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import { supabaseClient } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface NewBoardItemProps {
  onBoardAdded: () => Promise<void>;
}

/**
 * The new board item component.
 */
const NewBoardItem: React.FC<NewBoardItemProps> = ({ onBoardAdded }) => {
//   async function handleNewBoard(): Promise<void> {
//     const newBoard = {
//       title: '',
//       description: '',
//       icon: '',
//       lastActivity: new Date().toISOString(),
//       members: [],
//       settings: {
//         subscribed: false,
//         cardCoverImages: false,
//       },
//       lists: [],
//     };

//     try {
//       const { error } = await supabaseClient
//         .from('scrumboard_board')
//         .insert([newBoard]);

//       if (error) {
//         console.error('Error creating board:', error);
//         return;
//       }

//       if (onBoardAdded) {
//         await onBoardAdded(); // Notify parent to refresh the list
//       }
//     } catch (err) {
//       console.error('Unexpected error:', err);
//     }
//   }
async function handleNewBoard(): Promise<void> {
	const newBoard = {
	  id: uuidv4(), // Generate a unique ID for the board
	  title: 'Untitled Board',
	  description: 'description of the board',
	  icon: 'heroicons-outline:rectangle-group',
	  lastActivity: new Date().toISOString(),
	  members: [],
	  settings: {
		subscribed: false,
		cardCoverImages: false,
	  },
	  lists: [],
	};
  
	try {
	  const { error } = await supabaseClient
		.from('scrumboard_board')
		.insert([newBoard]);
  
	  if (error) {
		console.error('Error creating board:', error);
		return;
	  }
  
	  if (onBoardAdded) {
		await onBoardAdded(); // Notify parent to refresh the list
	  }
	} catch (err) {
	  console.error('Unexpected error:', err);
	}
  }

  return (
    <Box
      sx={{
        borderColor: 'divider',
      }}
      className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer border-2 border-gray-300 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
      onClick={handleNewBoard}
      role="button"
      tabIndex={0}
    >
      <FuseSvgIcon size={48} color="disabled">
        heroicons-outline:plus
      </FuseSvgIcon>
    </Box>
  );
};

export default NewBoardItem;
