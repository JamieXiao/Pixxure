import { useMusic } from './musicContext';

// interface MusicProps {
//     className?: string;
// }

export const Music: React.FC = ({}) => {
    const { playing, setPlaying } = useMusic();
    // let playing = false;

    const updateAudio = async () => {
        let audio = document.getElementById("bg-music-audio") as HTMLAudioElement;
        let img = document.getElementById("bg-music-img") as HTMLImageElement;

        if (playing) {
            img.src = "mute.png";
            audio.pause();
            setPlaying(false);
            
        } else {
            img.src = "unmute.png";
            audio.play();
            setPlaying(true);
        }
    }

    
    return (
        <div className = "music-container">
            <audio loop id="bg-music-audio">
                <source src="music-jazz.mp3" type="audio/mpeg"></source>
                Your browser does not support the audio element.
            </audio>

            <img src="mute.png" alt="music" id="bg-music-img" className="music-icon" onClick={() => updateAudio()}/>
        </div>
        
    );
}



