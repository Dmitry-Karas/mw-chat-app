import UsersItem from "../UsersItem/UsersItem";

const UsersList = ({ currentUser, allUsers, onlineUsers, socket }) => {
  const isAdmin = currentUser?.role === "admin";

  const usersItemMarkup = (user, onlineUser) => (
    <UsersItem
      key={user._id}
      user={user}
      onlineUser={onlineUser}
      isAdmin={isAdmin}
      socket={socket}
    />
  );

  if (isAdmin) {
    return allUsers.map((user) => {
      const onlineUser = onlineUsers.find(
        (onlineUser) => onlineUser._id === user._id
      );

      return usersItemMarkup(user, onlineUser);
    });
  }

  return onlineUsers.map((user) => {
    const onlineUser = onlineUsers.find(
      (onlineUser) => onlineUser._id === user._id
    );

    return usersItemMarkup(user, onlineUser);
  });
};

export default UsersList;
