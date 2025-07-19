import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import { useAuth0 } from "@auth0/auth0-react";
import UserDash from './pages/userDash';
import CanvasComp from './pages/CanvasComp';

function App() {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/userDash" element={<UserDash />} />
        <Route path="/game" element={<CanvasComp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;