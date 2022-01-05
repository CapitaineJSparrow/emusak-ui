import React, { useEffect, useState } from "react";
import useStore from "../actions/state";
import EmulatorContainer from "./GameListingComponent/GameListingComponent";
import {
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { EmusakEmulatorMode } from "../../types";

const RootComponent = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<EmusakEmulatorMode>(null);

  const [
    emulatorBinariesPath,
    removeEmulatorConfigAction,
    selectedConfig,
    setSelectConfigAction,
    addNewEmulatorConfigAction,
    createDefaultConfig,
    currentEmu,
    getModeForBinary,
    installFirmwareAction
  ] = useStore(state => [
    state.emulatorBinariesPath,
    state.removeEmulatorConfigAction,
    state.selectedConfig,
    state.setSelectConfigAction,
    state.addNewEmulatorConfigAction,
    state.createDefaultConfig,
    state.currentEmu,
    state.getModeForBinary,
    state.installFirmwareAction,
  ]);

  const filteredConfig = emulatorBinariesPath.filter(c => c.emulator === currentEmu);

  const onConfigurationChange = (e: SelectChangeEvent) => {
    const { value } = e.target;
    value === '' ? addNewEmulatorConfigAction() : setSelectConfigAction(emulatorBinariesPath.find(i => i.path === value));
    e.preventDefault();
    return false;
  }

  // Build defaults configs if there is none
  useEffect(() => {
    if (filteredConfig.length === 0) {
      createDefaultConfig();
    }
  }, [currentEmu]);

  const onConfigChange = async () => {
    if (filteredConfig.length > 0 && !selectedConfig) {
      setSelectConfigAction(filteredConfig[0]);
      const m = await getModeForBinary(filteredConfig[0].path);
      setMode(m);
    }
  }

  // If there is a config and user did not picked one already, choose the first one for him
  useEffect(() => {
    onConfigChange();
  }, [filteredConfig]);

  const renderEmulatorPathSelector = () => (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="emulator-select-path-label">{ t('configuration') }</InputLabel>
          <Select
            labelId="emulator-select-path-label"
            id="emulator-select-path"
            value={selectedConfig?.path || ''}
            onChange={onConfigurationChange}
          >
            <MenuItem value={''}><i>{ t('addConfiguration') }</i></MenuItem>
            {
              filteredConfig.map((item, index) => (
                <MenuItem key={`emulator-select-path-item-${index}`} value={item.path}>{ item.name }</MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </Grid>
      {
        (selectedConfig && !selectedConfig.isDefault) && (
          <Grid item xs={2} style={{ lineHeight: '52px' }}>
            <IconButton onClick={() => removeEmulatorConfigAction(selectedConfig.path)} color="error">
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Grid>
        )
      }
    </Grid>
  )

  return (emulatorBinariesPath && emulatorBinariesPath.length > 0) && (
    <Container maxWidth={false} key={currentEmu}>
      <br />
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={7}>
            { renderEmulatorPathSelector() }
          </Grid>
          {
            (selectedConfig && mode) && (
              <>
                <Grid item style={{ lineHeight: '52px' }} xs={3}>
                  <Button onClick={() => installFirmwareAction(mode.dataPath) } fullWidth variant="contained">{ t('dl_firmware') } 13.1.0</Button>
                </Grid>
                <Grid item style={{ lineHeight: '52px' }} xs={2}>
                  <Button fullWidth variant="contained">{ t('dl_keys') }</Button>
                </Grid>
              </>
            )
          }
        </Grid>
        { selectedConfig && (<EmulatorContainer mode={mode} config={selectedConfig} />) }
      </Stack>
    </Container>
  );
};

export default RootComponent;
