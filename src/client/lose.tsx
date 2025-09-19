import React, { useEffect, useState } from "react";
import "./index.css";
import type { Page } from "./App";
import { ProgressBar, Card } from 'pixel-retroui';


type Props = {
    route: (page: Page) => void;
}

export const Lose: React.FC<Props> = ({  }) => {
    const [stats, setStats] = useState<{ wins: number, plays: number, win5: number, win4: number, win3: number, win2: number, win1: number, streak: number, maxStreak: number, lastPlayed: string, hearts: number } | null>(null);
    // const { heart, setHeart } = useHeart();

    useEffect(() => {
        document.body.style.backgroundImage = "url('/lose-background.png')";
    }, []);

    const enterStats = async () => {
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
            const response = await fetch('/api/hearts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hearts: 0 })});
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.stats);  
            } else {
                console.error('Error fetching stats:', data.message);
            }
            console.log(data.stats);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };    

    useEffect(() => {
        enterStats();
    }, []);

    return (
        <Card className="container is-skinny">
            <h1 className="how-to-play">BETTER LUCK NEXT TIME</h1>
            <img src={"/heart0.png"} alt="final-hearts" id="end-hearts"></img>
            <div style={{ width: "100%", padding: "5%", justifyContent: "left" }}>
                <h2>STATISTICS</h2>
                <div className="grid grid-cols-4 w-full text-center">
                    <p className="stat-int-lose">{stats ? stats.plays : '...'}</p>
                    <p className="stat-int-lose">{stats ? Math.round(stats.wins/stats.plays*100) : '...'}</p>
                    <p className="stat-int-lose">{stats ? stats.streak : '...'}</p>
                    <p className="stat-int-lose">{stats ? stats.maxStreak : '...'}</p>

                </div>
                <div className="grid grid-cols-4 w-full text-center">
                    <p className="stat-title" style={{ color: "#9D413E" }}>played</p>
                    <p className="stat-title" style={{ color: "#9D413E" }}>win %</p>
                    <p className="stat-title" style={{ color: "#9D413E" }}>streak</p>
                    <p className="stat-title" style={{ color: "#9D413E" }}>max streak</p>
                </div>
                <h2 style={{ paddingTop: "5%", paddingBottom: "2%" }}>HEARTS DISTRIBUTION</h2>
                <div className="grid grid-cols-[1fr_2fr] w-full gap-1 items-center" id="stat-hearts">
                    <img src="/hearts.png" alt="5 hearts" className="stat-heart"/>
                    <ProgressBar size="sm" color="#FAA5D3" borderColor="black" className="w-full" progress={stats && stats.wins > 0 ? (stats.win5 / stats.wins) * 100 : 0}/>
                    <img src="/heartRight4.png" alt="4 hearts" className="stat-heart"/>
                    <ProgressBar size="sm" color="#FAA5D3" borderColor="black" className="w-full" progress={stats && stats.wins > 0 ? (stats.win4 / stats.wins) * 100 : 0}/>
                    <img src="/heartRight3.png" alt="3 hearts" className="stat-heart"/>
                    <ProgressBar size="sm" color="#FAA5D3" borderColor="black" className="w-full" progress={stats && stats.wins > 0 ? (stats.win3 / stats.wins) * 100 : 0}/>
                    <img src="/heartRight2.png" alt="2 hearts" className="stat-heart"/>
                    <ProgressBar size="sm" color="#FAA5D3" borderColor="black" className="w-full" progress={stats && stats.wins > 0 ? (stats.win2 / stats.wins) * 100 : 0}/>
                    <img src="/heartRight1.png" alt="1 hearts" className="stat-heart"/>
                    <ProgressBar size="sm" color="#FAA5D3" borderColor="black" className="w-full" progress={stats && stats.wins > 0 ? (stats.win1 / stats.wins) * 100 : 0}/>
                </div>
                <p className="end-mssg">Come Back Tomorrow To Try Again!</p>
            </div>

        </Card>
    );
}