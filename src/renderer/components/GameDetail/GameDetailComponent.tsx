import React, { useEffect, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useStore from "../../actions/state";
import { ipcRenderer } from "electron";
import useTranslation from "../../i18n/I18nService";

interface IGameDetailProps {
  titleId: string;
}

const GameDetailComponent = (props: IGameDetailProps) => {
  const { titleId } = props;
  const [clearCurrentGameAction] = useStore(state => [state.clearCurrentGameAction]);
  const [data, setData]: [{ img: string, title: string, titleId: string }, Function] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    ipcRenderer.invoke("build-metadata-from-titleId", titleId).then(d => setData(d));
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
      <Grid container mt={0}>
        <Grid item xs={2}>
          <img loading="lazy" referrerPolicy="no-referrer" style={{ border: "5px solid #222" }} width="100%" src={data.img} alt=""/>
        </Grid>
        <Grid item xs={3} p={1} pl={2}>
          <p style={{ marginTop: 0 }}><Button variant="contained" fullWidth>{t("openShaderDir")}</Button></p>
          <p><Button variant="contained" fullWidth>{t("openModsDir")}</Button></p>
          <p><Button variant="contained" fullWidth>{t("dlMods")}</Button></p>
          <p><Button variant="contained" fullWidth>{t("dlSave")}</Button></p>
        </Grid>
        <Grid item xs={7}>
          <p style={{ textAlign: "center" }}>Something here about shaders</p>
        </Grid>
      </Grid>
    </div>
  );
};

export default GameDetailComponent;
