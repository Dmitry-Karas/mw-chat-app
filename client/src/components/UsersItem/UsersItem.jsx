import { useEffect, useState } from "react";
import { ListItem, ListItemText, Typography } from "@material-ui/core";
import { Avatar, ListItemIcon } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import DoNotDisturbOffIcon from "@mui/icons-material/DoNotDisturbOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

const UsersItem = ({ user, onlineUser, isAdmin, socket }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    setIsMuted(user.isMuted);
    setIsBanned(user.isBanned);
  }, [user.isBanned, user.isMuted]);

  const handleAction = (action) => {
    if (user.role === "admin") {
      return alert(`You cannot ${action} admin`);
    }

    socket.emit(action, user._id);

    switch (action) {
      case "ban":
        setIsBanned(!isBanned);
        return;

      case "mute":
        setIsMuted(!isMuted);
        return;

      default:
        return console.log("Unknown action");
    }
  };

  // const handleMute = () => {
  //   if (user.role === "admin") {
  //     return alert("You cannot mute admin");
  //   }

  //   socket.emit("mute", user._id);

  //   setIsMuted(!isMuted);
  // };

  // const handleBan = () => {
  //   if (user.role === "admin") {
  //     return alert("You cannot ban admin");
  //   }
  //   socket.emit("ban", user._id);

  //   setIsBanned(!isBanned);
  // };

  return (
    <ListItem>
      <ListItemIcon>
        <Avatar sx={{ bgcolor: onlineUser?.color }}>
          {user.name?.slice(0, 1).toUpperCase()}
        </Avatar>
      </ListItemIcon>
      <ListItemText>
        <Typography
          sx={{
            overflowWrap: "anywhere",
            width: { xs: "100px", sm: "140px" },
          }}
        >
          {user.name}
        </Typography>
      </ListItemText>

      <ListItemText secondary={onlineUser && "online"} align="right" />

      {isAdmin && (
        <>
          <IconButton
            onClick={() => handleAction("mute")}
            disabled={user.role === "admin"}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>

          <IconButton
            onClick={() => handleAction("ban")}
            disabled={user.role === "admin"}
          >
            {isBanned ? <DoNotDisturbOffIcon /> : <DoNotDisturbOnIcon />}
          </IconButton>
        </>
      )}
    </ListItem>
  );
};

export default UsersItem;
