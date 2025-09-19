## 💡 Inspiration 
Our team has always loved daily puzzles, the kind that give your brain a quick challenge, spark curiosity, and keep you coming back for more. Whether it is crosswords, Wordle, or Sudoku, we were inspired by the idea of small, daily habits that grow into something bigger over time. With Pixxure, we wanted to create that same feeling: a fun, pixelated image puzzle where players return each day to think, guess, and watch their scores accumulate and grow.

## 🖼️ What it does 
Pixxure is a daily pixelated image challenge. Each day, a new image is pulled from a free open-source database, pixelated, and presented as the puzzle of the day. Players guess the image, earn points for correct answers, and see their scores accumulate over time. The design emphasizes both quick daily engagement and long-term satisfaction as scores grow.

## 🛠️ How we built it 
- Devvit (Reddit’s developer framework) for game hosting and integration
- React with TypeScript for the client, ensuring a smooth and responsive interface
- Express with Redis for APIs, caching, and guess validation
- Tailwind.css for efficient and effective styling

Each day, the backend seeds a new challenge image, stores it in Redis, and ensures no repeats. The frontend fetches the challenge, renders it pixelated, and validates guesses through server APIs.

## ⚙️ Challenges we ran into 
One of our biggest challenges was understanding the complexities of building a game that is not only functional but also enjoyable for users. Specific hurdles included:
- Designing a database schema flexible enough for daily challenges without repeats
- Debugging API routes within Devvit’s unique environment
- Ensuring performance stayed smooth while managing caching, seeding, and scoring

## 🎉 Accomplishments that we're proud of 
- Successfully building a full-stack daily puzzle game in a new environment (Devvit)
- Creating a working pipeline for daily challenges that integrates APIs, databases, and caching
- Designing a user experience that encourages both daily play and long-term engagement
- Learning how to translate our love of puzzles into a product others can enjoy

## 🧠 What we learned 
- Building Pixxure taught us that even seemingly simple games require careful planning and execution. We learned about:
- Game design principles and balancing difficulty with fun
- Creating responsive frontend designs for puzzle interfaces
- Backend architecture for daily seeding, guess validation, and caching
- Practical integration of APIs and databases in a production-like setting

## 💭 What's next for Pixxure 
We want to expand Pixxure with features that make it even more engaging, such as:
- Automate daily seeding process
- Leaderboards to compare scores with friends and the community
- Adjustable pixelation levels that reveal more detail as guesses progress
- A streak system to reward consistent daily play
- Broader image sets and categories to keep puzzles fresh

Ultimately, we hope to grow Pixxure into a daily ritual that players look forward to as part of their everyday routine.