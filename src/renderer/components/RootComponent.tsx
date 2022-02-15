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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { EmusakEmulatorMode } from "../../types";
import useTranslation from "../i18n/I18nService";
import GameDetailComponent from "./GameDetailComponent/GameDetailComponent";

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
    installFirmwareAction,
    firmwareVersion,
    downloadKeysAction,
    currentGame,
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
    state.firmwareVersion,
    state.downloadKeysAction,
    state.currentGame,
  ]);

  const filteredConfig = emulatorBinariesPath.filter(c => c.emulator === currentEmu);

  const onConfigurationChange = (e: SelectChangeEvent) => {
    const { value } = e.target;

    if (value === "") {
      addNewEmulatorConfigAction();
    } else {
      const config = emulatorBinariesPath.find(i => i.path === value);
      setSelectConfigAction(config);
      getModeForBinary(config.path).then(setMode);
    }

    e.preventDefault();
    return false;
  };

  useEffect(() => {
    // Build default config in case there is no one
    if (filteredConfig.length === 0 && !selectedConfig) {
      createDefaultConfig();
    }

    // Otherwise, pick first config available and compute mode for it
    else if (!selectedConfig && filteredConfig.length > 0) {
      const c = filteredConfig.find(f => f.selected) || filteredConfig[0];
      setSelectConfigAction(c);
      getModeForBinary(c.path).then(setMode);
    } else if (selectedConfig && !mode) {
      getModeForBinary(selectedConfig.path).then(setMode);
    }
  }, [currentEmu, emulatorBinariesPath, filteredConfig]);

  // In case user chose another config (after added or removed a config)
  useEffect(() => {
    if (selectedConfig && "path" in selectedConfig) {
      getModeForBinary(selectedConfig.path).then(setMode);
    }
  }, [selectedConfig]);

  const renderEmulatorPathSelector = () => (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="emulator-select-path-label">{ t("configuration") }</InputLabel>
          <Select
            labelId="emulator-select-path-label"
            id="emulator-select-path"
            value={selectedConfig?.path || ""}
            onChange={onConfigurationChange}
          >
            <MenuItem value={""}><i>{ t("addConfiguration") }</i></MenuItem>
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
          <Grid item xs={2} style={{ lineHeight: "52px" }}>
            <IconButton onClick={() => removeEmulatorConfigAction(selectedConfig.path)} color="error">
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Grid>
        )
      }
    </Grid>
  );

  return (emulatorBinariesPath && emulatorBinariesPath.length > 0) && (
    <Container maxWidth={false} key={`${currentEmu}`}>
      <br />
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {
            !currentGame && (
              <Grid item xs={6}>
                { renderEmulatorPathSelector() }
              </Grid>
            )
          }
          {
            (selectedConfig && mode && !currentGame) && (
              <>
                <Grid item style={{ lineHeight: "52px" }} xs={3}>
                  <Button onClick={() => installFirmwareAction(mode.dataPath) } fullWidth variant="contained">{ t("dl_firmware") } { firmwareVersion }</Button>
                </Grid>
                <Grid item style={{ lineHeight: "52px" }} xs={3}>
                  <Button onClick={() => downloadKeysAction(mode.dataPath)} fullWidth variant="contained">{ t("dl_keys") }</Button>
                </Grid>
              </>
            )
          }
        </Grid>

        {
          (selectedConfig && mode) && (
            <div>
              {
                currentGame
                  ? <GameDetailComponent dataPath={mode.dataPath} titleId={currentGame} />
                  : <EmulatorContainer key={mode.dataPath} mode={mode} config={selectedConfig} />
              }
            </div>
          )
        }
      </Stack>
    </Container>
  );
};

export default RootComponent;
