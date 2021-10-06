import { Redirect, Route, RouteProps } from "react-router-dom";

interface Props extends RouteProps {
  redirectTo: string;
}

const PrivateRoute: React.FC<Props> = ({
  children,
  redirectTo = "/",
  ...routeProps
}) => {
  const authToken = sessionStorage.getItem("token");

  return (
    <Route {...routeProps}>
      {authToken ? children : <Redirect to={redirectTo} />}
    </Route>
  );
};

export default PrivateRoute;
