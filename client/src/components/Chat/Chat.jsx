import { useEffect, useRef, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Avatar, Grid, Stack, TextField } from "@mui/material";
import { io } from "socket.io-client";
import { useHistory } from "react-router";
import { format } from "date-fns";
import UsersList from "../UsersList/UsersList";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SendIcon from "@mui/icons-material/Send";

const Chat = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const history = useHistory();

  const inputRef = useRef();
  const messagesContainerRef = useRef();

  const sessionToken = sessionStorage.getItem("token");
  const drawerWidth = 360;

  useEffect(() => {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;

    if (!socket) {
      return;
    }

    socket.on("connection", ({ userToken, user }) => {
      if (sessionToken !== userToken || !currentUser) {
        return;
      }

      setCurrentUser(user);
    });

    return () => {
      socket.off("connection");
    };
  });

  useEffect(() => {
    const newSocket = io(`http://localhost:8080?token=${sessionToken}`);

    setSocket(newSocket);

    newSocket.emit("messages");

    newSocket.on("messages", (messages) => {
      setMessages(messages);
    });

    return () => {
      newSocket.disconnect();
      newSocket.off("messages");
    };
  }, [sessionToken]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("connection");
    socket.emit("messages");
    socket.emit("onlineUsers");
    socket.emit("allUsers");

    socket.on("allUsers", (users) => {
      setAllUsers(users);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("ban", (user) => {
      const shouldDisconnect = user.isBanned && currentUser._id === user._id;

      if (shouldDisconnect) {
        sessionStorage.removeItem("token");
        socket.disconnect();
        history.push("/");
      }
    });

    socket.on("mute", (user) => {
      const shouldMute = currentUser._id === user._id;

      if (shouldMute) {
        const newUser = { ...currentUser, isMuted: user.isMuted };

        setCurrentUser(newUser);

        sessionStorage.setItem("user", JSON.stringify(newUser));
      }
    });

    return () => {
      socket.off("allUsers");
      socket.off("onlineUsers");
      socket.off("ban");
      socket.off("mute");
    };
  }, [currentUser, history, socket]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("message", (message) => {
      if (!message.body) {
        return;
      }

      setMessages([...messages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, [currentUser, messages, socket]);

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

    socket.emit("message", message);

    messageForm.reset();

    //============= Uncomment ===========

    // inputRef.current.disabled = true;
    // inputRef.current.placeholder = "You can send messages every 15 seconds";

    // setTimeout(() => {
    //   inputRef.current.disabled = false;
    //   inputRef.current.placeholder = "Message";
    //   inputRef.current.focus();
    // }, 15000);

    // ===================================
  };

  const handleMute = (userId) => {
    socket.emit("mute", userId);
  };

  const handleBan = (userId) => {
    socket.emit("ban", userId);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <List>
        <ListItem>
          <ListItemIcon>
            <Avatar sx={{ bgcolor: currentUser.color }}>
              {currentUser.name?.slice(0, 1).toUpperCase()}
            </Avatar>
          </ListItemIcon>
          <ListItemText primary={currentUser.name} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <UsersList
          currentUser={currentUser}
          allUsers={allUsers}
          onlineUsers={onlineUsers}
          onMute={handleMute}
          onBan={handleBan}
        />
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Chat app
            </Typography>
            <IconButton color="inherit" size="large" onClick={handleLogout}>
              <ExitToAppIcon fontSize="large" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, height: "100vh" }}>
        <Toolbar />

        <Grid container>
          <Grid
            ref={messagesContainerRef}
            item
            xs={12}
            sx={{
              overflowY: "scroll",
              height: "calc(100vh - 152px)",
            }}
          >
            <List>
              {messages.map((message, index) => {
                return (
                  <ListItem key={index}>
                    <Grid container>
                      <Grid item xs={12}>
                        <ListItemText
                          style={{
                            color:
                              message.sender === currentUser.name &&
                              currentUser.color,
                          }}
                          align={
                            message.sender === currentUser.name
                              ? "left"
                              : "right"
                          }
                          primary={message.sender}
                        ></ListItemText>
                      </Grid>
                      <Grid item xs={12}>
                        <ListItemText
                          align={
                            message.sender === currentUser.name
                              ? "left"
                              : "right"
                          }
                          primary={message.body}
                        ></ListItemText>
                      </Grid>
                      <Grid item xs={12}>
                        <ListItemText
                          align={
                            message.sender === currentUser.name
                              ? "left"
                              : "right"
                          }
                          secondary={message.time}
                        ></ListItemText>
                      </Grid>
                    </Grid>
                  </ListItem>
                );
              })}
            </List>
          </Grid>

          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              position: "fixed",
              bottom: 0,
              p: 3,
              left: {
                sm: `${drawerWidth}px`,
                xs: `0`,
              },
              width: {
                xs: `100%`,
                sm: `calc(100% - ${drawerWidth}px)`,
              },
            }}
          >
            <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
              wrap="nowrap"
            >
              <Grid item xs={12}>
                <TextField
                  inputRef={inputRef}
                  name="message"
                  autoFocus
                  variant="outlined"
                  inputProps={{ maxLength: 200 }}
                  fullWidth
                  autoComplete="off"
                  placeholder={
                    currentUser.isMuted ? "You are muted" : "Message"
                  }
                  size="small"
                  disabled={currentUser.isMuted}
                />
              </Grid>

              <Grid item>
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={currentUser.isMuted}
                >
                  <SendIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

export default Chat;
