import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GeneratorPage from './pages/GeneratorPage';
import CardPage from './pages/CardPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GeneratorPage />} />
        <Route path="/card" element={<CardPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;