import { List } from "@material-ui/core";
import UsersItem from "../UsersItem/UsersItem";

const UsersList = ({ currentUser, allUsers, onlineUsers, onMute, onBan }) => {
  const renderUsers = () => {
    const isAdmin = currentUser.role === "admin";

    if (isAdmin) {
      return allUsers.map((user) => {
        const isOnline = onlineUsers.includes(user._id);

        return (
          <UsersItem
            key={user._id}
            user={user}
            isOnline={isOnline}
            onBan={onBan}
            onMute={onMute}
            isAdmin={isAdmin}
          />
        );
      });
    }

    return allUsers
      .filter((user) => onlineUsers.includes(user._id))
      .map((user) => {
        return (
          <UsersItem
            key={user._id}
            user={user}
            isOnline={true}
            onBan={onBan}
            onMute={onMute}
            isAdmin={isAdmin}
          />
        );
      });
  };

  return <List>{renderUsers()}</List>;
};

export default UsersList;
