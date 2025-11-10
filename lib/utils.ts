const ADJECTIVES = [
  "happy",
  "clever",
  "bright",
  "swift",
  "calm",
  "brave",
  "wise",
  "cool",
];

const NOUNS = [
  "panda",
  "tiger",
  "eagle",
  "dolphin",
  "falcon",
  "phoenix",
  "dragon",
  "wolf",
];

export function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective}${noun}`;
}

export function getUserColor(userId: string) {
  const COLORS = [
    "#E879F9", // Pink
    "#FBBF24", // Yellow
    "#34D399", // Green
    "#60A5FA", // Blue
    "#F87171", // Red
    "#A78BFA", // Purple
  ];

  const index = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[index % COLORS.length];
}
