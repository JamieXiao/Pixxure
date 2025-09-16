import React, { createContext, useContext, useState, ReactNode } from "react";

type heartContextType = {
  heart: number;
  setHeart: React.Dispatch<React.SetStateAction<number>>;
};

const heartContext = createContext<heartContextType | undefined>(undefined);

export const HeartProvider = ({ children }: { children: ReactNode }) => {
  const [heart, setHeart] = useState<number>(5);

  return (
    <heartContext.Provider value={{ heart, setHeart }}>
      {children}
    </heartContext.Provider>
  );
};

export const useHeart = () => {
  const context = useContext(heartContext);
  if (!context) throw new Error("useHeart must be used within HeartProvider");
  return context;
};