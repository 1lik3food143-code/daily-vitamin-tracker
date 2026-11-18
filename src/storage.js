const STORAGE_KEY = 'daily-vitamin-tracker';
const sampleItems = [
  { id: 1, vitamin: 'Vitamin A', foods: ['Sweet potatoes', 'Carrots', 'Spinach'] },
  { id: 2, vitamin: 'Vitamin C', foods: ['Oranges', 'Bell peppers', 'Strawberries'] },
  { id: 3, vitamin: 'Vitamin D', foods: ['Eggs', 'Salmon', 'Fortified milk'] },
  { id: 4, vitamin: 'Iron', foods: ['Beans', 'Lentils', 'Spinach'] },
];
export function loadTracker() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { entries: sampleItems }; } catch { return { entries: sampleItems }; } }
export function saveTracker(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
