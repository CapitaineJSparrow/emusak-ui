import { PartialState, SetState } from "zustand/vanilla";
import { AlertColor } from "@mui/material";

export interface IAlert {
  alertMessage: string,
  isAlertOpened: boolean,
  alertKind: AlertColor,
  openAlertAction: (alertKind: AlertColor, alertMessage: string) => PartialState<IAlert>,
  closeAlertAction: () => PartialState<IAlert>,
  alertClosable: boolean
}

//   useStore.getState().openAlertAction('info', `Downloading firmware ${percentage} % at ${downloadSpeed} MB/s`);
const createAlertSlice = (set: SetState<IAlert>) => ({
  alertMessage: '',
  isAlertOpened: false,
  alertKind: 'success',
  alertClosable: true,
  closeAlertAction: () => set({ isAlertOpened: false, alertMessage: '', alertClosable: true }),
  openAlertAction: (alertKind: AlertColor, alertMessage: string, alertClosable = true) => set({ alertKind, alertMessage, isAlertOpened: true, alertClosable })
});

export default createAlertSlice;
