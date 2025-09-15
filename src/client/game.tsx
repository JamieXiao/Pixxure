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
        const img = document.getElementById("game-hearts-img") as HTMLImageElement;

        // if not correct word, decrease hearts by 1 (initialized to 5)
        let newHeart: number = heart;

        if (heart > 1) {
            newHeart = heart - 1;
            setHeart(newHeart);
        } else {
            newHeart = heart - 1;
            setHeart(newHeart);
            await new Promise(r => setTimeout(r, 500)); // wait 0.5s
            route("lose");
        }

        if (img instanceof HTMLImageElement) {
            img.src = `heartLeft${newHeart}.png`;
        }

        // clear input field
        clearInput();
    }

    const clearInput = async () => {
        const inputVal = document.getElementById("input-field") as HTMLInputElement;
        inputVal.value = '';
    }

    return (
        <Card className="container is-rounded is-wide">
            <Card className="container is-rounded pix-image" bg='#5A8096' shadowColor="#385261ff">IMAGE :D</Card>
            <div className="game-bottom">
                <img src="heartLeft5.png" alt="hearts" id="game-hearts-img"/>
                <Input
                    className="guess-box"
                    bg="#FFE3CF"
                    textColor="#24475B"
                    borderColor="#0"
                    placeholder="Enter your guess here!"
                    id = "input-field"
                /> 
                <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="game-btn" onClick={() => updateHearts()}>SUBMIT</Button>
            </div>
        </Card>
    );
}