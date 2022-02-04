import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import i18n, { use } from "i18next";
import { initReactI18next } from "react-i18next";
import Swal from "sweetalert2";
import "./styles/swal.dark.css";

import BootstrapComponent from "./components/BootstrapComponent/BootstrapComponent";
import useStore from "./actions/state";
import RootComponent from "./components/RootComponent";

import "./styles/index.css";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// i18n
import i18n_en from "./i18n/en.json";
import i18n_ru from "./i18n/ru.json";
import TitleBarComponent from "./components/TitleBarComponent/TitleBarComponent";
import NavBarComponent from "./components/NavBarComponent/NavBarComponent";
import TOSComponent from "./components/TOSComponent/TOSComponent";
import AlertComponent from "./components/AlertComponent/AlertComponent";
import DownloadManagerComponent from "./components/DownloadManagerComponent/DownloadManagerComponent";
import { ipcRenderer } from "electron";
import UpdateComponent from "./components/UpdateComponent/UpdateComponent";
import { LS_KEYS } from "../types";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#448AFF"
    }
  },
});

const lng = localStorage.getItem(LS_KEYS.LOCALE) ?? "en";


use(initReactI18next)
  .init({
    resources: {
      en: { translation: i18n_en },
      ru: { translation: i18n_ru },
    },
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

const App = () => {
  const [isAppInitialized, bootstrapAppAction] = useStore(state => [state.isAppInitialized, state.bootstrapAppAction]);
  const [downloadState, setDownloadState] = useState(null);

  // Hack, due to tree checking, if Swal is not present the theme is not applied for further calls, need better solution
  // eslint-disable-next-line no-constant-condition
  if (false) {
    Swal.fire({ icon: "success", title: "" });
  }

  ipcRenderer.on("update-available", () => setDownloadState("downloading"));
  ipcRenderer.once("update-downloaded", () => setDownloadState("downloaded"));

  useEffect(() => {
    bootstrapAppAction();
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline>
        <TitleBarComponent />
        <NavBarComponent />
        <AlertComponent />
        <DownloadManagerComponent />
        <UpdateComponent state={downloadState} />
        { !isAppInitialized ? <BootstrapComponent /> : <RootComponent /> }
        <TOSComponent />
      </CssBaseline>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <App />,
  document.querySelector("#app")
);

export {
  i18n
};
