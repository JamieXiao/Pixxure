import { useState } from "react";

export const RedisTestBtn = () => {
    const [stats, setStats] = useState<{ wins: number, plays: number, win5: number, win4: number, win3: number, win2: number, win1: number, streak: number, maxStreak: number, lastPlayed: string } | null>(null);

    const handleClick = async () => {
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
            const response = await fetch('/api/win1', { method: 'POST' });
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

    return (
        <div>
            <button className="nes-btn is-primary" onClick={handleClick}>Test Redis</button>
            {stats && (
                <div style={{ marginTop: '10px' }}>
                    <p>Wins: {stats.wins}</p>
                    <p>Plays: {stats.plays}</p>
                    <p>Win5: {stats.win5}</p>
                    <p>Win4: {stats.win4}</p>
                    <p>Win3: {stats.win3}</p>
                    <p>Win2: {stats.win2}</p>
                    <p>Win1: {stats.win1}</p>
                    <p>Streak: {stats.streak}</p>
                    <p>Max Streak: {stats.maxStreak}</p>
                    <p>Last Played: {stats.lastPlayed}</p>
                </div>
            )}
        </div>
    );
}