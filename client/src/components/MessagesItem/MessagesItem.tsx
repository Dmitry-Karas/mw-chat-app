import {
  Avatar,
  Grid,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { IMessage, IUser } from "../../interfaces";

interface Props {
  message: IMessage;
  user: IUser;
  currentUser: IUser;
}

const MessagesItem = ({ message, user, currentUser }: Props) => {
  const isSender = message.sender === currentUser.name;

  return (
    <ListItem
      sx={{
        justifyContent: `${isSender ? "right" : "left"}`,
      }}
    >
      <Grid
        container
        sx={{
          p: 2,
          width: "fit-content",
          maxWidth: {
            xs: "200px",
            sm: "600px",
          },
          backgroundColor: isSender ? "#daf8e3" : "#dcf3ff",
          borderRadius: "20px",
          overflowWrap: "anywhere",
        }}
      >
        <Grid container item pb={1} xs={12} alignItems="center">
          <Grid item>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: user?.color }}>
                {message.sender.slice(0, 1).toUpperCase()}
              </Avatar>
            </ListItemIcon>
          </Grid>

          <Grid item>
            <ListItemText
              sx={{
                color: isSender ? currentUser.color : user?.color,
              }}
              primary={message.sender}
            ></ListItemText>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <ListItemText primary={message.body}></ListItemText>
        </Grid>
        <Grid item xs={12}>
          <ListItemText secondary={message.time}></ListItemText>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default MessagesItem;
