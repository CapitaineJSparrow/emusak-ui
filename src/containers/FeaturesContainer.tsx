import React from "react";
import { AppBar, Button, Chip, Grid, IconButton, Tab, Tabs } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import ShadersListComponent from "../components/features/ShadersListComponent";
import { IEmusakEmulatorConfig } from "../types";

interface IFeaturesContainerProps {
  config: IEmusakEmulatorConfig;
  onFirmwareDownload: Function;
  onKeysDownload: Function;
  firmwareVersion: string;
}

const FeaturesContainer = ({
  config,
  onFirmwareDownload,
  onKeysDownload,
  firmwareVersion,
}: IFeaturesContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
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
            <small>{config.path}</small>
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
          Is Portable <Chip label={config.isPortable ? 'yes': 'no'} color="primary" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <AppBar style={{ marginTop: 20 }} position="static">
          <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} aria-label="simple tabs example">
            <Tab label="Shaders" />
            <Tab label="Saves" />
            <Tab label="Mods" />
          </Tabs>
        </AppBar>

        <ShadersListComponent games={config.games} />
      </Grid>
    </div>
  );
}

export default FeaturesContainer;
