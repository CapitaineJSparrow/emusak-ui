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
import i18n_br from "./i18n/br.json";
import i18n_de from "./i18n/de.json";
import i18n_it from "./i18n/it.json";

import TitleBarComponent from "./components/TitleBarComponent/TitleBarComponent";
import NavBarComponent from "./components/NavBarComponent/NavBarComponent";
import TOSComponent from "./components/TOSComponent/TOSComponent";
import AlertComponent from "./components/AlertComponent/AlertComponent";
import DownloadManagerComponent from "./components/DownloadManagerComponent/DownloadManagerComponent";
import { ipcRenderer } from "electron";
import UpdateComponent from "./components/UpdateComponent/UpdateComponent";
import { LS_KEYS } from "../types";
import DownloadSaveComponent from "./components/DownloadSaveComponent/DownloadSaveComponent";
import DownloadModComponent from "./components/DownloadModComponent/DownloadModComponent";

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
      br: { translation: i18n_br },
      de: { translation: i18n_de },
      it: { translation: i18n_it },
    },
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

const App = () => {
  const [isAppInitialized, bootstrapAppAction, openAlertAction] = useStore(state => [state.isAppInitialized, state.bootstrapAppAction, state.openAlertAction]);
  const [downloadState, setDownloadState] = useState(null);

  // Hack, due to tree checking, if Swal is not present the theme is not applied for further calls, need better solution
  // eslint-disable-next-line no-constant-condition
  if (false) {
    Swal.fire({ icon: "success", title: "" });
  }

  const onUpdateAvailable = () => setDownloadState("downloading");
  const onUpdateDownloaded = () => () => setDownloadState("downloaded");

  useEffect(() => {
    bootstrapAppAction();
    ipcRenderer.on("update-available", onUpdateAvailable);
    ipcRenderer.on("update-downloaded", onUpdateDownloaded);
    openAlertAction("info", "Thanks for joining the beta. If something is not working, please report it on the Github as issue.");

    return () => {
      ipcRenderer.removeListener("update-available", onUpdateAvailable);
      ipcRenderer.removeListener("update-downloaded", onUpdateDownloaded);
    };
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline>
        <TitleBarComponent />
        <NavBarComponent />
        <AlertComponent />
        <DownloadManagerComponent />
        <DownloadSaveComponent />
        <DownloadModComponent />
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
