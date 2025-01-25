import React, { useState, useEffect, useCallback } from 'react';
import { Timer, RefreshCw, Trophy } from 'lucide-react';

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump",
  "The five boxing wizards jump quickly",
  "Sphinx of black quartz, judge my vow",
  "Bright vixens jump; dozy fowl quack",
  "Jinxed wizards pluck ivy from the big quilt",
  "Crazy Frederick bought many very exquisite opal jewels",
  "We promptly judged antique ivory buckles for the next prize",
  "A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent",
  "Two driven jocks help fax my big quiz",
  "Five quacking zephyrs jolt my wax bed",
  "The job requires extra pluck and zeal from every young wage earner",
  "Grumpy wizards make toxic brew for the evil queen and jack",
  "Jack amazed a few girls by dropping the antique onyx vase",
  "Quick zephyrs blow, vexing daft Jim",
  "Waltz, bad nymph, for quick jigs vex",
  "Heavy boxes perform quick waltzes and jigs",
  "Quick fox jumps nightly above wizard",
  "Fox nymphs grab quick-jived waltz",
  "Jovial kings quickly vex bad dwarfs with pomp",
  "Brawny gods just flocked up to quiz and vex him",
  "Jump by vow of quick, lazy strength in Oxford",
  "Quick wafting zephyrs vex bold Jim",
  "Jelly-like above the high wire, six quaking pachyderms kept the climax of the extravaganza in a dazzling state of flux",
  "The job of a wizard is to vex chumps quickly in fog",
  "Five hexing wizard bots jump quickly",
  "Quick brown dogs jump over the lazy fox",
  "The jay, pig, fox, zebra, and my wolves quack!",
  "Bright vixens jump; dozy fowl quack",
  "Quick fox jumps nightly above wizard",
];

function App() {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState(0);

  const generateNewText = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
    setText(SAMPLE_TEXTS[randomIndex]);
    setUserInput('');
    setStartTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
  }, []);

  useEffect(() => {
    generateNewText();
  }, [generateNewText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!startTime && value) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    // Calculate accuracy
    let correctChars = 0;
    const minLength = Math.min(value.length, text.length);
    for (let i = 0; i < minLength; i++) {
      if (value[i] === text[i]) correctChars++;
    }
    const accuracyScore = Math.round((correctChars / minLength) * 100) || 100;
    setAccuracy(accuracyScore);

    // Check if completed
    if (value === text) {
      const timeElapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60; // in minutes
      const wordsTyped = text.split(' ').length;
      const calculatedWpm = Math.round(wordsTyped / timeElapsed);
      setWpm(calculatedWpm);
      setIsFinished(true);
      setWordCount(wordsTyped);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 neon-box">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white neon-text">Typing Speed Test</h1>
          <button
            onClick={generateNewText}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600/20 text-white rounded-lg transition-all duration-300 neon-button hover:bg-purple-600/40"
          >
            <RefreshCw size={20} />
            New Text
          </button>
        </div>

        <div className="mb-8 p-6 bg-gray-800/80 rounded-xl neon-border">
          <p className="text-xl text-gray-100 leading-relaxed font-mono">
            {text.split('').map((char, index) => {
              let colorClass = 'text-gray-300 neon-text-cyan';
              if (index < userInput.length) {
                colorClass = userInput[index] === char 
                  ? 'text-emerald-400 neon-text-green' 
                  : 'text-red-400 neon-text-red';
              }
              return <span key={index} className={colorClass}>{char}</span>;
            })}
          </p>
        </div>

        <textarea
          value={userInput}
          onChange={handleInputChange}
          className="w-full p-4 border-2 border-cyan-400/50 bg-gray-800/30 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all mb-6 font-mono text-lg neon-border neon-text-cyan placeholder-white text-white"
          placeholder="Start typing..."
          style={{
            '::placeholder': {
              color: 'rgba(249, 103, 103, 0.6)',
              textShadow: '0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #0ff'
            }
          }}
          disabled={isFinished}
          rows={3}
        />

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-xl neon-stats">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Timer size={24} />
              <h3 className="font-semibold">WPM</h3>
            </div>
            <p className="text-2xl font-bold text-white neon-text-cyan">{wpm}</p>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-xl neon-stats">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Trophy size={24} />
              <h3 className="font-semibold">Accuracy</h3>
            </div>
            <p className="text-2xl font-bold text-white neon-text-cyan">{accuracy}%</p>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-xl neon-stats">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Trophy size={24} />
              <h3 className="font-semibold">Words</h3>
            </div>
            <p className="text-2xl font-bold text-white neon-text-cyan">{wordCount}</p>
          </div>
        </div>

        {isFinished && (
          <div className="mt-6 p-4 bg-emerald-900/30 border border-emerald-400/50 rounded-xl text-center neon-border">
            <p className="text-purple-600 font-semibold text-lg neon-text">
              Great job! Click "New Text" to try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;