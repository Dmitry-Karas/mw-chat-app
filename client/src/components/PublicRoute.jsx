import { Redirect, Route } from "react-router-dom";

const PublicRoute = ({
  children,
  restricted = false,
  redirectTo = "/chat",
  ...routeProps
}) => {
  const authToken = sessionStorage.getItem("token");
  const shouldRedirect = authToken && restricted;

  return (
    <Route {...routeProps}>
      {shouldRedirect ? <Redirect to={redirectTo} /> : children}
    </Route>
  );
};

export default PublicRoute;
