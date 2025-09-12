import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RedisTestBtn } from "./components/redisTestBtn";
import { Link } from "react-router-dom";
// import { Button } from "./Button";
import "nes.css/css/nes.min.css";
import type { Page } from "./App";
import { Button, Card } from 'pixel-retroui'

type Props = {
    route: (page: Page) => void;
}

export const Menu: React.FC<Props> = ({ route }) => {
    return (
        <Card className="container is-rounded is-skinny">
            <h1>PIXXURE</h1>
        
            {/* <RedisTestBtn /> */}
            <img src="/hearts.png" alt="hearts" id="menu-hearts"></img>
            {/* <Link to="/game">
                <Button colorClass="blue-btn menu-button">Play</Button>
            </Link> */}
            <Button bg="#5A8096" textColor="white" borderColor="black" shadow="white" className="menu-btn" onClick={() => route("game")}>PLAY</Button>
            {/* <Button colorClass="blue-btn menu-btn blue-btn-animate" onClick={() => route("game")}>PLAY</Button> */}
            {/* <div style={{ padding: "5%" }}></div> */}
            {/* <Link to="/instructions">
                <Button colorClass="white-btn menu-button">Info</Button>
            </Link> */}
            <Button bg="white" textColor="#5A8096" borderColor="black" shadow="#5A8096" className="menu-btn" onClick={() => route("instructions")}>INFO</Button>
            <Button bg="white" textColor="#5A8096" borderColor="black" shadow="#5A8096" className="menu-btn">CREDITS</Button>
            {/* <Button colorClass="white-btn menu-btn" onClick={() => route("instructions")}>INFO</Button>
            <Button colorClass="white-btn menu-btn">CREDITS</Button> */}
        </Card>
    );
}