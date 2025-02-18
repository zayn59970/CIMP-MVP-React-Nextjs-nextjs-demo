'use client';

import _ from 'lodash';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { Draggable } from '@hello-pangea/dnd';
import { useAppDispatch } from 'src/store/hooks';
import { AvatarGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import React, { useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { openCardDialog } from '../../../scrumboardSlice';
import BoardCardLabel from './BoardCardLabel';
import BoardCardDueDate from './BoardCardDueDate';
import BoardCardCheckItems from './BoardCardCheckItems';
import { supabaseClient } from '@/utils/supabaseClient';

const StyledCard = styled(Card)(({ theme }) => ({
  '& ': {
    transitionProperty: 'box-shadow',
    transitionDuration: theme.transitions.duration.short,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
  },
}));

type BoardCardProps = {
  cardId: string;
  index: number;
  boardId: string;
};

/**
 * The board card component.
 */
function BoardCard(props: BoardCardProps) {
  const { cardId, index, boardId } = props;
  const dispatch = useAppDispatch();

  const [card, setCard] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch card and members data from Supabase
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);

//         const { data: cardData, error: cardError } = await supabaseClient
//           .from('scrumboard_card')
//           .select('*')
//           .eq('id', cardId)
//           .single();

//         if (cardError) {
//           console.error('Error fetching card:', cardError.message);
//           return;
//         }

//         const { data: membersData, error: membersError } = await supabaseClient
//           .from('scrumboard_member')
//           .select('*');
// 		  if (membersError) {
// 			  console.error('Error fetching members:', membersError.message);
// 			  return;
// 			}
			
// 			setCard(cardData);
// 			setMembers(membersData || []);
// 		} catch (err) {
// 			console.error('Unexpected error fetching data:', err);
// 		} finally {
// 			setIsLoading(false);
// 		}
//     };
	
//     fetchData();
// }, [cardId]);
useEffect(() => {
	const fetchData = async () => {
	  try {
		setIsLoading(true);
  
		console.log('Fetching card with cardId:', cardId);
  
		const { data: cardData, error: cardError } = await supabaseClient
		  .from('scrumboard_card')
		  .select('*')
		  .eq('id', cardId)
		  .maybeSingle(); // Allows for no row without throwing an error
  
		if (cardError) {
		  console.error('Error fetching card:', cardError.message);
		  return;
		}
  
		if (!cardData) {
		  console.warn('No card found with the provided cardId:', cardId);
		  return;
		}
  
		const { data: membersData, error: membersError } = await supabaseClient
		  .from('scrumboard_member')
		  .select('*');
  
		if (membersError) {
		  console.error('Error fetching members:', membersError.message);
		  return;
		}
  
		setCard(cardData);
		setMembers(membersData || []);
	  } catch (err) {
		console.error('Unexpected error fetching data:', err);
	  } finally {
		setIsLoading(false);
	  }
	};
  
	fetchData();
  }, [cardId]);
  
function handleCardClick(ev: React.MouseEvent<HTMLDivElement>, _card: any) {
    ev.preventDefault();
    dispatch(openCardDialog(_card));
  }
  
  if (isLoading) {
    return <FuseLoading />;
  }

  if (!card) {
    return null;
  }

  const cardCoverImage = _.find(card?.attachments, { id: card?.attachmentCoverId });
  
  console.log(card);
  return (
    <Draggable draggableId={cardId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <StyledCard
            className={clsx(
              snapshot.isDragging ? 'shadow-lg' : 'shadow',
              'w-full mb-12 rounded-lg cursor-pointer'
            )}
            onClick={(ev) => handleCardClick(ev, card)}
          >
            {cardCoverImage && (
              <img className="block" src={cardCoverImage.src} alt="card cover" />
            )}

            <div className="p-16 pb-0">
              {card.labels?.length > 0 && (
                <div className="flex flex-wrap mb-8 -mx-4">
                  {card.labels.map((id) => (
                    <BoardCardLabel boardId={boardId} id={id} key={id} />
                  ))}
                </div>
              )}

              <Typography className="font-medium mb-12">{card?.title}</Typography>

              {(card.dueDate || card.checklists?.length > 0) && (
                <div className="flex items-center mb-12 -mx-4">
                  <BoardCardDueDate dueDate={card?.dueDate} />
                  <BoardCardCheckItems card={card} />
                </div>
              )}
            </div>

            <div className="flex justify-between h-48 px-16">
              <div className="flex items-center space-x-6">
                {card?.subscribed && (
                  <FuseSvgIcon size={16} color="action">
                    heroicons-outline:eye
                  </FuseSvgIcon>
                )}
                {card.description !== '' && (
                  <FuseSvgIcon size={16} color="action">
                    heroicons-outline:document-text
                  </FuseSvgIcon>
                )}
                {card.attachments && (
                  <span className="flex items-center space-x-2">
                    <FuseSvgIcon size={16} color="action">
                      heroicons-outline:paper-clip
                    </FuseSvgIcon>
                    <Typography color="text.secondary">{card.attachments.length}</Typography>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end space-x-12">
                {card.memberIds?.length > 0 && (
                  <AvatarGroup max={3} classes={{ avatar: 'w-24 h-24 text-md' }}>
                    {card.memberIds.map((id) => {
                      const member = _.find(members, { id });
                      return (
                        <Tooltip title={member?.name} key={id}>
                          <Avatar key={id} alt="member" src={member?.avatar} />
                        </Tooltip>
                      );
                    })}
                  </AvatarGroup>
                )}
              </div>
            </div>
          </StyledCard>
        </div>
      )}
    </Draggable>
  );
}

export default BoardCard;
