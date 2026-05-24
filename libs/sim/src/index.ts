export type { Grid, RuleSet } from '@conways-game-of-life/types';
export {
  createGrid,
  cloneGrid,
  getCell,
  setCell,
  toggleCell,
  clearGrid,
  randomizeGrid,
} from './lib/grid';
export { step, conwayRules } from './lib/rules/conway';
