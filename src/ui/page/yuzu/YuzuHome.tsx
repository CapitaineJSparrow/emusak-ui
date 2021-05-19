import React from "react";
import { Button, Grid } from "@material-ui/core";
import yuzu_logo from "../../../assets/yuzu.png";
import { Alert } from "@material-ui/lab";
import { addYuzuPath } from "../../../service/yuzu";
import Paper from "@material-ui/core/Paper";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";

const YuzuHome = () => {

  const onYuzuFolderAddClick = async () => {
    await addYuzuPath();
  }

  return (
    <div>
      <div style={{ padding: 20 }}>
        <Grid container>
          <Alert style={{ marginBottom: 16 }} severity="error">Yuzu support is very limited yet, you can only see your game list. This is more an alpha test to make sure everything work (window / linux, portable or standard mode) before working on downloads features  (firmware / shaders / keys). Ryujinx is the only emulator to have complete support yet</Alert>

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
            <Button onClick={() => onYuzuFolderAddClick()} color="primary" variant="contained" fullWidth>Add Yuzu folder</Button>
          </Grid>

          <Grid style={{ marginTop: 16 }} item xs={12}>
            <hr />
            <br />
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: 495 }}>Games (3)</TableCell>
                    <TableCell>EmuSAK Shaders size</TableCell>
                    <TableCell>Local Shaders size</TableCell>
                    <TableCell style={{ width: 380 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <span>Mario Kart 8 Deluxe</span>
                      <br />
                      <span><small>010006A0042F0000</small></span>
                    </TableCell>
                    <TableCell>
                      <span>2.03 Mb</span>
                    </TableCell>
                    <TableCell>
                      <span>No local shaders</span>
                    </TableCell>
                    <TableCell>

                      <Button
                        variant="contained"
                        color="primary"
                      >
                        Download shaders
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default YuzuHome;
