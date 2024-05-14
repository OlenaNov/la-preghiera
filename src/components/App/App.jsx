import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Prayer from '../pages/Prayer';
import './App.css';


function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:prayerId" element={<Prayer />} />
      </Routes>
    </>
  )
}

export default App
