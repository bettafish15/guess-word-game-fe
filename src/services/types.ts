export enum ResultKind {
  ABSENT = 'absent',
  PRESENT = 'present',
  CORRECT = 'correct'
}

export interface GuessResult {
  slot: number;
  guess: string;
  result: ResultKind;
}

export enum GameMode {
  DAILY = 'daily',
  RANDOM = 'random',
  WORD = 'word'
}
