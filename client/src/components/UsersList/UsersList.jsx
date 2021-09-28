import UsersItem from "../UsersItem/UsersItem";

const UsersList = ({ currentUser, allUsers, onlineUsers, onMute, onBan }) => {
  const isAdmin = currentUser.role === "admin";

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
          onBan={onBan}
          onMute={onMute}
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
