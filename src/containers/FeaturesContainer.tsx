import React from "react";
import { AppBar, Box, Button, Chip, Grid, IconButton, Tab, Tabs } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import ShadersListComponent from "../components/features/ShadersListComponent";
import { IEmusakEmulatorConfig, IEmusakShaders } from "../types";

interface IFeaturesContainerProps {
  config: IEmusakEmulatorConfig;
  onFirmwareDownload: Function;
  onKeysDownload: Function;
  firmwareVersion: string;
  emusakShaders: IEmusakShaders;
}

const FeaturesContainer = ({
  config,
  onFirmwareDownload,
  onKeysDownload,
  firmwareVersion,
  emusakShaders,
}: IFeaturesContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <>
      <Grid container spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
        <Grid item xs={4}>
          <Box display="flex" justifyContent="start" alignItems="center">
            <h3 style={{ lineHeight: '24px' }}>
              <IconButton
                size="small"
                color="secondary"
                component="span"
              >
                <DeleteOutline />
              </IconButton>
            </h3>
            <h3><small>{config.path}</small></h3>
          </Box>
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

        <ShadersListComponent emusakShaders={emusakShaders} games={config.games} />
      </Grid>
    </>
  );
}

export default FeaturesContainer;
