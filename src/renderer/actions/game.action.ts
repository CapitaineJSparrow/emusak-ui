import { SetState } from "zustand/vanilla";

export interface IGameAction {
  currentGame?: string,
  setCurrentGameAction: (id: string) => void,
  clearCurrentGameAction: () => void,
}

const createGameSlice = (set: SetState<IGameAction>): IGameAction => ({
  currentGame: null,
  setCurrentGameAction: (currentGame: string) => set({ currentGame }),
  clearCurrentGameAction: () => set({ currentGame: null })
});

export default createGameSlice;
