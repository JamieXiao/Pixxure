import React from "react";
import ReactDOM from "react-dom/client";
import type { Page } from "./App";
import { Button, Card, Input } from 'pixel-retroui'

// import "./index.css";





type Props = {
    route: (page: Page) => void;
}

export const Game: React.FC<Props> = ({ route }) => {
    
    const updateHearts = async () => {                                
        // document.getElementById('game-hearts-img').src='heartRight2.png';
        const img = document.getElementById("game-hearts-img");

        if (img instanceof HTMLImageElement) {
            img.src = "heartRight2.png";
        }
    }

    return (
        <Card className="container is-rounded is-wide">
            <div className="pix-image"></div>
            <div className="game-bottom">
                <img src="hearts.png" alt="hearts" id="game-hearts-img"/>
                <Input
                    className="guess-box"
                    bg="#FFE3CF"
                    textColor="#24475B"
                    borderColor="#0"
                    placeholder="Enter your guess here!"
                /> 
                <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="game-btn" onChange={(e) => updateHearts()}>SUBMIT</Button>
            </div>
        </Card>
    );
}