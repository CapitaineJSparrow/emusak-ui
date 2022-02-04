import React, { useEffect, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useStore from "../../actions/state";
import { ipcRenderer } from "electron";

interface IGameDetailProps {
  titleId: string;
}

const GameDetailComponent = (props: IGameDetailProps) => {
  const { titleId } = props;
  const [clearCurrentGameAction] = useStore(state => [state.clearCurrentGameAction]);
  const [data, setData]: [{ img: string, title: string, titleId: string, screenshots: string[] }, Function] = useState(null);

  useEffect(() => {
    if (data?.screenshots?.length) {
      return null;
    }

    ipcRenderer.invoke("build-metadata-from-titleId", titleId).then(d => setData(d));
  }, [titleId]);

  const renderSlider = () => {
    return (
      <Box p={3} pt={0} style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="slider">

          {
            data.screenshots.map((screenshot, index) => <a key={`#slide-bullet-${index + 1}`} href={`#slide-${index + 1}`}>{index + 1}</a>)
          }

          <div className="slides">
            {
              data.screenshots.map((screenshot, index) => (
                <div key={`#slide-item-${index + 1}`} id={`slide-${index + 1}`}>
                  <img style={{ border: "5px solid #222" }} src={screenshot} alt=""/>
                </div>
              ))
            }
          </div>
        </div>
      </Box>
    );
  };

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
          <p style={{ marginTop: 0 }}><Button variant="contained" fullWidth>Open shader cache folder</Button></p>
          <p><Button variant="contained" fullWidth>Open mods directory</Button></p>
          <p><Button variant="contained" fullWidth>Download mod</Button></p>
          <p><Button variant="contained" fullWidth>Download save</Button></p>
        </Grid>
        <Grid item xs={7}>
          <p style={{ textAlign: "center" }}>Something here about shaders</p>
        </Grid>
      </Grid>
      <br/>
      {
        renderSlider()
      }
    </div>
  );
};

export default GameDetailComponent;
