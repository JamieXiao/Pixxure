import React from "react";
import ReactDOM from "react-dom/client";
import type { Page } from "./App";

type Props = {
    route: (page: Page) => void;
}

export const Win: React.FC<Props> = ({ route }) => {
    return (
        <div>
            Win
        </div>
    );
}