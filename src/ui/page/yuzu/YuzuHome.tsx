import React from "react";
import {Button, Grid} from "@material-ui/core";
import yuzu_logo from "../../../assets/yuzu.png";

const YuzuHome = () => {
  return (
    <div>
      <div style={{ padding: 20 }}>
        <Grid container>
          <Grid item xs={9} style={{ display: 'flex', alignItems: 'center' }}>
            <p>
              <img src={yuzu_logo} height={36} alt=""/>
            </p>
            &nbsp;
            &nbsp;
            <h2>
              Yuzu
            </h2>
          </Grid>
          <Grid item xs={3}>
            <Button color="primary" variant="contained" fullWidth>Add Yuzu folder</Button>
          </Grid>

          <Grid style={{ marginTop: 16 }} item xs={12}>
            <hr />
            <br />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default YuzuHome;
