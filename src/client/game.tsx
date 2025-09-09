import React from "react";
import ReactDOM from "react-dom/client";
import type { Page } from "./App";

type Props = {
    route: (page: Page) => void;
}

export const Game: React.FC<Props> = ({ route }) => {
    return (
        <div>
            Game component
        </div>
    );
}