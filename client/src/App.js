import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useRoutes,
} from "react-router-dom";
import './App.css';

import Home from './components/Home';

function App() {
  let routes = useRoutes([
    {path: "/", element: <Home />}
  ])

  return (
    routes
  );
}

const AppWrapper = () => {
  return <Router>
    <App />
  </Router>
}

export default AppWrapper;
