import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RedisTestBtn } from "./components/redisTestBtn";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import "nes.css/css/nes.min.css";
import type { Page } from "./App";

type Props = {
    route: (page: Page) => void;
}

export const Menu: React.FC<Props> = ({ route }) => {
    return (
        <div className="nes-container is-rounded is-skinny">
            <h1>PIXXURE</h1>
        
            {/* <RedisTestBtn /> */}
            <img src="/hearts.png" alt="hearts" id="menu-hearts"></img>
            {/* <Link to="/game">
                <Button colorClass="blue-btn menu-button">Play</Button>
            </Link> */}
            <Button colorClass="blue-btn menu-button blue-btn-animate" onClick={() => route("game")}>PLAY</Button>
            {/* <div style={{ padding: "5%" }}></div> */}
            {/* <Link to="/instructions">
                <Button colorClass="white-btn menu-button">Info</Button>
            </Link> */}
            <Button colorClass="white-btn menu-button" onClick={() => route("instructions")}>INFO</Button>
            <Button colorClass="white-btn menu-button">CREDITS</Button>
        </div>
    );
}