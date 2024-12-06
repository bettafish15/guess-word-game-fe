import React, { useState, useEffect } from 'react';
import { WordService } from '../services/wordService';
import { GuessResult, ResultKind, GameMode } from '../services/types';
import './WordGame.css';

const wordService = new WordService();

export const WordGame: React.FC = () => {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const [processors, setProcessors] = useState<string[]>([]);
  const [selectedProcessor, setSelectedProcessor] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.DAILY);
  const [targetWord, setTargetWord] = useState('');
  const [wordSize, setWordSize] = useState(5);
  const [seed, setSeed] = useState<number | undefined>();
  const [guessCount, setGuessCount] = useState(0);
  const [guessHistory, setGuessHistory] = useState<GuessResult[][]>([]);

  useEffect(() => {
    loadProcessors();
  }, []);

  const loadProcessors = async () => {
    try {
      const availableProcessors = await wordService.getProcessors();
      setProcessors(availableProcessors);
      if (availableProcessors.length > 0) {
        setSelectedProcessor(availableProcessors[0]);
      }
    } catch (err) {
      setError('Failed to load processors');
    }
  };

  const handleProcessorChange = async (name: string) => {
    try {
      await wordService.setProcessor(name);
      setSelectedProcessor(name);
      resetGame();
    } catch (err) {
      setError('Failed to switch processor');
    }
  };

  const resetGame = (e?: any) => {
    e?.preventDefault();
    setIsCorrect(false);
    setGuess('');
    setGuessCount(0);
    setGuessHistory([]);
    if (gameMode === GameMode.WORD) {
      setTargetWord('');
    }
    setError('');
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.length !== wordSize) {
      setError(`Guess must be ${wordSize} letters`);
      return;
    }

    if (gameMode === GameMode.WORD && !targetWord) {
      setError('Please enter a target word');
      return;
    }

    try {
      let result: GuessResult[];
      switch (gameMode) {
        case GameMode.DAILY:
          result = await wordService.guessDaily(guess, wordSize);
          break;
        case GameMode.RANDOM:
          result = await wordService.guessRandom(guess, wordSize, seed);
          break;
        case GameMode.WORD:
          result = await wordService.guessWord(targetWord, guess);
          break;
        default:
          throw new Error('Invalid game mode');
      }
      setGuessHistory(prev => [...prev, result]);
      setGuessCount(prev => prev + 1);
      setError('');

      const allCorrect = result.every(r => r.result === ResultKind.CORRECT);
      setIsCorrect(allCorrect);

      if (allCorrect) {
        setGuess('');
      }
    } catch (err) {
      setError('Failed to submit guess');
    }
  };

  const getLetterClassName = (result?: ResultKind) => {
    if (!result) return 'letter';
    switch (result) {
      case ResultKind.CORRECT:
        return 'letter correct';
      case ResultKind.PRESENT:
        return 'letter present';
      case ResultKind.ABSENT:
        return 'letter absent';
      default:
        return 'letter';
    }
  };

  return (
    <div className="game-container">
      <h1>Word Guessing Game</h1>

      <div className="mode-selector">
        <label>
          Game Mode:
          <select
            value={gameMode}
            onChange={(e) => handleModeChange(e.target.value as GameMode)}
            disabled={isCorrect}
          >
            <option value={GameMode.DAILY}>Daily Word</option>
            <option value={GameMode.RANDOM}>Random Word</option>
            <option value={GameMode.WORD}>Specific Word</option>
          </select>
        </label>
      </div>

      <div className="processor-selector">
        <label>
          Select Processor:
          <select
            value={selectedProcessor}
            onChange={(e) => handleProcessorChange(e.target.value)}
            disabled={isCorrect}
          >
            {processors.map(processor => (
              <option key={processor} value={processor}>
                {processor}
              </option>
            ))}
          </select>
        </label>
      </div>

      {gameMode === GameMode.DAILY && (
        <div className="game-options">
          <label>
            Word Size:
            <input
              type="number"
              min="3"
              max="10"
              value={wordSize}
              onChange={(e) => setWordSize(Number(e.target.value))}
            />
          </label>
        </div>
      )}

      {gameMode === GameMode.RANDOM && (
        <div className="game-options">
          <label>
            Word Size:
            <input
              type="number"
              min="3"
              max="10"
              value={wordSize}
              onChange={(e) => setWordSize(Number(e.target.value))}
              disabled={isCorrect}
            />
          </label>
          <label>
            Seed (optional):
            <input
              type="number"
              value={seed || ''}
              onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Random seed"
              disabled={isCorrect}
            />
          </label>
        </div>
      )}

      {gameMode === GameMode.WORD && (
        <div className="target-word-input">
          <label>
            Target Word:
            <input
              type="password"
              value={targetWord}
              onChange={(e) => {
                setTargetWord(e.target.value.toUpperCase())
                setWordSize(e.target.value.length)
              }}
              placeholder="Enter target word"
              disabled={isCorrect}
            />
          </label>
        </div>
      )}

      <div className="guess-count">
        Attempts: {guessCount}
      </div>

      {isCorrect && (
        <div className="success-message">
          🎉 Congratulations! You've guessed the word correctly in {guessCount} {guessCount === 1 ? 'try' : 'tries'}! 🎉
        </div>
      )}

      <form onSubmit={handleSubmit} className="guess-form">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          maxLength={wordSize}
          placeholder={`Enter ${wordSize}-letter guess`}
          className="guess-input"
          disabled={isCorrect}
        />
        {!isCorrect ? (
          <button type="submit" className="submit-button">
            Guess
          </button>
        ) : (
          <button type="button" className="play-again-button" onClick={resetGame}>
            Play Again
          </button>
        )}
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {guessHistory.map((guess, attemptIndex) => (
          <div key={attemptIndex} className="word-grid">
            {guess.map((result, letterIndex) => (
              <div key={letterIndex} className={getLetterClassName(result.result)}>
                {result.guess}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
