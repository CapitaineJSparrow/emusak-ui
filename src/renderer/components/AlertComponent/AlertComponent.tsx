import React, { useEffect } from "react";
import { Alert, AlertColor, Button, Snackbar } from "@mui/material";
import useStore from "../../actions/state";
import { useTranslation } from "../../i18n/I18nService";
import { ipcRenderer } from "electron";

let timeoutInstance: ReturnType<typeof setTimeout> = null;

const AlertComponent = () => {
  const { t } = useTranslation();
  const [alertMessage, isAlertOpened, closeAlertAction, alertKind, alertClosable] = useStore(state => [
    state.alertMessage,
    state.isAlertOpened,
    state.closeAlertAction,
    state.alertKind,
    state.alertClosable
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
        <Alert
          onClose={alertClosable ? closeAlertAction : undefined}
          severity={alertKind as AlertColor}
          sx={{ width: '100%' }}
          action={
            !alertClosable && (
              <Button onClick={() => {
                ipcRenderer.send('cancel-download')
                closeAlertAction()
              }} color="inherit" size="small">
                Cancel
              </Button>
            )
          }
        >
          { t(alertMessage as any) }
        </Alert>
      </Snackbar>
    </div>
  )
}

export default AlertComponent;
