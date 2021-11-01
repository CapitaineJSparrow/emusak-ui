import { PartialState, SetState } from "zustand/vanilla";
import { AlertColor } from "@mui/material";

export interface IAlert {
  alertMessage: string,
  isAlertOpened: boolean,
  alertKind: AlertColor,
  openAlertAction: (alertKind: AlertColor, alertMessage: string) => PartialState<IAlert>,
  closeAlertAction: () => PartialState<IAlert>
}

const createAlertSlice = (set: SetState<IAlert>) => ({
  alertMessage: '',
  isAlertOpened: false,
  alertKind: 'success',
  closeAlertAction: () => set({ isAlertOpened: false, alertMessage: '' }),
  openAlertAction: (alertKind: AlertColor, alertMessage: string) => set({ alertKind, alertMessage, isAlertOpened: true })
});

export default createAlertSlice;
