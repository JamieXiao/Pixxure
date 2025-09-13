import React from "react";
import "./index.css";
import type { Page } from "./App";
import { Button, Card } from 'pixel-retroui'

type Props = {
    route: (page: Page) => void;
}


export const Instructions: React.FC<Props> = ({ route }) => {
    return (
        <Card className="container is-rounded is-wide">
            <h1 id="how-to-play">HOW TO PLAY</h1>
            <div className="instructions-text">
                <p>1. Guess the object in the pixelated image in the fewest tries possible (hint: the answer's only 1 word)</p>
                <p>2. You have 5 tries - look at your hearts to see how many you have left!</p>
                <p>3. Good luck!</p>
            </div>
            <div className="instructions-btn-container">
                <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="back-btn" onClick={() => route("menu")}>BACK</Button>
            </div>
        </Card>
    );
}