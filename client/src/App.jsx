import { useState } from "react";
import { Switch, Redirect } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import ChatPage from "./pages/ChatPage/ChatPage";
import LoginPage from "./pages/LoginPage/LoginPage";

const App = () => {
  const [currentUser, setCurrentUser] = useState({});

  return (
    <>
      <Switch>
        <PublicRoute path="/" exact restricted redirectTo="/chat">
          <LoginPage onUserChange={setCurrentUser} />
        </PublicRoute>

        <PrivateRoute path="/chat" redirectTo="/">
          <ChatPage currentUser={currentUser} onUserChange={setCurrentUser} />
        </PrivateRoute>

        <Redirect to="/" />
      </Switch>
    </>
  );
};

export default App;
