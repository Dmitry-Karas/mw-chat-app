import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
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

const drawerWidth = { xs: 320, sm: 360 };

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

  useEffect(() => {
    const socket = io(
      `http://localhost:8080?token=${sessionStorage.getItem("token")}`
    );

    setSocket(socket);
  }, []);

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
    socket?.on("connection", ({ user }) => {
      setCurrentUser(user);
    });

    socket?.on("message", (message) => {
      if (!message.body) return;

      setMessages((state) => [...state, message]);
    });

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
      socket?.off("connection");
      socket?.off("message");
      socket?.off("messages");
      socket?.off("onlineUsers");
      socket?.off("allUsers");
    };
  }, [socket]);

  useEffect(() => {
    inputRef.current.focus();

    socket?.on("ban", (user) => {
      const shouldDisconnect = user.isBanned && currentUser._id === user._id;

      if (shouldDisconnect) {
        sessionStorage.removeItem("token");
        socket?.disconnect();
        history.push("/");
      }
    });

    socket?.on("mute", (user) => {
      // console.log(user);
      // setCurrentUser(user);
      const shouldMute = currentUser._id === user._id;
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
