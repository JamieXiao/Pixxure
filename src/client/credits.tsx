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
        <Card className="container is-skinny">
            <h1>CREDITS</h1>
        </Card>
    );
}