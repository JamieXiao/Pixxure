import React, { useEffect } from "react";
import type { Page } from "./App";
import { Button, Card, Input } from 'pixel-retroui'
import { useHeart } from "./components/heartContext";
import { Music } from "./components/music";
import { useState } from "react";

// onClick={() => setHeart(heart - 1)}
// import "./index.css";


type Props = {
    route: (page: Page) => void;
}

export const Game: React.FC<Props> = ({ route }) => {

    const [testImage, setTestImage] = useState<string>('');
    const [testLabel, setTestLabel] = useState<string>('');
    const [testAliases, setTestAliases] = useState<string[]>([]);
    const [guess, setGuess] = useState<string>('');
    const [imageRevealed, setImageRevealed] = useState<boolean>(false);
    const [imageBlur, setImageBlur] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(true);

    const { heart, setHeart } = useHeart();
    // console.log("Current hearts:", heart);
    
    const updateHearts = async () => {                                
        const img = document.getElementById("game-hearts-img") as HTMLImageElement;

        // if not correct word, decrease hearts by 1 (initialized to 5)
        let newHeart: number = heart;
        newHeart = heart - 1;
        setHeart(newHeart);

        if (img instanceof HTMLImageElement) {
            img.src = `heartLeft${newHeart}.png`;
        }

        // clear input field
        clearInput();
    }

    const clearInput = async () => {
        const inputVal = document.getElementById("input-field") as HTMLInputElement;
        inputVal.value = '';
    }


    // grading algorithm 
    const normalize = (s: string): string => {
        return s.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const singularize = (word: string): string => {
        const irregulars: Record<string, string> = {
            'children': 'child', 'people': 'person', 'men': 'man', 'women': 'woman',
            'feet': 'foot', 'teeth': 'tooth', 'geese': 'goose', 'mice': 'mouse'
        };
        
        if (irregulars[word]) return irregulars[word];
        if (word.endsWith('ies') && word.length > 3) return word.slice(0, -3) + 'y';
        if (word.endsWith('oes') && word.length > 3) return word.slice(0, -2);
        if (word.endsWith('ves') && word.length > 3) return word.slice(0, -3) + 'f';
        if (word.endsWith('s') && word.length > 1) return word.slice(0, -1);
        return word;
    };

    const gradeAnswer = (userInput: string, canonical: string, aliases: string[] = []) => {
        const guessNorm = normalize(userInput);
        const target = normalize(canonical);
        const all = [target, ...aliases.map(normalize)];
        
        // exact match
        if (all.includes(guessNorm)) return { correct: true, reason: 'exact' };
        
        // try singularized versions
        const guessSing = singularize(guessNorm);
        const allSing = all.map(singularize);
        if (allSing.includes(guessSing)) return { correct: true, reason: 'singular' };
        
        // token set overlap
        const gset = new Set(guessNorm.split(' ').filter(w => w.length > 2));
        for (const t of all) {
            const tset = new Set(t.split(' ').filter(w => w.length > 2));
            const gsetArray = Array.from(gset);
            const inter = gsetArray.filter(x => tset.has(x)).length;
            const minSize = Math.min(gset.size, tset.size);
            if (inter > 0 && inter >= Math.max(1, Math.ceil(minSize * 0.5))) {
                return { correct: true, reason: 'tokens' };
            }
        }
        
        return { correct: false };
    };

    // real daily challenge data using your API
    const loadTestChallenge = async () => {
        setLoading(true);

        try {
            // call your daily challenge API endpoint (try the database version first)
            // first try to seed the database
            try {
                await fetch('./api/seed-today', { method: 'POST' });
            } catch (e) {
                console.log('Seeding failed, continuing with challenge fetch');
            }
            
            let response = await fetch('./api/challenge');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // new API structure: { dateUTC, image: { id, name, imageUrl, ... } }
            setTestLabel(data.image?.name || 'Unknown');
            setTestAliases(data.image?.labels || []);
            
            // use image proxy to bypass CSP restrictions
            const imageUrl = data.image?.imageUrl;
            if (imageUrl) {
                const proxiedImageUrl = `./api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
                setTestImage(proxiedImageUrl);
                // don't set loading false here - let the image onLoad/onError handle it
            } else {
                console.error('No image URL found in response:', data);
                setLoading(false);
            }
            
        } catch (error) {
            console.error('Failed to load daily challenge:', error);

            const labels = {
                dragonfly: ['damselfly', 'odonata'],
                bee: ['bumblebee', 'honeybee', 'apis'],
                butterfly: ['lepidoptera', 'siproeta stelenes'],
                // cat: ['kitten', 'kitty', 'feline'],
                // dog: ['puppy', 'canine', 'hound'],
                // book: ['novel', 'literature'],
                // tree: ['oak', 'pine', 'maple']
            };
            const images: Record<string, string> = {
                dragonfly: 'dragonfly.jpg',
                bee: 'bee.jpg',
                butterfly: 'butterfly.jpg',
                // cat: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...", 
                // dog: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...", 
                // book: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
                // tree: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." 
            };

            const epochDays = Math.floor(new Date().getTime() / 86400000);
            const keys = Object.keys(labels);
            const label = keys[epochDays % keys.length] || 'dragonfly';
            const aliases = labels[label as keyof typeof labels] || [];
            
            setTestLabel(label);
            setTestAliases(aliases);

            
            const image = images[label] ?? images['dragonfly'] ?? '';
            setTestImage(image);

            setLoading(false);

        } finally {
            // ensure loading is always set to false after a reasonable delay
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    };

    const handleGuess = () => {
        if (!guess.trim()) return;
        
        const gradeResult = gradeAnswer(guess, testLabel, testAliases);
        
        if (gradeResult.correct) {
            if (!imageRevealed) setImageRevealed(true);
            setTimeout(() => route("win"), 2000); // wait 1.5s then go to win page

        } else if (heart <= 1) {
            updateHearts();
            if (!imageRevealed) setImageRevealed(true);
            setTimeout(() => route("lose"), 2000); // wait 1.5s then go to win page
        }
        else {
            setImageBlur(Math.max(0, imageBlur - 2)); // decrease blur by 2px each wrong guess
            updateHearts();
        }
    };

    useEffect(() => {
        loadTestChallenge();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    };

    const imageStyle: React.CSSProperties = {
        borderRadius: '8px',
        filter: imageRevealed ? 'none' : `blur(${imageBlur}px)`,
        transition: 'filter 0.3s ease'
    };


    return (
        <Card className="container is-rounded is-wide">
            <Music></Music>
            <Card className="container is-rounded pix-img-container" bg='#5A8096' shadowColor="#385261ff">
                {loading ? (
                    <div>🔄 Loading image...</div>
                ) : (
                    <img 
                        src={testImage} 
                        alt="Daily challenge" 
                        style={imageStyle}
                        onLoad={() => {
                            console.log('Image loaded successfully:', testImage);
                            setLoading(false);
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', testImage);
                            // fallback to a simple placeholder
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/cccccc/666666?text=${encodeURIComponent(testLabel)}`;
                            setLoading(false);
                        }}
                    />
                )}
            </Card>
            <div className="game-bottom">
                <img src="heartLeft5.png" alt="hearts" id="game-hearts-img"/>
                <Input
                    className="guess-box"
                    bg="#FFE3CF"
                    textColor="#24475B"
                    borderColor="#0"
                    placeholder="Enter your guess here!"
                    id = "input-field"
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                /> 
                <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="game-btn" onClick={() => handleGuess()}>SUBMIT</Button>
            </div>
        </Card>
    );
}