import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GeneratorPage from './pages/GeneratorPage';
import CardPage from './pages/CardPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GeneratorPage />} />
        <Route path="/card" element={<CardPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;