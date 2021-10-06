import React from "react";
import UsersItem from "../UsersItem/UsersItem";
import { IUser } from "../../interfaces";
import { Socket } from "socket.io-client";

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
  const isAdmin = currentUser?.role === "admin";

  const usersItemMarkup = (user: IUser, onlineUser: IUser) => (
    <UsersItem
      key={user._id}
      user={user}
      onlineUser={onlineUser}
      isAdmin={isAdmin}
      socket={socket}
    />
  );

  if (isAdmin) {
    return (
      <>
        {allUsers.map((user) => {
          const onlineUser = onlineUsers?.find(
            (onlineUser) => onlineUser._id === user._id
          );

          return usersItemMarkup(user, onlineUser!);
        })}
      </>
    );
  }

  return (
    <>
      {onlineUsers.map((user) => {
        const onlineUser = onlineUsers.find(
          (onlineUser) => onlineUser._id === user._id
        );

        return usersItemMarkup(user, onlineUser!);
      })}
    </>
  );
};

export default UsersList;
