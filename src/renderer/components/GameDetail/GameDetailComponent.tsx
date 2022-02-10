import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Grid, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useStore from "../../actions/state";
import { ipcRenderer , shell } from "electron";
import useTranslation from "../../i18n/I18nService";
import { GithubIssue, GithubLabel } from "../../../types";
import Swal from "sweetalert2";

interface IGameDetailProps {
  titleId: string;
  dataPath: string;
}

const GameDetailComponent = (props: IGameDetailProps) => {
  const { titleId, dataPath } = props;
  const [
    clearCurrentGameAction,
    currentEmu,
    saves,
    setCurrentSaveDownloadAction,
  ] = useStore(state => [
    state.clearCurrentGameAction,
    state.currentEmu,
    state.saves,
    state.setCurrentSaveDownloadAction
  ]);
  const [metaData, setMetaData]: [{ img: string, title: string, titleId: string }, Function] = useState(null);
  const [compat, setCompat] = useState<GithubLabel[]>(null);
  const { t } = useTranslation();

  const extractCompatibilityLabels = (response: GithubIssue) => {
    // Probably non 200 response from GitHub, so leave it as default value (null)
    if (!response.items) return;

    const item = (response.items).find(i => i.state === "open");
    return setCompat(item ? item.labels : []);
  };

  const handleAddReportButtonClick = async () => {
    if (compat === null) return;

    await Swal.fire({
      icon: "info",
      text: t(compat.length === 0 ? "infoNewReport" : "infoExistingReport"),
      allowOutsideClick: false
    });

    return shell.openExternal(compat.length > 0
      ? `https://github.com/Ryujinx/Ryujinx-Games-List/issues?q=is%3Aissue+is%3Aopen+${metaData.titleId}`
      : "https://github.com/Ryujinx/Ryujinx-Games-List/issues/new"
    );
  };

  useEffect(() => {
    ipcRenderer.invoke("build-metadata-from-titleId", titleId).then(d => setMetaData(d));
    currentEmu === "ryu" && ipcRenderer.invoke("getRyujinxCompatibility", titleId).then(extractCompatibilityLabels);
  }, [titleId]);

  const renderCompatibilityData = () => (
    <Grid container mb={2} sx={{ display: "flex", alignItems: "center" }}>
      <Grid item xs={12}>
        <Alert
          severity={compat.length === 0 ? "warning" : "info"}
          action={(<Button
            onClick={() => handleAddReportButtonClick()}
            variant="outlined"
            size="small"
            fullWidth
          >
            {t("addCompatReport")}
          </Button>)}
        >
          {

            compat.map(c => (
              <Tooltip key={c.name} title={c.description} arrow enterDelay={0}>
                <Chip variant="outlined" color="primary" size="small" style={{ marginRight: 8 }} label={c.name} />
              </Tooltip>
            ))
          }

          {
            compat.length === 0 && t("noCompatData")
          }
        </Alert>
      </Grid>
    </Grid>
  );

  if (!metaData) {
    return null;
  }

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button onClick={clearCurrentGameAction} size="small" variant="outlined"><ArrowBackIcon /></Button>
        {
          metaData && (
            <h3 style={{ marginLeft: 12 }}>{metaData.title} (<small>{metaData.titleId}</small>)</h3>
          )
        }
      </Box>

      {
        (compat !== null) && renderCompatibilityData()
      }

      <Grid container mt={0}>
        <Grid item xs={2}>
          <img loading="lazy" referrerPolicy="no-referrer" style={{ border: "5px solid #222" }} width="100%" src={metaData.img} alt=""/>
        </Grid>
        <Grid item xs={4} p={1} pl={2}>
          <p style={{ marginTop: 0 }}><Button onClick={() => ipcRenderer.invoke("openFolderForGame", titleId, "shaders", dataPath)} variant="contained" fullWidth>{t("openShaderDir")}</Button></p>
          <p><Button onClick={() => ipcRenderer.invoke("openFolderForGame", titleId, "mods", dataPath)} variant="contained" fullWidth>{t("openModsDir")}</Button></p>
          <p><Button variant="contained" fullWidth>{t("dlMods")}</Button></p>
          <p>
            <Button
              variant="contained"
              fullWidth
              disabled={!Object.keys(saves).map(k => k.toUpperCase()).includes(metaData.titleId.toUpperCase())}
              onClick={() => setCurrentSaveDownloadAction(metaData.titleId.toUpperCase())}
            >
              {t("dlSave")}
            </Button>
          </p>
        </Grid>
        <Grid item xs={6}>
          <p style={{ textAlign: "center" }}>Something here about shaders</p>
        </Grid>
      </Grid>
    </div>
  );
};

export default GameDetailComponent;
