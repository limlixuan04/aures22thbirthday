import { describe, expect, it } from 'vitest';
import { splitSentences } from './Sentences';

describe('splitSentences', () => {
  it('splits on sentence ends and keeps trailing emojis with their sentence', () => {
    expect(splitSentences('Remember these words. You’ll know when to say them.')).toEqual(['Remember these words.', 'You’ll know when to say them.']);
    expect(splitSentences('Big brain! Almost as good as I am 🥱')).toEqual(['Big brain!', 'Almost as good as I am 🥱']);
    expect(splitSentences('Correct! 🎉 Next one.')).toEqual(['Correct! 🎉', 'Next one.']);
    expect(splitSentences('One sentence only')).toEqual(['One sentence only']);
  });
});
