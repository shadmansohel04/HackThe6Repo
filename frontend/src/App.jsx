import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/CanvasComp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        {/* <Route path="/userdash/scorePage" element = { <OneScorePage /> }/> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
