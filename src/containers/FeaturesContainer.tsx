import React from "react";
import { Button, Chip, Grid, IconButton } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";

interface IFeaturesContainer {
  path: string;
  isPortable: boolean;
  onFirmwareDownload: Function;
  onKeysDownload: Function;
  firmwareVersion: string;
}

const FeaturesContainer = ({
  path,
  isPortable,
  onFirmwareDownload,
  onKeysDownload,
  firmwareVersion,
}: IFeaturesContainer) => (
  <div>
    <Grid container spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
      <Grid item xs={4}>
        <h3 style={{ lineHeight: '24px' }}>
          <IconButton
            size="small"
            color="secondary"
            component="span"
          >
            <DeleteOutline />
          </IconButton>
          &nbsp;
          <small>{path}</small>
        </h3>
      </Grid>
      <Grid item xs={3}>
        <Button
          onClick={() => onFirmwareDownload()}
          fullWidth
          variant="contained"
          color="primary"
          disabled={!firmwareVersion}
        >
          Download firmware {firmwareVersion}
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          onClick={() => onKeysDownload()}
          fullWidth
          variant="contained"
          color="primary"
          disabled={!firmwareVersion}
        >
          Download keys
        </Button>
      </Grid>
      <Grid item xs={2} style={{ textAlign: 'right' }}>
        Is Portable <Chip label={isPortable ? 'yes': 'no'} color="primary" />
      </Grid>
    </Grid>
  </div>
)

export default FeaturesContainer;
