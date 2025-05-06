'use client';

import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { motion } from 'framer-motion';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import clsx from 'clsx';
import { Box, CircularProgress } from '@mui/material';
import {
  selectSelectedChatId,
  setSelectedChatId,
  openChatPanel
} from './messengerPanelSlice';
import ContactButton from './ContactButton';
import { useSession } from 'next-auth/react';
import { supabaseClient } from '@/utils/supabaseClient';
import useNavigate from '@fuse/hooks/useNavigate';
import useMessengerChats, { isSameChat } from '../functions';

const Root = styled(FuseScrollbars)(({ theme }) => ({
  background: theme.palette.background.paper
}));

const container = {
  show: {
    transition: {
      staggerChildren: 0.025
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1 }
};

type ContactListProps = {
  className?: string;
};

function ContactList(props: ContactListProps) {
  const { className } = props;
  const dispatch = useAppDispatch();
  const selectedChatId = useAppSelector(selectSelectedChatId);
  const contactListScroll = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const userId = session?.db?.id || 'unknown-user-id';

  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chatList = useMessengerChats();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: users, error } = await supabaseClient
        .from('users')
        .select('*')
        .neq('id', userId);

      if (error) {
        console.error('Error fetching contacts:', error);
      } else {
        setContacts(users || []);
      }

      setLoading(false);
    }

    fetchData();
  }, [userId]);

  const chatListContacts = useMemo(() => {
    return chatList
      .map((chat) => {
        const contact = contacts.find((c) => chat.contactIds.includes(c.id));
        return contact ? { ...chat, ...contact } : null;
      })
      .filter(Boolean);
  }, [chatList, contacts]);

  const scrollToTop = () => {
    if (contactListScroll.current) {
      contactListScroll.current.scrollTop = 0;
    }
  };

  const handleContactClick = async (contactId: string) => {
    dispatch(openChatPanel());

    const existingChat = chatList.find((chat) =>
      isSameChat(chat, [contactId, userId])
    );

    if (existingChat) {
      navigate(`/apps/messenger/${existingChat.id}`);
      dispatch(setSelectedChatId(existingChat.id));
      scrollToTop();
    } else {
      const sortedIds = [contactId, userId].sort();
      const chat = await createMessengerChat(sortedIds);
      if (chat) {
        dispatch(setSelectedChatId(chat.id));
        navigate(`/apps/messenger/${chat.id}`);
        scrollToTop();
      }
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center py-12" sx={{ width: 70, minWidth: 70 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Root
      className={clsx('flex shrink-0 flex-col overflow-y-auto py-8 overscroll-contain', className)}
      ref={contactListScroll}
      option={{ suppressScrollX: true, wheelPropagation: false }}
    >
      {contacts.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col shrink-0"
        >
          {/* Chats that already exist */}
          {chatListContacts.map((contact) => (
            <motion.div variants={item} key={contact.id}>
              <ContactButton
                contact={contact}
                selectedChatId={selectedChatId}
                onClick={() => handleContactClick(contact.id)}
              />
            </motion.div>
          ))}

          <Divider className="mx-24 my-8" />

          {/* Contacts without existing chats */}
          {contacts.map((contact) => {
            const exists = chatList.some((chat) => chat.contactIds.includes(contact.id));
            if (exists) return null;

            return (
              <motion.div variants={item} key={contact.id}>
                <ContactButton
                  contact={contact}
                  selectedChatId={selectedChatId}
                  onClick={() => handleContactClick(contact.id)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </Root>
  );
}

// Supabase create chat function
async function createMessengerChat(contactIds: string[]) {
  const { data, error } = await supabaseClient
    .from('messenger_chat')
    .insert([{ contactIds }])
    .select()
    .single();

  if (error) {
    console.error('Failed to create chat:', error.message);
    return null;
  }

  return data;
}

export default ContactList;
