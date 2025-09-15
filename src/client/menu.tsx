import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import type { Page } from "./App";
import { Button, Card } from 'pixel-retroui'

import { Music } from "./components/music";

type Props = {
    route: (page: Page) => void;
}

export const Menu: React.FC<Props> = ({ route }) => {
    return (
        <Card className="container is-skinny">
            <Music></Music>
            <h1>PIXXURE</h1>
            <img src="/hearts.png" alt="hearts" id="menu-hearts"></img>
            <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="menu-btn" onClick={() => route("game")}>PLAY</Button>
            <Button bg="white" textColor="#5A8096" borderColor="black" shadow="#5A8096" className="menu-btn" onClick={() => route("instructions")}>INFO</Button>
            <Button bg="white" textColor="#5A8096" borderColor="black" shadow="#5A8096" className="menu-btn" onClick={() => route("credits")}>CREDITS</Button>
        </Card>
    );
}