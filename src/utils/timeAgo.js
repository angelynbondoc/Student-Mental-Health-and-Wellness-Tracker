// src/utils/timeAgo.js

/**
 * Calculates the relative time elapsed since a given ISO date string.
 * Ensures the date is parsed as UTC by appending 'Z' if missing,
 * preventing timezone offset bugs where recent timestamps appear hours old.
 *
 * @param {string} iso - The ISO 8601 date string to evaluate.
 * @returns {string} A formatted string representing the relative time elapsed (e.g., "5m ago", "2h ago", "1d ago").
 */
export const timeAgo = (iso) => {
  const utcString = iso.endsWith('Z') ? iso : iso + 'Z';
  const d = (Date.now() - new Date(utcString)) / 1000;
  
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  
  return `${Math.floor(d / 86400)}d ago`;
};