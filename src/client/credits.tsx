import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import type { Page } from "./App";
import { Button, Card } from 'pixel-retroui'

type Props = {
    route: (page: Page) => void;
}

export const Credits: React.FC<Props> = ({ route }) => {
    return (
        <Card className="container is-skinny credits-container">
            <h1>CREDITS</h1>
            <div className="credits-text">
                <p>Jamborone</p>
                <p>not_cloth</p>
                <p>Tamlie</p>
                <p id='music-credits'>Music from #Uppbeat (free for Creators!): https://uppbeat.io/t/walz/ryan License code: JIDBFCCZA3NSOOS3</p>
            </div>
            <div className="credits-btn-container">
                <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="back-btn" onClick={() => route("menu")}>BACK</Button>
            </div>
        </Card>
    );
}