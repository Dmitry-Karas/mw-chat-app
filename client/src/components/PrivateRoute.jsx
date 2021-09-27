import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({ children, redirectTo = "/", ...routeProps }) => {
  const authToken = sessionStorage.getItem("token");

  return (
    <Route {...routeProps}>
      {authToken ? children : <Redirect to={redirectTo} />}
    </Route>
  );
};

export default PrivateRoute;
