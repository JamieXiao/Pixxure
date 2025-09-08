import React from 'react';
import "./index.css";

import "nes.css/css/nes.min.css";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    colorClass?: string;
  }
  

export const Button: React.FC<ButtonProps> = ({ children, onClick, className = '', colorClass = ''}) => {
    return (
        <button
          onClick={onClick}
          className={`nes-btn ${colorClass}`}
        //   className={className}
        >
          {children}
        </button>
      );
}