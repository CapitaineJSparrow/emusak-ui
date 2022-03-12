import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Modal
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import useTranslation from "../../i18n/I18nService";
import useStore from "../../actions/state";
import { invokeIpc } from "../../utils";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  outline: "none"
};


const DownloadModComponent = () => {
  const { t } = useTranslation();
  const [currentMod, clearCurrentModAction, dataPath, downloadModAction] = useStore(s => [s.currentMod, s.clearCurrentModAction, s.dataPath, s.downloadModAction]);
  const [state, setState] = useState<"VERSION" | "MOD" | "DOWNLOAD">(null);
  const [items, setItems] = useState<{ name: string }[]>([]);
  const [version, setVersion] = useState<string>(null);
  const [pickedMod, setPickedMod] = useState<string>(null);

  useEffect(() => {
    if (!currentMod) {
      setState(null);
    } else {
      setState("VERSION");
    }
  }, [currentMod]);

  useEffect(() => {
    switch (state) {
      case "VERSION":
        invokeIpc("get-mods-versions", currentMod).then(d => setItems(d as any));
      break;
      case "MOD":
        invokeIpc("get-mods-list-for-version", currentMod, version).then(d => setItems(d as any));
      break;
      case "DOWNLOAD":
        downloadModAction(currentMod, version, pickedMod, dataPath);
        onModalClose();
      break;
    }
  }, [state]);

  const onModalClose = () => {
    setState(null);
    clearCurrentModAction();
    setVersion(null);
    setItems([]);
    setPickedMod(null);
  };

  const onItemClick = (name: string) => {
    switch (state) {
      case "VERSION":
        setVersion(name);
        setState("MOD");
      break;
      case "MOD":
        setState("DOWNLOAD");
        setPickedMod(name);
      break;
    }
  };

  return (
    <Modal
      open={!!currentMod}
      onClose={onModalClose}
    >
      <Box sx={style}>
        <List
          subheader={
            <Box p={1} pl={3} pr={3}>
              <ListSubheader component="div">
                <p style={{ textAlign: "center", margin: 0 }}>{t("dlMods")}</p>
              </ListSubheader>
              {
                state === "VERSION" && (
                  <p style={{ marginTop: 0 }}>
                    <small>
                      { t("dlModVersion") }
                    </small>
                  </p>
                )
              }
              <Divider />
            </Box>
          }
        >
          {
            items.map(i => (
              <ListItem key={i.name} disablePadding>
                <ListItemButton onClick={() => onItemClick(i.name)}>
                  <ListItemIcon>
                    <FileCopyIcon />
                  </ListItemIcon>
                  <ListItemText primary={i.name} />
                </ListItemButton>
              </ListItem>
            ))
          }
        </List>
      </Box>
    </Modal>
  );
};

export default DownloadModComponent;
