import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Grid, Toolbar } from "@mui/material";
import { useHistory } from "react-router";
import { format } from "date-fns";
import chatBgImage from "../../images/chat-bg .jpg";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MessagesList from "../MessagesList/MessagesList";
import SendForm from "../SendForm/SendForm";
import { IUser, IMessage } from "../../interfaces";

const drawerWidth = { xs: 320, sm: 360 };

const Chat = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const history = useHistory();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = io(
      `http://localhost:8080?token=${sessionStorage.getItem("token")}`
    );

    setSocket(socket);
  }, []);

  useEffect(() => {
    if (!messagesContainerRef.current) {
      return;
    }

    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    socket?.on("connection", (user: IUser) => {
      console.log(user);

      setCurrentUser(user);
    });

    socket?.on("message", (message: IMessage) => {
      if (!message.body) {
        return;
      }

      setMessages((state) => [...state, message]);
    });

    socket?.on("messages", (messages: IMessage[]) => {
      setMessages(messages);
    });

    socket?.on("allUsers", (users: IUser[]) => {
      setAllUsers(users);
    });

    socket?.on("onlineUsers", (users: IUser[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket?.disconnect();
      socket?.off("connection");
      socket?.off("message");
      socket?.off("messages");
      socket?.off("onlineUsers");
      socket?.off("allUsers");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("ban", (user: IUser) => {
      const shouldDisconnect = user.isBanned && currentUser?._id === user._id;

      if (shouldDisconnect) {
        sessionStorage.removeItem("token");
        socket?.disconnect();
        history.push("/");
      }
    });

    socket?.on("mute", (user: IUser) => {
      // console.log(user);
      // setCurrentUser(user);
      const shouldMute = currentUser?._id === user._id;

      if (shouldMute) {
        const newUser = { ...currentUser, isMuted: user.isMuted };

        setCurrentUser(newUser);
      }
    });

    socket?.on("disconnect", handleLogout);

    return () => {
      socket?.off("ban");
      socket?.off("mute");
      socket?.off("disconnect");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, history, socket]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");

    history.push("/");
  };

  const handleSendMessage = (text: string): boolean => {
    if (!socket) {
      return false;
    }

    const time = format(new Date(), "p");

    const message = {
      userId: currentUser?._id,
      sender: currentUser?.name,
      body: text,
      time,
    };

    try {
      socket.emit("message", message);

      return true;
    } catch (e) {
      return false;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header
        drawerWidth={drawerWidth}
        onDrawerToggle={handleDrawerToggle}
        handleLogout={handleLogout}
      />
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        currentUser={currentUser}
        allUsers={allUsers}
        onlineUsers={onlineUsers}
        socket={socket}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          backgroundImage: `url("${chatBgImage}")`,
        }}
      >
        <Toolbar />

        <Grid container>
          <Grid
            ref={messagesContainerRef}
            item
            xs={12}
            sx={{
              overflowY: "scroll",
              height: {
                xs: "calc(100vh - 112px)",
                sm: "calc(100vh - 120px)",
              },
            }}
          >
            <MessagesList
              messages={messages}
              onlineUsers={onlineUsers}
              currentUser={currentUser!}
            />
          </Grid>

          <Grid item>
            <SendForm
              onSendMessage={handleSendMessage}
              drawerWidth={drawerWidth}
              muted={currentUser?.isMuted}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Chat;
