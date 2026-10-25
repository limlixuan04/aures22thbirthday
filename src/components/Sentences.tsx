/**
 * Puts each sentence on its own line, so a two-sentence message reads as
 * two tidy rows instead of the second sentence wrapping halfway.
 */
export function splitSentences(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur: string[] = [];
  const endsSentence = (w: string) => /[.!?…][”’"')]*$/.test(w);
  const isEmoji = (w: string) => /^\p{Extended_Pictographic}/u.test(w);
  const startsSentence = (w: string) => /^[“"'(¡¿]?[\p{Lu}0-9]/u.test(w) || isEmoji(w);
  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    // keep emojis that follow a sentence end attached to it
    while (endsSentence(words[i]) && i + 1 < words.length && isEmoji(words[i + 1]) && (i + 2 >= words.length || startsSentence(words[i + 2]))) {
      cur.push(words[++i]);
    }
    const prev = cur[cur.length - 1];
    const sentenceDone = endsSentence(prev) || (isEmoji(prev) && cur.length > 1 && endsSentence(cur[cur.length - 2]));
    if (sentenceDone && i + 1 < words.length && startsSentence(words[i + 1]) && !isEmoji(words[i + 1])) {
      out.push(cur.join(' '));
      cur = [];
    }
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
}

export function Sentences({ text, className = '' }: { text: string; className?: string }) {
  const parts = splitSentences(text);
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} className={`block ${className}`}>
          {p}
        </span>
      ))}
    </>
  );
}
