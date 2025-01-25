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
  "A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent",
  "Five quacking zephyrs jolt my wax bed",
  "Quick wafting zephyrs vex bold Jim",
  "Two driven jocks help fax my big quiz",
  "Crazy Fredrick quickly bought many exotic jewelry",
  "Jelly-like above the high wire, six quaking pachyderms kept the climax of the extravaganza in a dazzling state of flux",
  "The jay, pig, fox, zebra, and my wolves quack!",
  "Heavy boxes perform quick waltzes and jigs",
  "Pack my red box with five dozen quality jugs",
  "A wizard’s job is to vex chumps quickly in fog",
  "Two driven jocks help fax my big quiz",
  "Bright vixens jump; dozy fowl quack",
  "Quick zephyrs blow, vexing daft Jim",
  "How quickly daft jumping zebras vex",
  "The quick onyx goblin jumps over the lazy dwarf",
  "Quick wafting zephyrs vex bold Jim",
  "The quick onyx goblin jumps over the lazy dwarf",
  "Jinxing wizard craves bold, flashy zebras for quip",
  "Vexed wizards quickly jump to bad glyphs of quartz",
  "Brightly vixen-jumped wizards fix quick quartz glyphs",
  "Zany wizards quickly vex bold jumping frogs",
  "Jumping wizards vex bold knights for quick quartz glyphs",
  "Quick zephyrs jolt my wax bed as wizards jump",
  "Vexed wizards jump quickly to fix bad quartz glyphs",
  "Bold wizards jump quickly to vex the foxy nymph",
  "Jumping wizards quickly vex bold frogs and quail",
  "Quick zephyrs blow, vexing the wizard's bold jump",
  "Vexed wizards quickly jump to fix bold quartz glyphs",
  "Bold nymphs quickly fix jumping wizards' vexed quartz",
  "Jumping wizards vex bold nymphs with quick quartz glyphs",
  "Quick wizards jump over the bold, vexed nymph's quartz",
  "Vexed wizards quickly jump to fix bold quartz nymphs",
  "Jumpy wizard fixes bold quartz nymphs swiftly",
  "A jovial mix of wizards jumps over bold, quick nymphs",
  "The vexed wizard jumps quickly over the lazy frog",
  "Brightly, quick wizards jump over lazy nymphs' golf",
  "Quick foxes jump over lazy wizards and vex nymphs",
  "Vexing wizards jump quickly over the bold nymph's glaze",
  "Jumping frogs vex the bold wizard's quick nymphs",
  "Wizardly jumps quickly vex bright nymphs and foxes",
  "Quick brown wizards jump over the lazy nymph's fog",
  "Bright wizards quickly jump over the vexed nymph's fox",
  "Vexed nymphs quickly jump over bright wizard's fog",
  "Jumpy wizards vex the bold, quick nymph's glow",
  "Quick nymphs jump over the vexed wizard's bold gaze",
  "The quirky wizard jumps over a bright nymph's fog",
  "Quick nymphs and bold wizards jump over the fuzzy fox",
  "Bright nymphs quickly jump over the lazy wizard's fox",
  "Jumpy nymphs and wizards vex bold, quick foxes",
  "Quick wizards and nymphs jump over the bold, vexed frog",
  "Zesty wizards jump over the bright, vexing nymph",
  "Jumping wizards vex bold knights with quick quartz",
  "Bright nymphs quickly jump over the dazzling quartz glyph",
  "The bold wizard quickly jumps over vexed nymphs",
  "Quick nymphs jump over the vexed wizard's bold gaze",
  "Vexing wizards jump quickly over the bold nymph's glaze",
  "Jumpy wizard fixes bold quartz nymphs swiftly",
  "Exuberant wizards jump quickly to fix the glowing nymph",
  "Five quacking zephyrs jolt my wax bed with big fun",
  "The dazzling wizard quickly jumps over the lazy nymph",
  "Quickly vexed wizards jump over the bright nymph's fog",
  "Jumping wizards vex the bold nymph with quick quartz",
  "Brightly glowing nymphs fix quick wizards' vexed quartz",
  "Wizard jumps quickly over a bright, nymph-like fog",
  "Quick zippers vex the bold wizard's jumping nymphs",
  "Vexed nymphs jump quickly over the bold wizard's fog",
  "The wizard quickly fixes bold nymphs' sparkling quartz",
  "Jumping nymphs quickly vex bold wizards' quaking fog",
  "Bright nymphs and wizards jump over the quirky fog",
  "Quick wizards jump over bold nymphs in a dazzling fog",
  "The quick wizard jumps over the bold nymph's glowing fog",
  "Glowing nymphs fix quick wizards' vibrant quartz",
  "Quick zippers fix the bold wizard's jovial nymph",
  "Vexing nymphs jump quickly over the bright wizard's fog",
  "Bright wizards jump over the bold, quick nymph's glitter",
  "The jovial wizard jumps quickly over the bright nymph's fog",
  "Quick nymphs jump over the bold wizard's glowing fence",
  "Brightly glowing wizards fix quick nymphs' vexed quartz",
  "Vexed wizards jump quickly over bright nymphs' fog",
  "Jumping nymphs and wizards fix bold quartz quickly",
  "Bright nymphs quickly fix the bold wizard's glowing quartz",
  "Quickly jumping wizards vex the bright nymph's glowing fog",
  "The bright wizard jumps quickly over the nymph's glowing fog",
  "Jumping kangaroos vex the bold wizard's quick maze.",
  "Foxy nymph jumps over the bold wizard's quick maze.",
  "Wizard swiftly jumps over the bold, vexing nymph's glow.",
  "Bright quartz gems fix the lazy wizard's jump.",
  "Quick brown nymphs jump over the bold wizard's fog.",
  "The quick wizard jumps over a bold, vexing nymph.",
  "Sly wizard jumps over the bold nymph's quick maze.",
  "Jumping wizards vex the bold nymph's quick maze.",
  "Quartz phoenix jumps, vexing bold wizard quickly.",
  "Vibrant phoenix jumps over the bold wizard's maze.",
  "A bold wizard jumps over the vibrant phoenix's maze.",
  "Quickly, the bold wizard jumps over the vibrant phoenix.",
  "Vibrant phoenix jumps over the bold wizard quickly.",
  "Jumping through dark forests, quick wizards vex the nymph.",
  "The quick wizard jumps over the blazing nymph's fence.",
  "Quick nymphs overjoyed by the wizard's vibrant jump.",
  "The bold wizard jumps over the sparkling nymph's glow.",
  "Quick wizards jump over the bright, glowing nymph's fence.",
  "Bright nymphs jump quickly over the wizard's glowing maze.",
  "Wizardly jumps vex the bold, quick nymph's glow."
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