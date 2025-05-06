import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import useNavigate from "@fuse/hooks/useNavigate";
import UserAvatar from "../../components/UserAvatar";
import { Contact } from "../../MessengerApi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabaseClient } from "@/utils/supabaseClient";
import { setSelectedChatId } from "../../messengerPanel/messengerPanelSlice";
import { useAppDispatch } from "@/store/hooks";
import useMessengerChats, { isSameChat } from "../../functions";

type ContactListItemProps = {
  item: Contact;
};

/**
 * The contact list item.
 */
function ContactListItem(props: ContactListItemProps) {
  const { item } = props;
  const { data } = useSession();
  const userId = data?.db?.id || "unknown-user-id";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Load user profile and chat list
  const chatList = useMessengerChats();

console.log("chatList from ContactListItem", chatList);
  async function handleClick() {
    if (!userId) return;

	const existingChat = chatList.find((chat) =>
		isSameChat(chat, [item.id, userId])
	  );
	  console.log("existingChat from list Item", existingChat);
    if (existingChat) {
      navigate(`/apps/messenger/${existingChat.id}`);
      dispatch(setSelectedChatId(existingChat.id));
    } else {
      const newChat = await createMessengerChat([item.id, userId]);
      if (newChat?.id) {
        navigate(`/apps/messenger/${newChat.id}`);
        dispatch(setSelectedChatId(newChat.id));
      }
    }
  }


  /**
   * Creates a new chat with given contact IDs.
   */
  async function createMessengerChat(contactIds: string[]) {
	const sortedIds = [...contactIds].sort();

    const { data, error } = await supabaseClient
      .from("messenger_chat")
	  .insert([{ contactIds: sortedIds }])
      .select()
      .single();

    if (error) {
      console.error("Failed to create chat:", error.message);
      return null;
    }

    return data;
  }

  return (
    <ListItemButton className="px-24 py-12 min-h-80" onClick={handleClick}>
      <UserAvatar user={item} />

      <ListItemText
        classes={{
          root: "min-w-px px-16",
          primary: "font-medium text-base",
          secondary: "truncate",
        }}
        primary={item.displayName || item.email}
      />
    </ListItemButton>
  );
}

export default ContactListItem;
