import Chat from "../../components/Chat/Chat";

const ChatPage = ({ currentUser, onUserChange }) => {
  return <Chat currentUser={currentUser} onUserChange={onUserChange} />;
};

export default ChatPage;
