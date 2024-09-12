import { FormEvent, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Lobby from "./components/Lobby";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:lobbyID" element={<Lobby />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
