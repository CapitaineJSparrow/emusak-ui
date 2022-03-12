import { ipcRenderer } from "electron";
import { IPCCalls } from "../main/routes";

export const invokeIpc = <T extends keyof IPCCalls> (arg: T, ...args: any[]): IPCCalls[T] => <IPCCalls[T]> ipcRenderer.invoke(arg as string, ...args);
