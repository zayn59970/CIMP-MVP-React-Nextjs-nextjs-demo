import FuseUtils from "@fuse/utils";
import Input from "@mui/material/Input";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useContext, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Box from "@mui/material/Box";
import ContactListItem from "./ContactListItem";
import UserAvatar from "../../components/UserAvatar";
import MainSidebarMoreMenu from "./MainSidebarMoreMenu";
import ChatListItem from "./ChatListItem";
import MessengerAppContext from "@/app/(control-panel)/apps/messenger/contexts/MessengerAppContext";
import { useSession } from "next-auth/react";
import { supabaseClient } from "@/utils/supabaseClient";
type MessengerChat = {
  id: string;
  contactIds: string[];
  lastMessage?: string;
  updatedAt?: string;
  [key: string]: any;
};

function MainSidebar() {
  const { setUserSidebarOpen } = useContext(MessengerAppContext);
  const { data } = useSession();
  const userId = data?.db?.id || "unknown-user-id";

  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [chatList, setChatList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
// Add this inside the MainSidebar component
useEffect(() => {
  const channel = supabaseClient
    .channel("messenger_chat_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messenger_chat",
      },
      (payload) => {
        const newChat = payload.new as MessengerChat;
        const oldChat = payload.old as MessengerChat;

        setChatList((prev) => {
          switch (payload.eventType) {
            case "INSERT":
              if (newChat && !prev.some((c) => c.id === newChat.id)) {
                return [...prev, newChat];
              }
              return prev;

            case "UPDATE":
              if (newChat) {
                return prev.map((chat) => (chat.id === newChat.id ? newChat : chat));
              }
              return prev;

            case "DELETE":
              if (oldChat) {
                return prev.filter((chat) => chat.id !== oldChat.id);
              }
              return prev;

            default:
              return prev;
          }
        });
      }
    )
    .subscribe();

  return () => {
    supabaseClient.removeChannel(channel);
  };
}, []);



  useEffect(() => {
    async function fetchData() {
      const [{ data: userData, error: userError }, { data: users, error: usersError }, chats] = await Promise.all([
        supabaseClient.from("users").select("*").eq("id", userId).single(),
        supabaseClient.from("users").select("*").neq("id", userId),
        getMessengerChats(),
      ]);

      if (userError || usersError) {
        console.error("Error fetching data", userError || usersError);
        return;
      }

      setUser(userData);
      setContacts(users || []);
      setChatList(chats || []);
    }

    fetchData();
  }, [userId]);

  function handleSearchText(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  const filteredContacts = useMemo(() => {
    return searchText ? FuseUtils.filterArrayByString(contacts, searchText) : contacts;
  }, [contacts, searchText]);

  const filteredChatList = useMemo(() => {
    return chatList.filter(chat =>
      filteredContacts.some(contact => chat.contactIds.includes(contact.id))
    );
  }, [chatList, filteredContacts]);

  const container = {
    show: { transition: { staggerChildren: 0.02 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col flex-auto">
      <Box className="py-16 px-24 border-b-1 sticky top-0 z-10 bg-background">
        <div className="flex justify-between items-center mb-16">
          {user && (
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setUserSidebarOpen(true)}
              role="button"
              tabIndex={0}
            >
              <UserAvatar user={user} />
              <Typography className="mx-16 font-medium">{user.displayName}</Typography>
            </div>
          )}
          <MainSidebarMoreMenu className="-mx-16" />
        </div>
        <Paper className="flex p-4 items-center w-full rounded-lg h-36 shadow-none">
          <FuseSvgIcon color="action">heroicons-solid:magnifying-glass</FuseSvgIcon>
          <Input
            placeholder="Search or start new chat"
            className="flex flex-1"
            disableUnderline
            fullWidth
            value={searchText}
            onChange={handleSearchText}
          />
        </Paper>
      </Box>

      <div className="flex-auto">
        <List className="w-full">
          <motion.div className="flex flex-col" variants={container} initial="hidden" animate="show">
            {filteredChatList.length > 0 && (
              <motion.div variants={item}>
                <Typography className="font-medium text-2xl px-24 pt-16" color="secondary.main">
                  Chats
                </Typography>
              </motion.div>
            )}

            {filteredChatList.map((chat, index) => (
              <motion.div key={chat.id} variants={item}>
                <div className={clsx(index !== filteredChatList.length - 1 && "border-b-1")}>
		<ChatListItem item={chat} user={user} contacts={contacts} />
                </div>
              </motion.div>
            ))}

            {filteredContacts.length > 0 && (
              <motion.div variants={item}>
                <Typography className="font-medium text-2xl px-24 pt-16" color="secondary.main">
                  Contacts
                </Typography>
              </motion.div>
            )}
{filteredContacts.map((contact,index) => {
            const chatContact = chatList.find((_chat) =>
              _chat.contactIds.includes(contact.id)
            );

            return !chatContact ? (
              <motion.div key={contact.id} variants={item}>
                <div className={clsx(index !== filteredContacts.length - 1 && "border-b-1")}>
    <ContactListItem item={contact} />
                </div>
              </motion.div>
             ) : null;
            })}
          </motion.div>
        </List>
      </div>
    </div>
  );
}

async function getMessengerChats() {
  const { data, error } = await supabaseClient.from("messenger_chat").select("*");
  if (error) {
    console.error("Failed to fetch messenger chats:", error.message);
    return [];
  }
  return data;
}

export default MainSidebar;
