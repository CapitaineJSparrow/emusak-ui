import "./setting.css";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useTranslation from "../../i18n/I18nService";
import { invokeIpc } from "../../utils";
import useStore from "../../actions/state";

const SettingComponent = () => {
  const [open, setOpen] = React.useState(false);
  const [proxy, setProxy] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setProxy(useStore.getState().settings.proxy);
  }, [useStore.getState().settings.proxy]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    await invokeIpc("set-proxy", proxy);
    setOpen(false);
  };

  return (
    <div>
      <Button
        style={{ fill: "#fff" }}
        onClick={() => setOpen(!open)}
      >
        <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path></svg>
      </Button>
      {
        <Dialog open={open} fullWidth onClose={handleClose} className="setting-dialog">
          <DialogTitle>{t("settings")}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t("proxy")}
              variant="standard"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t("cancel")}</Button>
            <Button onClick={handleSave} variant="contained">{t("save")}</Button>
          </DialogActions>
        </Dialog>
      }
    </div>
  );
};

export default SettingComponent;
