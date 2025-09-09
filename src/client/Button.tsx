import React from 'react';
import "./index.css";

import "nes.css/css/nes.min.css";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    colorClass?: string;
  }
  

export const Button: React.FC<ButtonProps> = ({ children, onClick, colorClass = ''}) => {
    return (
        <button
          onClick={onClick}
          className={`nes-btn ${colorClass}`}
        >
          {children}
        </button>
      );
}