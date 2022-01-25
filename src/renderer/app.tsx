import * as React from "react";
import { useEffect } from "react";
import * as ReactDOM from "react-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
import TitleBarComponent from "./components/TitleBarComponent/TitleBarComponent";
import NavBarComponent from "./components/NavBarComponent/NavBarComponent";
import TOSComponent from "./components/TOSComponent/TOSComponent";
import AlertComponent from "./components/AlertComponent/AlertComponent";
import DownloadManagerComponent from "./components/DownloadManagerComponent/DownloadManagerComponent";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#448AFF"
    }
  },
});

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: i18n_en
      }
    },
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

const App = () => {
  const [isAppInitialized, bootstrapAppAction] = useStore(state => [state.isAppInitialized, state.bootstrapAppAction]);

  useEffect(() => {
    bootstrapAppAction();
  }, []);

  // Hack, due to tree checking, if Swal is not present the theme is not applied for further calls, need better solution
  // eslint-disable-next-line no-constant-condition
  if (false) {
    Swal.fire({ icon: "success", title: "" });
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline>
        <TitleBarComponent />
        <NavBarComponent />
        <AlertComponent />
        <DownloadManagerComponent />
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
