import React, { useState, useEffect, useCallback } from 'react';
import { Timer, RefreshCw, Trophy } from 'lucide-react';

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump",
  "The five boxing wizards jump quickly",
  "Sphinx of black quartz, judge my vow"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Typing Speed Test</h1>
          <button
            onClick={generateNewText}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw size={20} />
            New Text
          </button>
        </div>

        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-700 leading-relaxed font-mono">
            {text.split('').map((char, index) => {
              let color = 'text-gray-700';
              if (index < userInput.length) {
                color = userInput[index] === char ? 'text-green-600' : 'text-red-600';
              }
              return <span key={index} className={color}>{char}</span>;
            })}
          </p>
        </div>

        <textarea
          value={userInput}
          onChange={handleInputChange}
          className="w-full p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all mb-6 font-mono text-lg"
          placeholder="Start typing..."
          disabled={isFinished}
          rows={3}
        />

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Timer size={24} />
              <h3 className="font-semibold">WPM</h3>
            </div>
            <p className="text-2xl font-bold">{wpm}</p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Trophy size={24} />
              <h3 className="font-semibold">Accuracy</h3>
            </div>
            <p className="text-2xl font-bold">{accuracy}%</p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Trophy size={24} />
              <h3 className="font-semibold">Words</h3>
            </div>
            <p className="text-2xl font-bold">{wordCount}</p>
          </div>
        </div>

        {isFinished && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-600 font-semibold text-lg">
              Great job! Click "New Text" to try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;