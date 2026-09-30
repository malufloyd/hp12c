import { Calculator } from './engine/calculator.js';
import './engine/all-ops.js';

export const STORAGE_KEY = 'hp12c.state.v1';

export function load(storage) {
  let raw = null;
  try { raw = storage.getItem(STORAGE_KEY); } catch { raw = null; }
  if (raw === null || raw === undefined) return new Calculator();
  try { return Calculator.deserialize(raw); }
  catch { const c = new Calculator(); c.state.error = 'Pr'; return c; }
}

export function save(storage, calc) {
  try { storage.setItem(STORAGE_KEY, calc.serialize()); } catch { /* quota / private mode: ignore */ }
}
