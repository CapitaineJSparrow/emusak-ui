import React, { useEffect } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CropSquareRoundedIcon from "@mui/icons-material/CropSquareRounded";
import useTranslation from "../../i18n/I18nService";
import useStore from "../../actions/state";
import MinimizeIcon from "@mui/icons-material/Minimize";
import logo from "../../resources/emusak_logo.png";

import "./titleBar.css";

const TitleBarComponent = () => {
  const { t } = useTranslation();

  const [
    version,
    getVersionAction,
    closeEmuSAKAction,
    maximizeEmuSAKAction,
    minimizeEmuSAKAction,
  ] = useStore(state => [
    state.version,
    state.getVersionAction,
    state.closeEmuSAKAction,
    state.maximizeEmuSAKAction,
    state.minimizeEmuSAKAction,
  ]);

  useEffect(() => {
    getVersionAction();
  }, []);

  return (
    <div className="title-bar">
      <div className="title-bar-icon" style={{ position: "relative", top: 6, paddingLeft: 8 }}>
        <img src={logo} height={28} alt=""/>
      </div>
      <div className="title-bar-title">
        <span>{t("emusak")} <small>- v{version} (beta)</small></span>
      </div>
      <div className="title-bar-buttons">
        <IconButton onClick={minimizeEmuSAKAction} size="small" style={{ color: "#FFF" }} color="primary" disableRipple>
          <MinimizeIcon style={{ height: 20 }} />
        </IconButton>
        <IconButton onClick={maximizeEmuSAKAction} size="small" style={{ color: "#FFF" }} color="primary" disableRipple>
          <CropSquareRoundedIcon style={{ height: 20 }} />
        </IconButton>
        <IconButton onClick={closeEmuSAKAction} size="small" style={{ color: "#FFF" }} color="primary" className="title-bar-close-button" disableRipple>
          <CloseIcon style={{ height: 20 }} />
        </IconButton>
      </div>
    </div>
  );
};

export default TitleBarComponent;
