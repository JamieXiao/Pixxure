import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import type { Page } from "./App";

type Props = {
    route: (page: Page) => void;
}

export const Instructions: React.FC<Props> = ({ route }) => {
    return (
        <div className="nes-container is-rounded is-wide">
            <h1 id="how-to-play">HOW TO PLAY</h1>
        </div>
    );
}