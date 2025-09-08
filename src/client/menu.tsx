import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Link } from "react-router-dom";
import { Button } from "./Button";

import "nes.css/css/nes.min.css";


export const Menu = () => {
    return (
        <div className="nes-container is-rounded">
            <h1>Pixxure</h1>
            <img src="public/hearts.png" alt="hearts" id="menu-hearts"></img>
            <Link to="/game">
                <Button colorClass="blue-btn">Play</Button>
            </Link>
            <div style={{ padding: "3vh" }}></div>
            <Link to="/instructions">
                <Button colorClass="white-btn">Info</Button>
            </Link>
        </div>
    );
}