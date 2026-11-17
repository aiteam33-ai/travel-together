// Word lists for the front-end safety gate. Matching is a simple
// case-insensitive substring check — the real backend will use a proper
// classifier; this is a conservative placeholder so the UI path exists.

export const DISTRESS_WORDS = [
  // English
  "suicide", "kill myself", "end my life", "self harm", "self-harm", "cutting myself",
  "want to die", "no reason to live", "hurt myself",
  // Hinglish
  "khudkushi", "khatam kar", "jeena nahi chahta", "jeena nahi chahti", "marna chahta",
  "marna chahti", "khud ko nuksan",
  // Hindi
  "आत्महत्या", "खुद को नुकसान", "जीना नहीं चाहता", "जीना नहीं चाहती", "मरना चाहता",
];

export const BLOCKED_TOPIC_WORDS = {
  death: ["death", "die", "dying", "maut", "मृत्यु", "मौत"],
  illness: ["cancer", "disease", "illness", "bimari", "बीमारी", "will i get sick"],
  pregnancy: ["pregnant", "pregnancy", "garbhavati", "गर्भवती"],
  court: ["court case", "lawsuit", "legal case", "adalat", "अदालत", "मुकदमा"],
  investment: ["stock price", "invest in", "share market", "crypto price", "shares kharidu", "निवेश"],
};

export function containsDistressSignal(text) {
  const lower = (text || "").toLowerCase();
  return DISTRESS_WORDS.some((w) => lower.includes(w.toLowerCase()));
}

export function matchedBlockedTopic(text) {
  const lower = (text || "").toLowerCase();
  for (const [topic, words] of Object.entries(BLOCKED_TOPIC_WORDS)) {
    if (words.some((w) => lower.includes(w.toLowerCase()))) return topic;
  }
  return null;
}
