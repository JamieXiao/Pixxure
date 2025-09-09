import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import type { Page } from "./App";

type Props = {
    route: (page: Page) => void;
}


export const Instructions: React.FC<Props> = ({ route }) => {
    return (
        <div className="nes-container is-rounded is-wide">
            <h1 id="how-to-play">HOW TO PLAY</h1>
            <div id="instructions-text">
                <p>1. Guess the object in the pixelated image in the fewest tries possible</p>
                <p>2. You have 5 tries - look at your hearts to see how many you have left!</p>
                <p>3. Good luck!</p>
            </div>
            <div className="side-btns">
                {/* <Link to="/"> */}
                <Button colorClass="blue-btn instructions-btn" onClick={() => route("menu")}>BACK</Button>
                {/* </Link> */}
            </div>
        </div>
    );
}