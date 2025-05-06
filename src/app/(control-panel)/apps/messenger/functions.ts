import { supabaseClient } from '@/utils/supabaseClient';
import { useEffect, useState } from 'react';

export const getUserChats = async (userId: string) => {
  try {
    const { data, error } = await supabaseClient
      .from('messenger_chat')
      .select('*')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
export const getChatById = async (chatId: string) => {
  try {
    const { data, error } = await supabaseClient
      .from('messenger_chat')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
export const createChat = async (userA: string, userB: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('messenger_chat')
        .insert([{ user_a: userA, user_b: userB }])
        .select()
        .single();
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };
  export const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabaseClient
        .from('messenger_chat')
        .delete()
        .eq('id', chatId);
  
      if (error) throw error;
  
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  };
  export const getChatMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('messenger_message')
        .select('*')
        .eq('chatId', chatId)
        .order('createdat', { ascending: true });
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };
  export const sendMessage = async (
    chatId: string,
    contactId: string,
    value: string,
    image: string | null = null
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from('messenger_message')
        .insert([
          {
            chatId: chatId,
            contactId: contactId,
            value,
            image,
            createdAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };
  export const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };
  export const updateUserProfile = async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // hooks/useMessengerChats.ts

export type MessengerChat = {
  id: string;
  contactIds: string[];
  [key: string]: any;
};

export default function useMessengerChats() {
  const [chatList, setChatList] = useState<MessengerChat[]>([]);

  useEffect(() => {
    let channel: ReturnType<typeof supabaseClient.channel> | null = null;

    const fetchChats = async () => {
      const { data, error } = await supabaseClient
        .from('messenger_chat')
        .select('*');

      if (!error) {
        setChatList(data || []);
      } else {
        console.error('Error fetching chats:', error.message);
      }
    };

    fetchChats();

    channel = supabaseClient
      .channel('realtime:messenger_chat')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messenger_chat'
        },
        (payload) => {
          setChatList((prev) => {
            if (payload.eventType === 'INSERT') {
              const exists = prev.find((chat) => chat.id === (payload.new as MessengerChat).id);
              return exists ? prev : [...prev, payload.new as MessengerChat];
            }

            if (payload.eventType === 'UPDATE') {
              return prev.map((chat) =>
                chat.id === (payload.new as MessengerChat).id ? (payload.new as MessengerChat) : chat
              );
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabaseClient.removeChannel(channel);
    };
  }, []);

  return chatList;
}

export function isSameChat(chat: any, ids: string[]) {
  const chatIds = chat.contactIds;
  return (
    chatIds.length === ids.length &&
    ids.every((id) => chatIds.includes(id))
  );
}
