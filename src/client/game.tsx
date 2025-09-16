import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type { Page } from "./App";
import { Button, Card, Input } from 'pixel-retroui'
import { useHeart } from "./components/heartContext";
import { Music } from "./components/music";

// onClick={() => setHeart(heart - 1)}
// import "./index.css";


type Props = {
    route: (page: Page) => void;
}

export const Game: React.FC<Props> = ({ route }) => {
    const { heart, setHeart } = useHeart();
    console.log("Current hearts:", heart);
    
    const updateHearts = async () => {                                
        const img = document.getElementById("game-hearts-img") as HTMLImageElement;

        // if not correct word, decrease hearts by 1 (initialized to 5)
        let newHeart: number = heart;

        if (heart > 1) {
            newHeart = heart - 1;
            setHeart(newHeart);
        } else {
            newHeart = heart - 1;
            setHeart(newHeart);
            await new Promise(r => setTimeout(r, 500)); // wait 0.5s
            route("lose");
        }

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

    // // ============= TEMPORARY TEST SECTION - DELETE LATER =============
    // const [testImage, setTestImage] = useState<string>('');
    // const [testLabel, setTestLabel] = useState<string>('');
    // const [testAliases, setTestAliases] = useState<string[]>([]);
    // const [guess, setGuess] = useState<string>('');
    // const [result, setResult] = useState<string>('');
    // const [imageRevealed, setImageRevealed] = useState<boolean>(false);
    // const [loading, setLoading] = useState<boolean>(true);

    // // grading algorithm (copied from server)
    // const normalize = (s: string): string => {
    //     return s.toLowerCase()
    //         .replace(/[^\w\s]/g, ' ')
    //         .replace(/\s+/g, ' ')
    //         .trim();
    // };

    // const singularize = (word: string): string => {
    //     const irregulars: Record<string, string> = {
    //         'children': 'child', 'people': 'person', 'men': 'man', 'women': 'woman',
    //         'feet': 'foot', 'teeth': 'tooth', 'geese': 'goose', 'mice': 'mouse'
    //     };
        
    //     if (irregulars[word]) return irregulars[word];
    //     if (word.endsWith('ies') && word.length > 3) return word.slice(0, -3) + 'y';
    //     if (word.endsWith('oes') && word.length > 3) return word.slice(0, -2);
    //     if (word.endsWith('ves') && word.length > 3) return word.slice(0, -3) + 'f';
    //     if (word.endsWith('s') && word.length > 1) return word.slice(0, -1);
    //     return word;
    // };

    // const gradeAnswer = (userInput: string, canonical: string, aliases: string[] = []) => {
    //     const guessNorm = normalize(userInput);
    //     const target = normalize(canonical);
    //     const all = [target, ...aliases.map(normalize)];
        
    //     // exact match
    //     if (all.includes(guessNorm)) return { correct: true, reason: 'exact' };
        
    //     // try singularized versions
    //     const guessSing = singularize(guessNorm);
    //     const allSing = all.map(singularize);
    //     if (allSing.includes(guessSing)) return { correct: true, reason: 'singular' };
        
    //     // token set overlap
    //     const gset = new Set(guessNorm.split(' ').filter(w => w.length > 2));
    //     for (const t of all) {
    //         const tset = new Set(t.split(' ').filter(w => w.length > 2));
    //         const gsetArray = Array.from(gset);
    //         const inter = gsetArray.filter(x => tset.has(x)).length;
    //         const minSize = Math.min(gset.size, tset.size);
    //         if (inter > 0 && inter >= Math.max(1, Math.ceil(minSize * 0.5))) {
    //             return { correct: true, reason: 'tokens' };
    //         }
    //     }
        
    //     return { correct: false };
    // };

    // // real daily challenge data using your API
    // const loadTestChallenge = async () => {
    //     setLoading(true);

    //     try {
    //         // call your daily challenge API endpoint (try the database version first)
    //         // first try to seed the database
    //         try {
    //             await fetch('./api/seed-today', { method: 'POST' });
    //         } catch (e) {
    //             console.log('Seeding failed, continuing with challenge fetch');
    //         }
            
    //         let response = await fetch('./api/challenge');
    //         if (!response.ok) {
    //             throw new Error(`API error: ${response.status}`);
    //         }
            
    //         const data = await response.json();
            
    //         // new API structure: { dateUTC, image: { id, name, imageUrl, ... } }
    //         setTestLabel(data.image?.name || 'Unknown');
    //         setTestAliases(data.image?.labels || []);
            
    //         // use image proxy to bypass CSP restrictions
    //         const imageUrl = data.image?.imageUrl;
    //         if (imageUrl) {
    //             const proxiedImageUrl = `./api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    //             setTestImage(proxiedImageUrl);
    //             // don't set loading false here - let the image onLoad/onError handle it
    //         } else {
    //             console.error('No image URL found in response:', data);
    //             setLoading(false);
    //         }
            
    //     } catch (error) {
    //         console.error('Failed to load daily challenge:', error);

    //         // fallback to mock data if API fails
    //         const labels = {
    //             car: ['automobile', 'vehicle', 'auto'],
    //             cat: ['kitten', 'kitty', 'feline'],
    //             dog: ['puppy', 'canine', 'hound'],
    //             book: ['novel', 'literature'],
    //             tree: ['oak', 'pine', 'maple']
    //         };
            
    //         const epochDays = Math.floor(new Date().getTime() / 86400000);
    //         const keys = Object.keys(labels);
    //         const label = keys[epochDays % keys.length] || 'car';
    //         const aliases = labels[label as keyof typeof labels] || [];
            
    //         setTestLabel(label);
    //         setTestAliases(aliases);
            
    //         // create a simple data URL image for testing (CSP compliant)
    //         const canvas = document.createElement('canvas');
    //         canvas.width = 400;
    //         canvas.height = 300;
    //         const ctx = canvas.getContext('2d');
    //         if (ctx) {
    //             ctx.fillStyle = '#4a90e2';
    //             ctx.fillRect(0, 0, 400, 300);
    //             ctx.fillStyle = '#ffffff';
    //             ctx.font = 'bold 32px Arial';
    //             ctx.textAlign = 'center';
    //             ctx.textBaseline = 'middle';
    //             ctx.fillText(label.toUpperCase(), 200, 150);
    //         }
    //         setTestImage(canvas.toDataURL());
    //         setLoading(false);
    //     } finally {
    //         // ensure loading is always set to false after a reasonable delay
    //         setTimeout(() => {
    //             setLoading(false);
    //         }, 3000);
    //     }
    // };

    // const handleGuess = () => {
    //     if (!guess.trim()) return;
        
    //     const gradeResult = gradeAnswer(guess, testLabel, testAliases);
        
    //     if (gradeResult.correct) {
    //         setResult(`🎉 Correct! "${guess}" matches "${testLabel}" (${gradeResult.reason} match)`);
    //         if (!imageRevealed) setImageRevealed(true);
    //     } else {
    //         setResult(`❌ Not quite. "${guess}" doesn't match "${testLabel}"`);
    //     }
    // };

    // useEffect(() => {
    //     loadTestChallenge();
    // }, []);

    // const testSectionStyle: React.CSSProperties = {
    //     border: '3px dashed #ff6b6b',
    //     padding: '20px',
    //     margin: '20px 0',
    //     backgroundColor: '#fff5f5',
    //     borderRadius: '10px'
    // };

    // const imageStyle: React.CSSProperties = {
    //     maxWidth: '400px',
    //     maxHeight: '300px',
    //     borderRadius: '8px',
    //     filter: imageRevealed ? 'none' : 'blur(8px)',
    //     transition: 'filter 0.3s ease'
    // };

    // // ============= END TEMPORARY TEST SECTION =============

    return (
        <Card className="container is-rounded is-wide">
            <Music></Music>
            <Card className="container is-rounded pix-image" bg='#5A8096' shadowColor="#385261ff">IMAGE :D</Card>
            <div className="game-bottom">
                <img src="heartLeft5.png" alt="hearts" id="game-hearts-img"/>
                <Input
                    className="guess-box"
                    bg="#FFE3CF"
                    textColor="#24475B"
                    borderColor="#0"
                    placeholder="Enter your guess here!"
                    id = "input-field"
                /> 
                <Button bg="#5A8096" textColor="white" borderColor="black" shadow="#385261ff" className="game-btn" onClick={() => updateHearts()}>SUBMIT</Button>
            </div>
        </Card>

        // <div>
        //     {/* ============= TEMPORARY TEST SECTION - DELETE LATER ============= */}
        //     <div style={testSectionStyle}>
        //         <h2 style={{color: '#ff6b6b', margin: '0 0 20px 0'}}>🧪 ALGORITHM TEST (REMOVE LATER)</h2>
                
        //         <div style={{marginBottom: '20px'}}>
        //             <strong>Today's Challenge:</strong> "{testLabel}" 
        //             <br />
        //             <small>Aliases: {testAliases.join(', ')}</small>
        //         </div>
                
        //         <div style={{textAlign: 'center', margin: '20px 0'}}>
        //             {loading ? (
        //                 <div>🔄 Loading image...</div>
        //             ) : (
        //                 <img 
        //                     src={testImage} 
        //                     alt="Daily challenge" 
        //                     style={imageStyle}
        //                     onLoad={() => {
        //                         console.log('Image loaded successfully:', testImage);
        //                         setLoading(false);
        //                     }}
        //                     onError={(e) => {
        //                         console.error('Image failed to load:', testImage);
        //                         // fallback to a simple placeholder
        //                         (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/cccccc/666666?text=${encodeURIComponent(testLabel)}`;
        //                         setLoading(false);
        //                     }}
        //                 />
        //             )}
        //         </div>
                
        //         <div style={{textAlign: 'center', margin: '20px 0'}}>
        //             <input 
        //                 type="text" 
        //                 value={guess}
        //                 onChange={(e) => setGuess(e.target.value)}
        //                 placeholder="What do you see?"
        //                 style={{
        //                     padding: '10px',
        //                     fontSize: '16px',
        //                     border: '2px solid #ddd',
        //                     borderRadius: '5px',
        //                     marginRight: '10px',
        //                     width: '200px'
        //                 }}
        //                 onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
        //                 disabled={loading}
        //             />
        //             <button 
        //                 onClick={handleGuess}
        //                 disabled={loading}
        //                 style={{
        //                     padding: '10px 20px',
        //                     fontSize: '16px',
        //                     backgroundColor: '#007bff',
        //                     color: 'white',
        //                     border: 'none',
        //                     borderRadius: '5px',
        //                     cursor: loading ? 'not-allowed' : 'pointer',
        //                     marginRight: '10px'
        //                 }}
        //             >
        //                 Submit Guess
        //             </button>
        //             <button 
        //                 onClick={() => setImageRevealed(true)}
        //                 disabled={loading || imageRevealed}
        //                 style={{
        //                     padding: '10px 15px',
        //                     backgroundColor: '#28a745',
        //                     color: 'white',
        //                     border: 'none',
        //                     borderRadius: '5px',
        //                     cursor: (loading || imageRevealed) ? 'not-allowed' : 'pointer'
        //                 }}
        //             >
        //                 {imageRevealed ? 'Revealed' : 'Reveal'}
        //             </button>
        //         </div>
                
        //         {result && (
        //             <div style={{
        //                 margin: '20px 0',
        //                 padding: '15px',
        //                 borderRadius: '5px',
        //                 fontWeight: 'bold',
        //                 textAlign: 'center',
        //                 backgroundColor: result.includes('🎉') ? '#d4edda' : '#f8d7da',
        //                 color: result.includes('🎉') ? '#155724' : '#721c24',
        //                 border: result.includes('🎉') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
        //             }}>
        //                 {result}
        //             </div>
        //         )}
        //     </div>
        //     {/* ============= END TEMPORARY TEST SECTION ============= */}
            
        //     <div>
        //         Game component
        //     </div>
        // </div>
    );
}