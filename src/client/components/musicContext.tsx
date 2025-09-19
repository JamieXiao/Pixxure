import React, { createContext, useContext, useState, ReactNode } from "react";

type musicContextType = {
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
};

const musicContext = createContext<musicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [playing, setPlaying] = useState<boolean>(false);

  return (
    <musicContext.Provider value={{ playing, setPlaying }}>
      {children}
    </musicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(musicContext);
  if (!context) throw new Error("useHeart must be used within HeartProvider");
  return context;
};