import { Redirect, Route, RouteProps } from "react-router-dom";

interface Props extends RouteProps {
  restricted: boolean;
  redirectTo: string;
}

const PublicRoute: React.FC<Props> = ({
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
