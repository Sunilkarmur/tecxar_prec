import Login from '../pages/Login';

interface RoutePath {
    path: string;
    component: React.ReactNode;
}

 const PublicRouteList: RoutePath[] = [
    {
      path: "/login",
      component: <Login />,
    },
  ];

const PrivateRouteList: RoutePath[] = [

]

export {
    PrivateRouteList,
    PublicRouteList
}