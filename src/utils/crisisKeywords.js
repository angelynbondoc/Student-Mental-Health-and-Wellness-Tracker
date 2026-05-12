// src/utils/crisisKeywords.js
// Shared crisis keyword list + detection helper.
// Used by useCreatePost (auto-flag) and ModeratorView (highlight).

export const CRISIS_KEYWORDS = [
  // Direct suicidal ideation (English)
  'suicide', 'suicidal', 'kill myself', 'end my life', 'end it all',
  'want to die', 'wanna die', 'wish i was dead', 'better off dead',
  'not worth living', 'no reason to live', 'cant go on', "can't go on",
  'dont want to be here', "don't want to be here", 'take my own life',
  'commit suicide', 'ready to die', 'die tonight', 'make it stop',
  'tired of living', 'sleep forever', 'never wake up', 'want to disappear',
  'erase myself', 'fade away', 'do not want to live', 'would be better dead',
  'kms', 'killing myself', 'ready for the end', 'want this to end',

  // Self-harm & Methods (English)
  'self harm', 'self-harm', 'cut myself', 'hurt myself', 'hurting myself',
  'jump off', 'jumping off', 'overdose', 'swallow pills', 'take all my pills',
  'hang myself', 'hanging myself', 'shoot myself', 'drink bleach',
  'slit my wrists', 'bleed out', 'starve myself', 'burn myself',
  'punish myself', 'intentional overdose', 'ending it with pills',

  // Hopelessness / crisis signals (English)
  'no point anymore', 'give up on life', 'goodbye forever',
  'final goodbye', 'nobody would miss me', 'everyone is better without me',
  'life is pointless', 'giving up', 'cant take this anymore',
  "can't take this anymore", 'done with everything', 'burden to everyone',
  'burden to my family', 'they would be happier without me',
  'world is better without me', 'no hope left', 'whats the point of living',
  "what's the point of living", 'end my suffering', 'nobody cares if i die',
  'im done trying', "i'm done trying", 'nothing left for me',

  // Direct suicidal ideation (Filipino)
  'gusto ko nang mamatay', 'ayaw ko na mabuhay', 'pagpapakamatay',
  'papatayin ko sarili ko', 'magpakamatay', 'tapusin ang buhay',
  'kitilin ang buhay', 'sawa na mabuhay', 'ayoko na sa mundo',
  'gusto ko nang mawala', 'matulog habambuhay', 'sana mamatay na ako',
  'kunin na sana ako', 'wala na kong ganang mabuhay',
  'ayoko na gumising', 'gusto ko na magpahinga habambuhay',

  // Self-harm & Methods (Filipino)
  'magbigti', 'mag-bigti', 'lason', 'lasunin ang sarili', 'tatalon ako',
  'tatalon sa building', 'laslas', 'maglaslas', 'mag-laslas',
  'barilin ang sarili', 'uminom ng lason', 'sasaktan ang sarili',
  'hihiwain ang pulso', 'magpapasagasa',

  // Hopelessness / crisis signals (Filipino)
  'wala nang pag-asa', 'pabigat ako', 'sana hindi na lang ako pinanganak',
  'mas mabuti pang mamatay', 'sukong suko na ako',
  'pagod na pagod na ako mabuhay', 'wala na akong silbi',
  'wala nang dahilan para mabuhay', 'tapusin na natin to',
  'paalam sa inyong lahat', 'huling paalam', 'katapusan ko na',
  'wala nang bukas', 'pabigat lang ako', 'walang kwentang tao',
  'masaya sila pag wala ako', 'suko na ako sa buhay',

  // Taglish / Slang / Online Idioms
  'tapusin ko na life ko', 'end game na', 'ayoko na mag exist',
  'gusto ko na mag laho', 'quit na sa life', 'pagod na me',
  'di ko na keri', 'give up na ko', 'rest in peace to me',
  'sana kunin na ko ni lord', 'lord kunin mo na ako',
  'ready na ko mamatay', 'ayoko na i-continue', 'log out na sa earth',
  'guguhit na', 'game over na', 'delete ko na sarili ko',
  'uninstall life', 'suko na me', 'wala na kong will to live',
  'ubos na will to live ko', 'ending it all na', 'pabigat era',
  'want ko na mamatay', 'suicide na lang', 'di na kaya ng mental health',
  'bibigay na ko', 'offing myself', 'yeet myself', 'unalive myself',
  'unaliving myself', 'catch the bus', 'sewer slide'
];

/**
 * Returns true if the given text contains any crisis keyword.
 * Case-insensitive, handles extra whitespace.
 * 
 * Note: Optimization relies on `.toLowerCase()` applied to both
 * the search string and the array items. Ensure array items
 * remain primarily lowercased to reduce overhead if expanded.
 */
export function containsCrisisKeywords(text = '') {
  const lower = text.toLowerCase().replace(/\s+/g, ' ').trim();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Returns the first matched keyword, or null.
 * Useful for logging or moderation highlighting contexts.
 */
export function getMatchedKeyword(text = '') {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.find((kw) => lower.includes(kw.toLowerCase())) ?? null;
}