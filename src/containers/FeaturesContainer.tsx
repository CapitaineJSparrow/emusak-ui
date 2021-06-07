import React from "react";
import { AppBar, Box, Button, Chip, Grid, IconButton, Tab, Tabs, Typography } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";

interface IFeaturesContainerProps {
  path: string;
  isPortable: boolean;
  onFirmwareDownload: Function;
  onKeysDownload: Function;
  firmwareVersion: string;
}

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      hidden={value !== index}
      id={`features-panel-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const FeaturesContainer = ({
  path,
  isPortable,
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

      <Grid container spacing={2}>
        <AppBar style={{ marginTop: 20 }} position="static">
          <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} aria-label="simple tabs example">
            <Tab label="Shaders" />
            <Tab label="Saves" />
            <Tab label="Mods" />
          </Tabs>
        </AppBar>
        <TabPanel value={`${0}`}>
          Shaders
        </TabPanel>
        <TabPanel value={`${1}`}>
          Saves
        </TabPanel>
        <TabPanel value={`${2}`}>
          Mods
        </TabPanel>
      </Grid>
    </div>
  );
}

export default FeaturesContainer;
