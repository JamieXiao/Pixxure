import React from "react";
import ReactDOM from "react-dom/client";
import type { Page } from "./App";
import { Button, Card, Input } from 'pixel-retroui'
import { useHeart } from "./components/heartContext";

    // onClick={() => setHeart(heart - 1)}
// import "./index.css";





type Props = {
    route: (page: Page) => void;
}

export const Game: React.FC<Props> = ({ route }) => {
    const { heart, setHeart } = useHeart();
    console.log("Current hearts:", heart);
    
    const updateHearts = async () => {                                
        // document.getElementById('game-hearts-img').src='heartRight2.png';
        const img = document.getElementById("game-hearts-img");

        // if not correct word, decrease hearts by 1 (initialized to 5)
        if (heart > 0) setHeart(heart - 1);

        if (img instanceof HTMLImageElement) {
            if (heart == 5) {
                img.src = 'hearts.png';
            } else if (heart == 0) {
                img.src = 'heart0.png';
            } else {
                img.src = `heartRight${heart}.png`;
            }
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
                <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="game-btn" onClick={() => updateHearts()}>SUBMIT</Button>
            </div>
        </Card>
    );
}