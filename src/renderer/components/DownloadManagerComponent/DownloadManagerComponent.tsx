import React from "react";
import './downloadmanager.css';
import { Button, LinearProgress } from "@mui/material";
import useTranslation from "../../i18n/I18nService";
import useStore from "../../actions/state";

const DownloadManagerComponent = () => {
  const [isExpended, setIsExpended] = React.useState(true);
  const { t } = useTranslation();

  const [dlManagerFiles] = useStore(state => [state.dlManagerFiles]);

  if (dlManagerFiles.length === 0) {
    return null;
  }

  return (
    <div className="download-manager">
      <header className="download-manager-title">
        <Button
          fullWidth
          color="info"
          onClick={() => setIsExpended(!isExpended)}
        >
          { t('downloadManager') }
        </Button>
      </header>
      {
        isExpended && (
          <>
            <section className="download-manager-content">
              {
                dlManagerFiles.map(dlFile => (
                  <div className="download-manager-item">
                    <div>
                      <p style={{ margin: 0, marginBottom: 5 }}><small>{dlFile.filename} | {dlFile.downloadSpeed} MB/s</small></p>
                      <LinearProgress variant="buffer" value={dlFile.progress} valueBuffer={0} />
                    </div>
                  </div>
                ))
              }
            </section>
          </>
        )
      }
    </div>
  );
}

export default DownloadManagerComponent;
