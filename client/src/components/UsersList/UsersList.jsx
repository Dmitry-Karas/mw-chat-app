import UsersItem from "../UsersItem/UsersItem";

const UsersList = ({
  currentUser,
  allUsers,
  onlineUsers,
  onMute,
  onBan,
  socket,
}) => {
  const isAdmin = currentUser.role === "admin";

  const handleMute = (userId) => {
    socket.emit("mute", userId);
  };

  const handleBan = (userId) => {
    socket.emit("ban", userId);
  };

  if (isAdmin) {
    return allUsers.map((user) => {
      const onlineUser = onlineUsers.find(
        (onlineUser) => onlineUser._id === user._id
      );

      return (
        <UsersItem
          key={user._id}
          user={user}
          onlineUser={onlineUser}
          onBan={handleBan}
          onMute={handleMute}
          isAdmin={isAdmin}
        />
      );
    });
  }

  return allUsers
    .filter((user) =>
      onlineUsers.find((onlineUser) => onlineUser._id === user._id)
    )
    .map((user) => {
      const onlineUser = onlineUsers.find(
        (onlineUser) => onlineUser._id === user._id
      );

      return (
        <UsersItem
          key={user._id}
          user={user}
          onlineUser={onlineUser}
          onBan={onBan}
          onMute={onMute}
          isAdmin={isAdmin}
        />
      );
    });
};

export default UsersList;
