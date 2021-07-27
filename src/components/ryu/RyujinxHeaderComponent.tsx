import React from "react";
import { Button, Grid, IconButton, Tooltip } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";

interface IRyujinxHeaderProps {
  threshold: number;
  onRyuFolderAdd: Function;
}

const RyujinxHeaderComponent = ({ threshold, onRyuFolderAdd }: IRyujinxHeaderProps) => (
  <Grid container spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
    <Grid item xs={10}>
      Shaders threshold <code>{ threshold >= 1E6 ? 'Share shaders temporary disabled': threshold }</code>
      <Tooltip
        placement="right"
        arrow
        title={<>
          <span style={{ fontWeight: 'normal', fontSize: '1.2em' }}>That means you can share Shaders if your local Shader count surpasses EmuSAK's count by this value. This is based on how many submissions we already have and our workload. Reviewing your submissions is very time consuming and it is not worth our effort if the count is below the threshold variable. Submission are limited to 3 per user per hour for now.</span>
        </>}
      >
        <IconButton color="primary" size="small">
          <HelpIcon />
        </IconButton>
      </Tooltip>
    </Grid>
    <Grid item xs={2}>
      <Button
        color="primary"
        fullWidth
        variant="contained"
        onClick={() => onRyuFolderAdd()}
      >
        Add Ryujinx folder
      </Button>
    </Grid>
  </Grid>
);

export default RyujinxHeaderComponent;
