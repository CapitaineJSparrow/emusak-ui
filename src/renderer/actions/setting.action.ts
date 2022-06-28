import { SetState } from "zustand/vanilla";
import useStore from "./state";
import { invokeIpc } from "../utils";

export interface ISetting {
  setProxyAction: (proxy: string) => void,
}

const createSettingSlice = (set: SetState<ISetting>): ISetting => ({
  setProxyAction: async (proxy) => {
    const settings = useStore.getState().settings;
    useStore.setState({
      settings: {
        ...settings,
        proxy,
      },
    });
    return await invokeIpc("set-proxy", proxy);
  },
});

export default createSettingSlice;
