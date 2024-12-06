import { GuessResult } from './types';

export class WordService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  async guessDaily(guess: string, size: number = 5): Promise<GuessResult[]> {
    const response = await fetch(`${this.baseUrl}/guess/daily?guess=${guess}&size=${size}`);
    return response.json();
  }

  async guessRandom(guess: string, size: number = 5, seed?: number): Promise<GuessResult[]> {
    const url = new URL(`${this.baseUrl}/guess/random`);
    url.searchParams.append('guess', guess);
    url.searchParams.append('size', size.toString());
    if (seed) url.searchParams.append('seed', seed.toString());

    const response = await fetch(url.toString());
    return response.json();
  }

  async guessWord(word: string, guess: string): Promise<GuessResult[]> {
    const response = await fetch(`${this.baseUrl}/guess/word/${word}?guess=${guess}`);
    return response.json();
  }

  async getProcessors(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/processors`);
    return response.json();
  }

  async setProcessor(name: string): Promise<void> {
    await fetch(`${this.baseUrl}/processor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
  }
}
