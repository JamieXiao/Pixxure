import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import type { Page } from "./App";
import { Button, Card } from 'pixel-retroui';
import { Stats } from "./App";

import { Music } from "./components/music";

type Props = {
    route: (page: Page) => void;
    stats: Stats | null;
}

export const Menu: React.FC<Props> = ({ route, stats }) => {

    const hasPlayedToday = async () => {
        console.log("Checking if played today...");
        if (stats) {
            console.log('Stats fetched:', stats); 
            const lastDate = new Date(stats.lastPlayed);
            const currentDate = new Date();
            const diffTime = currentDate.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            console.log("diffDays: ", diffDays);
            if (diffDays < 1) {
                if (stats.hearts > 0){
                route("winNoPlay");
                } else {
                route("loseNoPlay");
                }
            } else {
                route("game");
            }
            // route("game");
        }         
    }

    return (
        <Card className="container is-skinny">
            <Music></Music>
            <h1>PIXXURE</h1>
            <img src="/hearts.png" alt="hearts" id="menu-hearts"></img>
            <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="menu-btn" onClick={() => hasPlayedToday()}>PLAY</Button>
            <Button bg="white" textColor="#5A8096" borderColor="black" shadow="#5A8096" className="menu-btn" onClick={() => route("instructions")}>INFO</Button>
            <Button bg="white" textColor="#5A8096" borderColor="black" shadow="#5A8096" className="menu-btn" onClick={() => route("credits")}>CREDITS</Button>

            {/* DELETE LATER */}
            {/* <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="menu-btn" onClick={() => route("game")}>PLAY</Button> */}

        </Card>
    );
}