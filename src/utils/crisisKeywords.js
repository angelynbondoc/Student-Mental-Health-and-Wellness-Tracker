// src/utils/crisisKeywords.js
// Shared crisis keyword list + detection helper.
// Used by useCreatePost (auto-flag) and ModeratorView (highlight).

export const CRISIS_KEYWORDS = [
  // Direct suicidal ideation
  'suicide', 'suicidal', 'kill myself', 'end my life', 'end it all',
  'want to die', 'wanna die', 'wish i was dead', 'better off dead',
  'not worth living', 'no reason to live', 'cant go on', "can't go on",
  'dont want to be here', "don't want to be here", 'take my own life',

  // Self-harm
  'self harm', 'self-harm', 'cut myself', 'hurt myself', 'hurting myself',

  // Hopelessness / crisis signals
  'no point anymore', 'give up on life', 'goodbye forever',
  'final goodbye', 'nobody would miss me', 'everyone is better without me',

  // Filipino/Taglish variants common in PH
  'gusto ko nang mamatay', 'ayaw ko na mabuhay', 'pagpapakamatay',
  'papatayin ko sarili ko',
];

/**
 * Returns true if the given text contains any crisis keyword.
 * Case-insensitive, handles extra whitespace.
 */
export function containsCrisisKeywords(text = '') {
  const lower = text.toLowerCase().replace(/\s+/g, ' ').trim();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Returns the first matched keyword, or null.
 */
export function getMatchedKeyword(text = '') {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.find((kw) => lower.includes(kw.toLowerCase())) ?? null;
}