import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Link } from "react-router-dom";
import { Button } from "./Button";

import "nes.css/css/nes.min.css";


export const Menu = () => {
    return (
        <div className="nes-container is-rounded">
            <h1>Menu</h1>
            <Link to="/game">
                <Button colorClass="blue-btn">Play A</Button>

                <button type="button" className="nes-btn">Play</button>
            </Link>
        </div>
    );
}