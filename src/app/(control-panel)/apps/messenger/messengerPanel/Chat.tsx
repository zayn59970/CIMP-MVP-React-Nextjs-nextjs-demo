'use client';

import { lighten, styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import InputBase from '@mui/material/InputBase';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAppSelector } from 'src/store/hooks';
import { selectSelectedChatId } from './messengerPanelSlice';
import { useSession } from 'next-auth/react';
import { supabaseClient } from '@/utils/supabaseClient';
import type { Message } from '../MessengerApi';

const StyledMessageRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingInline: 16,
  paddingBottom: 4,
  position: 'relative',
  '&.me': {
    alignItems: 'flex-end',
    paddingLeft: 36,
    '& .bubble': {
      backgroundColor: lighten(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.contrastText,
      borderRadius: '12px 4px 4px 12px',
      marginLeft: 'auto',
    },
    '& .time': {
      marginTop: 4,
      paddingRight: 12,
      marginLeft: 'auto',
      fontSize: 12,
      color: theme.palette.text.secondary,
    },
  },
  '&.contact': {
    alignItems: 'flex-start',
    '& .bubble': {
      backgroundColor: lighten(theme.palette.secondary.main, 0.1),
      color: theme.palette.secondary.contrastText,
      borderRadius: '4px 12px 12px 4px',
    },
    '& .time': {
      marginTop: 4,
      paddingLeft: 12,
      fontSize: 12,
      color: theme.palette.text.secondary,
    },
  },
  '&.first-of-group .bubble': {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  '&.last-of-group .bubble': {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingBottom: 8,
  },
  '&.me.first-of-group .bubble': {
    borderTopRightRadius: 12,
  },
  '&.me.last-of-group .bubble': {
    borderBottomRightRadius: 12,
  },
  '&.contact.first-of-group .bubble': {
    borderTopLeftRadius: 12,
  },
  '&.contact.last-of-group .bubble': {
    borderBottomLeftRadius: 12,
  },
  '&.contact + .me, &.me + .contact': {
    paddingTop: 20,
    marginTop: 20,
  },
}));

type ChatProps = {
  className?: string;
};

function Chat({ className }: ChatProps) {
  const selectedChatId = useAppSelector(selectSelectedChatId);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const userId = data?.db?.id || 'unknown-user-id';

  const scrollToBottom = () => {
    if (!chatRef.current) return;
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabaseClient.channel> | null = null;

    const fetchChatAndMessages = async () => {
      if (!selectedChatId) return;

      const { data: chatData, error: chatError } = await supabaseClient
        .from('messenger_chat')
        .select('*')
        .eq('id', selectedChatId)
        .single();

      if (chatError) {
        console.error('Error fetching chat:', chatError);
      } else {
        setChat(chatData);
      }

      const { data: messagesData, error: msgError } = await supabaseClient
        .from('messenger_message')
        .select('*')
        .eq('chatId', selectedChatId);

      if (msgError) {
        console.error('Error fetching messages:', msgError);
      } else {
        setChatMessages(messagesData ?? []);
      }
    };

    fetchChatAndMessages();

    channel = supabaseClient
      .channel('realtime:messages')
      .on<Message>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messenger_message',
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.chatId === selectedChatId) {
            setChatMessages((prev) => {
              const ids = new Set(prev.map((m) => m.id));
              return ids.has(newMsg.id) ? prev : [...prev, newMsg];
            });
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [selectedChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const onInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setMessageText(ev.target.value);
  };

  const onMessageSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!messageText || !selectedChatId) return;

    const { error } = await supabaseClient.from('messenger_message').insert([
      {
        chatId: selectedChatId,
        value: messageText,
        contactId: userId,
        createdAt: new Date().toISOString(),
      },
    ]);

    const { error: chatUpdateError } = await supabaseClient
      .from('messenger_chat')
      .update({
        lastMessage: messageText,
        lastMessageAt: new Date().toISOString(),
      })
      .eq('id', selectedChatId);

    if (error) console.error('Error sending message:', error);
    if (chatUpdateError) console.error('Error updating chat:', chatUpdateError);

    setMessageText('');
  };

  const isFirstMessageOfGroup = (item: Message, i: number) =>
    i === 0 || chatMessages[i - 1]?.contactId !== item.contactId;

  const isLastMessageOfGroup = (item: Message, i: number) =>
    i === chatMessages.length - 1 || chatMessages[i + 1]?.contactId !== item.contactId;

  return (
    <Paper
      className={clsx('flex flex-col relative shadow', className)}
      sx={(theme) => ({
        background: theme.palette.background.default,
      })}
    >
      <div ref={chatRef} className="flex flex-1 flex-col overflow-y-auto overscroll-contain">
        <div className="flex flex-col pt-16 px-16 pb-40">
          {chatMessages.map((item, i) => (
            <StyledMessageRow
              key={item.id}
              className={clsx(
                item.contactId === userId ? 'me' : 'contact',
                {
                  'first-of-group': isFirstMessageOfGroup(item, i),
                  'last-of-group': isLastMessageOfGroup(item, i),
                  'pb-72': i + 1 === chatMessages.length,
                }
              )}
            >
              <div className="bubble flex items-center px-12 py-8 max-w-full">
                <Typography className="whitespace-pre-wrap text-md">
                  {item.value}
                </Typography>
              </div>
              <Typography className="time mt-1 text-xs">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </Typography>
            </StyledMessageRow>
          ))}

          {chatMessages.length === 0 && (
            <div className="flex flex-col flex-1">
              <div className="flex flex-col flex-1 items-center justify-center">
                <FuseSvgIcon size={128} color="disabled">
                  heroicons-outline:chat-bubble-left-right
                </FuseSvgIcon>
              </div>
              <Typography className="px-16 pb-24 text-center" color="text.secondary">
                Start a conversation by typing your message below.
              </Typography>
            </div>
          )}
        </div>
      </div>

      {chat && (
        <Paper
          square
          component="form"
          onSubmit={onMessageSubmit}
          className="absolute border-t-1 bottom-0 right-0 left-0 py-16 px-16"
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.background.default, 0.02),
          })}
        >
          <div className="flex items-center relative">
            {/* <IconButton type="submit">
              <FuseSvgIcon className="text-3xl" color="action">
                heroicons-outline:face-smile
              </FuseSvgIcon>
            </IconButton>

            <IconButton type="submit">
              <FuseSvgIcon className="text-3xl" color="action">
                heroicons-outline:paper-clip
              </FuseSvgIcon>
            </IconButton> */}

            <InputBase
              autoFocus={false}
              id="message-input"
              className="flex-1 flex grow shrink-0 mx-8 border-2"
              placeholder="Type your message"
              onChange={onInputChange}
              value={messageText}
              sx={{ backgroundColor: 'background.paper' }}
            />

            <IconButton type="submit">
              <FuseSvgIcon color="action">
                heroicons-outline:paper-airplane
              </FuseSvgIcon>
            </IconButton>
          </div>
        </Paper>
      )}
    </Paper>
  );
}

export default Chat;
