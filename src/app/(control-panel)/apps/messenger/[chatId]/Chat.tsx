"use client";

import { lighten, styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useContext, useEffect, useRef, useState } from "react";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Toolbar from "@mui/material/Toolbar";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Error404Page from "src/app/(public)/404/Error404Page";
import ChatMoreMenu from "./ChatMoreMenu";
import UserAvatar from "../components/UserAvatar";
import MessengerAppContext from "@/app/(control-panel)/apps/messenger/contexts/MessengerAppContext";
import { supabaseClient } from "@/utils/supabaseClient";
import { useSession } from "next-auth/react";
import { create } from "lodash";
import { Message } from "../MessengerApi";
import { margin } from "@mui/system";

const StyledMessageRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  paddingInline: 16,
  paddingBottom: 4,
  position: "relative",

  "&.me": {
    alignItems: "flex-end",
    paddingLeft: 36,
    "& .bubble": {
      backgroundColor: lighten(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.contrastText,
      borderRadius: "12px 4px 4px 12px",
      marginLeft: "auto",
    },
    "& .time": {
      marginTop: 4,
      paddingRight: 12,
      marginLeft: "auto",
      fontSize: 12,
      color: theme.palette.text.secondary,
    },
  },

  "&.contact": {
    alignItems: "flex-start",
    "& .bubble": {
      backgroundColor: lighten(theme.palette.secondary.main, 0.1),
      color: theme.palette.secondary.contrastText,
      borderRadius: "4px 12px 12px 4px",
    },
    "& .time": {
      marginTop: 4,
      paddingLeft: 12,
      fontSize: 12,
      color: theme.palette.text.secondary,
    },
  },

  "&.first-of-group": {
    marginTop: 20,
    "& .bubble": {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
  },

  "&.last-of-group": {
    "& .bubble": {
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      paddingBottom: 8,
    },
    "& .time": {
      display: "flex",
    },
  },

  "&.me.first-of-group .bubble": {
    borderTopRightRadius: 12,
  },
  "&.me.last-of-group .bubble": {
    borderBottomRightRadius: 12,
  },
  "&.contact.first-of-group .bubble": {
    borderTopLeftRadius: 12,
  },
  "&.contact.last-of-group .bubble": {
    borderBottomLeftRadius: 12,
  },

  "&.contact + .me, &.me + .contact": {
    paddingTop: 20,
    marginTop: 20,
  },
}));

type ChatProps = {
  className?: string;
};

function Chat(props: ChatProps) {
  const { className } = props;
  const { setMainSidebarOpen, setContactSidebarOpen } =
    useContext(MessengerAppContext);
  const chatRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [chatList, setChatList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  const { data } = useSession();
  const userId = data?.db?.id || "unknown-user-id";

  const routeParams = useParams<{ chatId: string }>();
  const { chatId } = routeParams;

  useEffect(() => {
    async function fetchChats() {
      const { data, error } = await supabaseClient
        .from("messenger_chat")
        .select("*");
      if (error) console.error("Error fetching chats:", error);
      else setChatList(data);
    }
    fetchChats();
  }, []);

  async function fetchMessages() {
    if (!chatId) return;
    const { data, error } = await supabaseClient
      .from("messenger_message")
      .select("*")
      .eq("chatId", chatId);
    if (error) console.error("Error fetching messages:", error);
    else setMessages(data);
  }

  // Real-time subscription
  useEffect(() => {
	if (!chatId) return;
  
	const channel = supabaseClient
	  .channel("realtime:messages")
	  .on(
		"postgres_changes",
		{
		  event: "INSERT",
		  schema: "public",
		  table: "messenger_message",
		},
		(payload) => {
		  const newMsg = payload.new as Message;
  
		  if (newMsg.chatId === chatId) {
			setMessages((prev) => {
			  const ids = new Set(prev.map((m) => m.id));
			  return ids.has(newMsg.id) ? prev : [...prev, newMsg];
			});
			scrollToBottom();
		  }
		}
	  )
	  .subscribe();
  
	return () => {
	  supabaseClient.removeChannel(channel);
	};
  }, [chatId]);
  

  useEffect(() => {
    async function fetchSelectedContact() {
      if (!chatId || !userId || chatList.length === 0) return;

      const chat = chatList.find((chat) => chat.id === chatId);
      const contactId = chat?.contactIds?.length === 2
        ? chat.contactIds.find((id) => id !== userId)
        : undefined;

      console.log("contactId", contactId);

      if (!contactId) {
        console.warn("No valid contactId found for chatId:", chatId);
        return;
      }

      const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", contactId)
        .single();

      if (error) console.error("Error fetching contact:", error);
      else setSelectedContact(data);
    }

    fetchMessages();
    fetchSelectedContact();
  }, [chatId, userId, chatList]);


  const scrollToBottom = () => {
    if (!chatRef.current) return;
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  };
  useEffect(() => {
	scrollToBottom();
  }, [messages]);
  
  const isFirstMessageOfGroup = (item: any, i: number) => {
    return (
      i === 0 ||
      (messages[i - 1] && messages[i - 1].contactId !== item.contactId)
    );
  };

  const isLastMessageOfGroup = (item: any, i: number) => {
    return (
      i === messages.length - 1 ||
      (messages[i + 1] && messages[i + 1].contactId !== item.contactId)
    );
  };

  const onInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(ev.target.value);
  };

  const onMessageSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (message === "") return;

    const { error } = await supabaseClient.from("messenger_message").insert([
      {
        chatId: chatId,
        value: message,
        contactId: userId,
        createdAt: new Date().toISOString(),
      },
    ]);
    const { error: chatError } = await supabaseClient
      .from("messenger_chat")
      .update({ lastMessageAt: new Date().toISOString(), lastMessage: message })
      .eq("id", chatId);
    if (chatError) console.error("Error updating chat:", chatError);
    if (error) console.error("Error sending message:", error);
    fetchMessages();

    setMessage("");
  };

  if (!userId || !messages || !chatId) {
    return <Error404Page />;
  }
//   console.log(userId, messages, chatId, selectedContact);
  return (
    <>
      <Box
        className="w-full border-b-1"
        sx={(theme) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.02),
          ...theme.applyStyles("light", {
            backgroundColor: lighten(theme.palette.background.default, 0.4),
          }),
        })}
      >
        <Toolbar className="flex items-center justify-between px-16 w-full">
          <div className="flex items-center">
            {/* <IconButton
              aria-label="Open drawer"
              onClick={() => setMainSidebarOpen(true)}
              className="border border-divider flex lg:hidden"
            >
              <FuseSvgIcon>
                heroicons-outline:chat-bubble-left-right
              </FuseSvgIcon>
            </IconButton> */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                setContactSidebarOpen(selectedContact?.id);
              }}
              onKeyDown={() => setContactSidebarOpen(selectedContact?.id)}
              role="button"
              tabIndex={0}
            >
              <UserAvatar className="relative mx-8" user={selectedContact} />
              <Typography
                color="inherit"
                className="text-15 font-semibold px-4"
              >
                {selectedContact?.displayName || selectedContact?.email}
              </Typography>
            </div>
          </div>
          <ChatMoreMenu className="-mx-8" />
        </Toolbar>
      </Box>
      <div className="flex flex-auto h-full min-h-0 w-full">
        <div className={clsx("flex flex-1 z-10 flex-col relative", className)}>
          <div ref={chatRef} className="flex flex-1 flex-col overflow-y-auto">
            {messages?.length > 0 && (
              <div className="flex flex-col pt-16 px-16 pb-40">
                {messages.map((item, i) => (
                  <StyledMessageRow
                    key={i}
                    className={clsx(
                      item.contactId === userId ? "me" : "contact",
                      {
                        "first-of-group": isFirstMessageOfGroup(item, i),
                        "last-of-group": isLastMessageOfGroup(item, i),
                        "pb-72": i + 1 === messages.length,
                      }
                    )}
                  >
                    <div className="bubble flex items-center px-12 py-8 max-w-full">
                      <Typography className="whitespace-pre-wrap text-md">
                        {item.value}
                      </Typography>
                    </div>

                    <Typography className="time mt-1 text-xs">
                      {item.createdAt
                        ? formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })
                        : "Invalid date"}
                    </Typography>
                  </StyledMessageRow>
                ))}
              </div>
            )}
          </div>
          {messages && (
            <Paper
              square
              component="form"
              onSubmit={onMessageSubmit}
              className="absolute border-t-1 bottom-0 right-0 left-0 py-16 px-16"
              sx={(theme) => ({
                backgroundColor: lighten(
                  theme.palette.background.default,
                  0.02
                ),
                ...theme.applyStyles("light", {
                  backgroundColor: lighten(
                    theme.palette.background.default,
                    0.4
                  ),
                }),
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
                  value={message}
                  sx={{ backgroundColor: "background.paper" }}
                />
                <IconButton type="submit">
                  <FuseSvgIcon color="action">
                    heroicons-outline:paper-airplane
                  </FuseSvgIcon>
                </IconButton>
              </div>
            </Paper>
          )}
        </div>
      </div>
    </>
  );
}

export default Chat;
