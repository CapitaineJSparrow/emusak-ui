import React, { useEffect } from "react";
import { Alert, AlertColor, Snackbar } from "@mui/material";
import useStore from "../../actions/state";
import { useTranslation } from "react-i18next";

let timeoutInstance: ReturnType<typeof setTimeout> = null;

const AlertComponent = () => {
  const { t } = useTranslation();
  const [alertMessage, isAlertOpened, closeAlertAction, alertKind] = useStore(state => [
    state.alertMessage,
    state.isAlertOpened,
    state.closeAlertAction,
    state.alertKind,
  ]);

  useEffect(() => {
    if (isAlertOpened) {
      // Don't use autoHide feature from snackbar component, because for some reason when you click anywhere on the page the snackbar close
      clearTimeout(timeoutInstance); // Clear previous timer
      timeoutInstance = setTimeout(() => closeAlertAction(), 10 * 1000);
    }
  }, [isAlertOpened]);

  return (
    <div>
      <Snackbar
        open={isAlertOpened}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
      >
        <Alert onClose={closeAlertAction} severity={alertKind as AlertColor} sx={{ width: '100%' }}>
          { t(alertMessage) }
        </Alert>
      </Snackbar>
    </div>
  )
}

export default AlertComponent;
