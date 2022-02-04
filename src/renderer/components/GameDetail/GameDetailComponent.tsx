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
    ipcRenderer.invoke("build-metadata-from-titleId", titleId).then(d => {
      console.log(d);
      setData(d);
    });
  }, [titleId]);

  if (!data) {
    return null;
  }

  return (
    <div>
      <Button onClick={clearCurrentGameAction} size="small" variant="outlined"><ArrowBackIcon /></Button>
      <Grid container mt={3}>
        <Grid item xs={3}>
          <img loading="lazy" referrerPolicy="no-referrer" style={{ border: "5px solid #222" }} width="100%" src={data.img} alt=""/>
        </Grid>
      </Grid>
      {
        data.screenshots.length > 0 && (
          <Box pb={3} style={{ maxWidth: 900, margin: "0 auto" }}>
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
        )
      }
    </div>
  );
};

export default GameDetailComponent;
