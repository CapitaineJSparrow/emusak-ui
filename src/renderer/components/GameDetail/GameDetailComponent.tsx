import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Grid } from "@mui/material";
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
        (compat && compat.length > 0) && (
          <Grid container mb={2}>
            <Grid item xs={12}>
              <Alert severity="info">
                {
                  compat.map(c => (
                    <Chip size="small" style={{ marginRight: 8, backgroundColor: `#${c.color}` }} key={c.name} title={c.description} label={c.name} />
                  ))
                }
              </Alert>
            </Grid>
          </Grid>
        )
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
