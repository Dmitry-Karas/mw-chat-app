import { useEffect, useState } from "react";
import { ListItem, ListItemText, Typography } from "@material-ui/core";
import { Avatar, ListItemIcon } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import DoNotDisturbOffIcon from "@mui/icons-material/DoNotDisturbOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

const UsersItem = ({ user, isOnline, isAdmin, onBan, onMute }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    setIsMuted(user.isMuted);
    setIsBanned(user.isBanned);
  }, [user.isBanned, user.isMuted]);

  const handleMute = () => {
    onMute(user._id);

    setIsMuted(!isMuted);
  };

  const handleBan = () => {
    onBan(user._id);

    setIsBanned(!isBanned);
  };

  if (isAdmin) {
    return (
      <ListItem>
        <ListItemIcon>
          <Avatar>{user.name?.slice(0, 1).toUpperCase()}</Avatar>
        </ListItemIcon>
        <ListItemText>
          <Typography noWrap>{user.name}</Typography>
        </ListItemText>

        <ListItemText secondary={isOnline && "online"} align="right" />

        <IconButton onClick={handleMute}>
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>

        <IconButton onClick={handleBan}>
          {isBanned ? <DoNotDisturbOffIcon /> : <DoNotDisturbOnIcon />}
        </IconButton>
      </ListItem>
    );
  }

  return (
    <ListItem>
      <ListItemIcon>
        <Avatar>{user.name?.slice(0, 1).toUpperCase()}</Avatar>
      </ListItemIcon>
      <ListItemText>
        <Typography noWrap>{user.name}</Typography>
      </ListItemText>

      <ListItemText secondary={isOnline && "online"} align="right" />
    </ListItem>
  );
};

export default UsersItem;
