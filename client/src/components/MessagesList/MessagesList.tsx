import { List } from "@mui/material";
import MessagesItem from "../MessagesItem/MessagesItem";
import { IUser, IMessage } from "../../interfaces";
interface Props {
  messages: IMessage[];
  onlineUsers: IUser[];
  currentUser: IUser;
}

const MessagesList = ({ messages, onlineUsers, currentUser }: Props) => {
  return (
    <List>
      {messages.map((message) => {
        const user = onlineUsers.find((user) => user._id === message.userId);
        console.log(message._id);

        return (
          <MessagesItem
            key={message._id}
            message={message}
            user={user as IUser} /* todo временное решение, убрать */
            currentUser={currentUser}
          />
        );
      })}
    </List>
  );
};

export default MessagesList;
