// Quiz content bank. Categories map to the ideas you described:
//  - deep / life questions
//  - fun "20 questions" style
//  - truth or dare
//  - party questions
//  - "guess your partner" (image/option based)
// Each completed quiz rewards shared coins.

export type QuizType =
  | "deep"
  | "fun"
  | "truth-or-dare"
  | "party"
  | "guess-partner";

export type Question = {
  id: string;
  prompt: string;
  /** For multiple-choice / guess questions. Free-text if omitted. */
  options?: { label: string; emoji?: string }[];
};

export type Quiz = {
  id: string;
  type: QuizType;
  title: string;
  emoji: string;
  description: string;
  /** Reveal answers only after BOTH partners answer (guess/deep) vs instantly. */
  revealAfterBoth: boolean;
  reward: number; // coins earned on completion
  questions: Question[];
};

export const QUIZZES: Quiz[] = [
  {
    id: "deep-1",
    type: "deep",
    title: "Deep Talk",
    emoji: "🌙",
    description: "Questions about life, dreams and values.",
    revealAfterBoth: true,
    reward: 25,
    questions: [
      { id: "d1", prompt: "Where do you want to be in 5 years?" },
      { id: "d2", prompt: "What does your ideal weekend together look like?" },
      { id: "d3", prompt: "What's something you want us to achieve together?" },
      { id: "d4", prompt: "What makes you feel most loved?" },
    ],
  },
  {
    id: "fun-20",
    type: "fun",
    title: "20 Questions (mini)",
    emoji: "🎈",
    description: "Quick, fun rapid-fire questions.",
    revealAfterBoth: true,
    reward: 15,
    questions: [
      { id: "f1", prompt: "Beach or mountains?", options: [{ label: "Beach", emoji: "🏖️" }, { label: "Mountains", emoji: "⛰️" }] },
      { id: "f2", prompt: "Morning person or night owl?", options: [{ label: "Morning", emoji: "🌅" }, { label: "Night", emoji: "🌙" }] },
      { id: "f3", prompt: "Sweet or savory?", options: [{ label: "Sweet", emoji: "🍰" }, { label: "Savory", emoji: "🍟" }] },
      { id: "f4", prompt: "Text or call?", options: [{ label: "Text", emoji: "💬" }, { label: "Call", emoji: "📞" }] },
    ],
  },
  {
    id: "tod-1",
    type: "truth-or-dare",
    title: "Truth or Dare",
    emoji: "🎲",
    description: "Answers show instantly. No hiding! 😅",
    revealAfterBoth: false,
    reward: 20,
    questions: [
      { id: "t1", prompt: "Truth: What's your favorite memory of us so far?" },
      { id: "t2", prompt: "Dare: Send a selfie right now 📸" },
      { id: "t3", prompt: "Truth: What's a tiny thing I do that you love?" },
    ],
  },
  {
    id: "party-1",
    type: "party",
    title: "Party Mode",
    emoji: "🥳",
    description: "Playful, silly questions for a fun night.",
    revealAfterBoth: false,
    reward: 15,
    questions: [
      { id: "p1", prompt: "If we were a duo, what would our team name be?" },
      { id: "p2", prompt: "Which celebrity couple are we most like?" },
      { id: "p3", prompt: "Pick our theme song 🎵" },
    ],
  },
  {
    id: "guess-1",
    type: "guess-partner",
    title: "How well do you know me?",
    emoji: "🔮",
    description: "Guess your partner's pick. Reveal after both answer.",
    revealAfterBoth: true,
    reward: 30,
    questions: [
      {
        id: "g1",
        prompt: "My dream car is a...",
        options: [
          { label: "Porsche", emoji: "🏎️" },
          { label: "Mercedes", emoji: "🚗" },
          { label: "Tesla", emoji: "⚡" },
          { label: "Jeep", emoji: "🚙" },
        ],
      },
      {
        id: "g2",
        prompt: "My go-to game is...",
        options: [
          { label: "League of Legends", emoji: "⚔️" },
          { label: "Valorant", emoji: "🔫" },
          { label: "Minecraft", emoji: "⛏️" },
          { label: "Animal Crossing", emoji: "🍃" },
        ],
      },
      {
        id: "g3",
        prompt: "I'd pick...",
        options: [
          { label: "Strawberry", emoji: "🍓" },
          { label: "Blueberry", emoji: "🫐" },
        ],
      },
      {
        id: "g4",
        prompt: "My sport is...",
        options: [
          { label: "Golf", emoji: "⛳" },
          { label: "Tennis", emoji: "🎾" },
          { label: "Neither", emoji: "🛋️" },
        ],
      },
    ],
  },
];

export function getQuiz(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}
