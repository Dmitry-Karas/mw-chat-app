import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Grid } from "@mui/material";
import { useHistory } from "react-router";
import { format } from "date-fns";
import chatBgImage from "../../images/chat-bg .jpg";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MessagesList from "../MessagesList/MessagesList";
import SendForm from "../SendForm/SendForm";

const Chat = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [counter, setCounter] = useState(0);

  const history = useHistory();

  const inputRef = useRef();
  const messagesContainerRef = useRef();

  const sessionToken = sessionStorage.getItem("token");
  const drawerWidth = { xs: 320, sm: 360 };

  useEffect(() => {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (counter === 0) {
      inputRef.current.placeholder = "Message";

      setCurrentUser((currentUser) => ({ ...currentUser, isMuted: false }));

      return;
    }

    inputRef.current.placeholder = `Wait ${counter} seconds before sending the next message`;

    const timerId = setTimeout(() => {
      setCounter((counter) => (counter -= 1));
    }, 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [counter]);

  useEffect(() => {
    socket?.emit("messages");
    socket?.emit("connection");
    socket?.emit("onlineUsers");
    socket?.emit("allUsers");

    socket?.on("messages", (messages) => {
      setMessages(messages);
    });

    socket?.on("allUsers", (users) => {
      setAllUsers(users);
    });

    socket?.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket?.disconnect();
      socket?.off("messages");
      socket?.off("onlineUsers");
      socket?.off("allUsers");
    };
  }, [socket]);

  useEffect(() => {
    const newSocket = io(`http://localhost:8080?token=${sessionToken}`);

    setSocket(newSocket);
  }, [sessionToken]);

  useEffect(() => {
    inputRef.current.focus();

    socket?.on("connection", ({ userToken, user }) => {
      if (sessionToken !== userToken || !currentUser) {
        return;
      }

      setCurrentUser(user);
    });

    socket?.on("ban", (user) => {
      const shouldDisconnect = user.isBanned && currentUser._id === user._id;

      if (shouldDisconnect) {
        sessionStorage.removeItem("token");
        socket?.disconnect();
        history.push("/");
      }
    });

    socket?.on("mute", (user) => {
      const shouldMute = currentUser._id === user._id;

      if (shouldMute) {
        const newUser = { ...currentUser, isMuted: user.isMuted };

        setCurrentUser(newUser);

        sessionStorage.setItem("user", JSON.stringify(newUser));
      }
    });

    socket?.on("disconnect", handleLogout);

    return () => {
      socket?.off("connection");
      socket?.off("ban");
      socket?.off("mute");
      socket?.off("disconnect");
    };
  }, [currentUser, history, sessionToken, socket]);

  useEffect(() => {
    socket?.on("message", (message) => {
      if (!message.body) return;

      setMessages((state) => [...state, message]);
    });

    return () => {
      socket?.off("message");
    };
  }, [socket]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");

    history.push("/");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    const messageForm = e.currentTarget;
    const value = messageForm.elements.message.value;

    const time = format(new Date(), "p");

    const message = {
      userId: currentUser._id,
      sender: currentUser.name,
      body: value,
      time,
    };

    socket?.emit("message", message);

    messageForm.reset();

    setCounter(15);
    setCurrentUser({ ...currentUser, isMuted: true });
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
        <Grid container>
          <Grid
            ref={messagesContainerRef}
            item
            xs={12}
            sx={{
              overflowY: "scroll",
              height: "calc(100vh - 56px)",
            }}
          >
            <MessagesList
              messages={messages}
              onlineUsers={onlineUsers}
              currentUser={currentUser}
            />
          </Grid>

          <Grid item>
            <SendForm
              onSendMessage={handleSendMessage}
              drawerWidth={drawerWidth}
              inputRef={inputRef}
              currentUser={currentUser}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Chat;
