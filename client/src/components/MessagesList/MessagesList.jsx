import { List } from "@mui/material";
import MessagesItem from "../MessagesItem/MessagesItem";

const MessagesList = ({ messages, onlineUsers, currentUser }) => {
  return (
    <List>
      {messages.map((message) => {
        const user = onlineUsers.find((user) => user._id === message.userId);

        return (
          <MessagesItem
            key={message._id}
            message={message}
            user={user}
            currentUser={currentUser}
          />
        );
      })}
    </List>
  );
};

export default MessagesList;
