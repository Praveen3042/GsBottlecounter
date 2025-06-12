import Login from "./components/auth/login";
import Register from "./components/auth/register";
import { useRoutes, Navigate, useLocation } from "react-router-dom";
import Header from "./components/header";
import Home from "./components/home";

import { AuthProvider ,useAuth} from "./contexts/authContext";
// import { useRoutes } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { userLoggedIn } = useAuth();
  return userLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
   
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <PrivateRoute>
          <Home />
        </PrivateRoute>,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <div className="w-full h-screen flex flex-col">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
