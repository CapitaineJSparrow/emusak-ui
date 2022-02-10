import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Grid, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useStore from "../../actions/state";
import { ipcRenderer } from "electron";
import useTranslation from "../../i18n/I18nService";
import { GithubLabel } from "../../../types";

interface IGameDetailProps {
  titleId: string;
  dataPath: string;
}

const GameDetailComponent = (props: IGameDetailProps) => {
  const { titleId, dataPath } = props;
  const [clearCurrentGameAction, currentEmu] = useStore(state => [state.clearCurrentGameAction, state.currentEmu]);
  const [data, setData]: [{ img: string, title: string, titleId: string }, Function] = useState(null);
  const [compat, setCompat] = useState<GithubLabel[]>(null);
  const { t } = useTranslation();

  useEffect(() => {
    ipcRenderer.invoke("build-metadata-from-titleId", titleId).then(d => setData(d));
    currentEmu === "ryu" && ipcRenderer.invoke("getRyujinxCompatibility", titleId).then(r => {
      if (!r.items) return;
      const item = (r.items as any[]).find(i => i.state === "open");
      item && setCompat(item.labels);
    });
  }, [titleId]);

  const renderCompatibilityData = () => (
    <Grid container mb={2} sx={{ display: "flex", alignItems: "center" }}>
      <Grid item xs={10} pr={2}>
        {
          (compat && compat.length > 0)
            ? (
              <span>
                {

                  compat.map(c => (
                    <Tooltip title={c.description} arrow enterDelay={0}>
                      <Chip variant="outlined" color="primary" size="small" style={{ marginRight: 8 }} key={c.name} label={c.name} />
                    </Tooltip>
                  ))
                }
              </span>
            )
            : (<Alert severity="warning">{t("noCompatData")}</Alert>)
        }
      </Grid>
      <Grid item xs={2}>
        <a
          href={`https://github.com/Ryujinx/Ryujinx-Games-List/issues?q=is%3Aissue+is%3Aopen+${data.titleId}`}
          target="_blank"
          className="no-blank-icon"
        >
          <Button variant="outlined" fullWidth>{t("addCompatReport")}</Button>
        </a>
      </Grid>
    </Grid>
  );

  if (!data) {
    return null;
  }

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button onClick={clearCurrentGameAction} size="small" variant="outlined"><ArrowBackIcon /></Button>
        {
          data && (
            <h3 style={{ marginLeft: 12 }}>{data.title} (<small>{data.titleId}</small>)</h3>
          )
        }
      </Box>

      {
        renderCompatibilityData()
      }

      <Grid container mt={0}>
        <Grid item xs={2}>
          <img loading="lazy" referrerPolicy="no-referrer" style={{ border: "5px solid #222" }} width="100%" src={data.img} alt=""/>
        </Grid>
        <Grid item xs={4} p={1} pl={2}>
          <p style={{ marginTop: 0 }}><Button onClick={() => ipcRenderer.invoke("openFolderForGame", titleId, "shaders", dataPath)} variant="contained" fullWidth>{t("openShaderDir")}</Button></p>
          <p><Button onClick={() => ipcRenderer.invoke("openFolderForGame", titleId, "mods", dataPath)} variant="contained" fullWidth>{t("openModsDir")}</Button></p>
          <p><Button variant="contained" fullWidth>{t("dlMods")}</Button></p>
          <p><Button variant="contained" fullWidth>{t("dlSave")}</Button></p>
        </Grid>
        <Grid item xs={6}>
          <p style={{ textAlign: "center" }}>Something here about shaders</p>
        </Grid>
      </Grid>
    </div>
  );
};

export default GameDetailComponent;
