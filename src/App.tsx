import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import HomeComponent from './pages/Home';
import { PrivateRouteList, PublicRouteList } from './route';
import Layout from './component/Layout';
import useAuth from './hooks/useAuth';
import LoginPage from './pages/Login';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from './redux/reducers/authSlice'
import Registration from './pages/Registration';
import CategoryComponent from './pages/Category';

interface Props {
  component: React.ComponentType
  path?: string
}

const PrivateRoute = ({component, isAuthenticated, ...rest}: any) => {
  const routeComponent = (props: any) => (
      isAuthenticated
          ? React.createElement(component, props)
          : <Navigate to={{pathname: '/'}}/>
  );
  return <Route {...rest} render={routeComponent}/>;
};


function App() {
  const { session } = useAuth();
  
  return (
    <div className="App">
    {
      session && (
        <Layout />
      )
    }
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Registration />} />
      <Route path='dashboard' element={<HomeComponent />} />
      <Route path='category' element={<CategoryComponent />} />
      
      
     
    </Routes>
  </div>
  );
}

export default App;
