import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Link } from "react-router-dom";
import type { Page } from "./App";
import { Button, Card } from 'pixel-retroui';
import { useHeart } from "./components/heartContext";

type Props = {
    route: (page: Page) => void;
}

export const Win: React.FC<Props> = ({ route }) => {
    const [stats, setStats] = useState<{ wins: number, plays: number, win5: number, win4: number, win3: number, win2: number, win1: number, streak: number, maxStreak: number, lastPlayed: string } | null>(null);
    const { heart, setHeart } = useHeart();

    // onClick={() => setHeart(heart - 1)}

    const enterStats = async () => {
        // setHeart(4);
        // note, always call the play endpoint first since it runs the data init
        try {
            const response = await fetch('/api/play', { method: 'POST' });
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.stats);  
            } else {
                console.error('Error fetching stats:', data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
        try {
            const response = await fetch('/api/win', { method: 'POST' });
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.stats);  
            } else {
                console.error('Error fetching stats:', data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
        try {
            const response = await fetch('/api/streak', { method: 'POST' });
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.stats);  
            } else {
                console.error('Error fetching stats:', data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
        try {
            const response = await fetch('/api/maxStreak', { method: 'POST' });
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.stats);  
            } else {
                console.error('Error fetching stats:', data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
        try {
            const response = await fetch(`/api/win${heart}`, { method: 'POST' });
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.stats);  
                console.log('Stats fetched:', data.stats); 
            } else {
                console.error('Error fetching stats:', data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }

    };    

    useEffect(() => {
        enterStats();
    }, []);

    return (
        <Card className="container is-skinny">
            <h1>YOU WON</h1>
            <img src={`/heartLeft${heart}.png`} alt="hearts" id="menu-hearts"></img>
        </Card>
    );
}