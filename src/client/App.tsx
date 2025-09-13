// import { navigateTo } from '@devvit/web/client';
// import { useCounter } from './hooks/useCounter';

import { HashRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";

import { Menu } from "./menu";
import { Instructions } from "./instructions";
import { Game } from "./game";
import { Win } from "./win";
import { Lose } from "./lose";
import { Credits } from "./credits";
import { HeartProvider } from "./components/heartContext";

export type Page = "menu" | "instructions" | "game" | "win" | "lose" | "credits";

export const App = () => {
  const [page, setPage] = useState<Page>("menu");

  const renderPage = () => {
    switch (page) {
      case "menu":
        return <Menu route={setPage} />;
      case "instructions":
        return <Instructions route={setPage} />;
      case "game":
        return <Game route={setPage} />;
      case "win":
        return <Win route={setPage} />;
      case "lose":
        return <Lose route={setPage} />;
      case "credits":
        return <Credits route={setPage} />;
    }
  }
//   const { count, username, loading, increment, decrement } = useCounter();
  return (
    <HeartProvider>
      <div>
        {renderPage()}
      </div>
    </HeartProvider>
    // <Router>
    //     <Routes>
    //         <Route path="/" element={<Menu/>}/>
    //         <Route path="/instructions" element={<Instructions/>}/>
    //         <Route path="/game" element={<Game/>}/>
    //         <Route path="/win" element={<Win/>}/>
    //         <Route path="/lose" element={<Lose/>}/>
    //     </Routes>
    // </Router>
  );
};
