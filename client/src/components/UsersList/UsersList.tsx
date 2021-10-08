import { useState, useEffect } from "react";
import UsersItem from "../UsersItem/UsersItem";
import { IUser } from "../../interfaces";
import { Socket } from "socket.io-client";
import { Divider } from "@mui/material";

interface Props {
  currentUser: IUser | null;
  allUsers: IUser[];
  onlineUsers: IUser[];
  socket: Socket | null;
}

const UsersList: React.FC<Props> = ({
  currentUser,
  allUsers,
  onlineUsers,
  socket,
}) => {
  const [offlineUsers, setOfflineUsers] = useState<IUser[] | null>(null);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (!offlineUsers) {
      return;
    }

    showOfflineUsers();
  }, [onlineUsers]);

  const usersItemMarkup = (user: IUser, onlineUser?: IUser) => (
    <UsersItem
      key={user._id}
      user={user}
      onlineUser={onlineUser ?? null}
      isAdmin={isAdmin}
      socket={socket}
    />
  );

  const showOfflineUsers = () => {
    const users = allUsers.filter((user) => {
      const onlineUser = onlineUsers.find(
        (onlineUser) => onlineUser._id === user._id
      );

      if (!onlineUser) {
        return true;
      }

      // if (user.isMuted !== onlineUser.isMuted) {
      // }
    });

    setOfflineUsers(users);
  };

  const handleOfflineUsersToggle = () => {
    offlineUsers ? setOfflineUsers(null) : showOfflineUsers();
  };

  return (
    <>
      {onlineUsers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => {
          const onlineUser = onlineUsers.find(
            (onlineUser) => onlineUser._id === user._id
          );

          return usersItemMarkup(user, onlineUser);
        })}

      {isAdmin && (
        <>
          <button onClick={handleOfflineUsersToggle}>show all</button>
          <Divider />
          {offlineUsers?.map((user) => usersItemMarkup(user))}
        </>
      )}
    </>
  );
};

export default UsersList;
