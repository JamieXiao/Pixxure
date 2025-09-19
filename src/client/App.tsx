// import { navigateTo } from '@devvit/web/client';
// import { useCounter } from './hooks/useCounter';

import React, { useState, useEffect } from "react";

import { Menu } from "./menu";
import { Instructions } from "./instructions";
import { Game } from "./game";
import { Win } from "./win";
import { Lose } from "./lose";
import { Credits } from "./credits";
import { HeartProvider } from "./components/heartContext";
import { MusicProvider } from "./components/musicContext";
import { LoseNoPlay } from "./loseNoPlay";
import { WinNoPlay } from "./winNoPlay";

export type Page = "menu" | "instructions" | "game" | "win" | "lose" | "credits" | "loseNoPlay" | "winNoPlay";

export type Stats = {
  wins: number;
  plays: number;
  win5: number;
  win4: number;
  win3: number;
  win2: number;
  win1: number;
  streak: number;
  maxStreak: number;
  lastPlayed: string;
  hearts: number;
};



export const App = () => {
  const [page, setPage] = useState<Page>("menu");
  const [stats, setStats] = useState<Stats | null>(null);
  
  // const checkPlayed = async () => {
  //   if (stats){

  //     // const parsedStats = JSON.parse(stats.lastPlayed);
  //     // const lastDate = new Date(parsedStats);
  //     const lastDate = new Date(stats.lastPlayed);
  //     const currentDate = new Date();
  //     const diffTime = currentDate.getTime() - lastDate.getTime();
  //     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //     console.log("diffDays: ", diffDays);
  //     if (diffDays < 1) {
  //       if (stats.hearts > 0){
  //         setPage("winNoPlay");
  //       } else {
  //         setPage("loseNoPlay");
  //       }
  //     }
  //   }
  // }

  const checkPlayed = async () => {
    console.log("Fetching stats...");
    try {
      // const response1 = await fetch('/api/reset-stats', { method: 'POST' });
      const response = await fetch('/api/stats', { method: 'POST' });
      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.stats);  
      } else {
          console.error('Error fetching stats:', data.message);
      }
    } catch (error) {
        console.error('Fetch error:', error);
    }
  }

  useEffect(() => {
    checkPlayed();
  }, []);

  const renderPage = () => {
    switch (page) {
      case "menu":
        return <Menu route={setPage} stats={stats} />;
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
      case "loseNoPlay":
        return <LoseNoPlay route={setPage} stats={stats} />;
      case "winNoPlay":
        return <WinNoPlay route={setPage} stats={stats} />;
    }
  }
//   const { count, username, loading, increment, decrement } = useCounter();
  return (
    <HeartProvider>
    <MusicProvider>
      <div>
        {renderPage()}
      </div>
    </MusicProvider>
    </HeartProvider>
  );
};
