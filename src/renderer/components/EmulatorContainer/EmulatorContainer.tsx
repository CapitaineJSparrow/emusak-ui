import React, { useEffect, useState } from "react";
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import './emulatorContainer.css'
import { EmusakEmulatorConfig, EmusakEmulatorMode } from "../../../types";
import useStore from "../../actions/state";
import { Chip, Grid, IconButton, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from "react-i18next";

interface IEmulatorContainer {
  config: EmusakEmulatorConfig;
}

const Label = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  border: '1px solid black',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 0',
  color: '#FFF'
}));

const EmulatorContainer = ({ config }: IEmulatorContainer) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<EmusakEmulatorMode>(null);
  const [getModeForBinary] = useStore(state => [state.getModeForBinary]);

  useEffect(() => {
    getModeForBinary(config.path).then(setMode);
  }, []);

  return (
    <>
      {
        mode && (
          <Stack className="masonry" spacing={2}>
            <Grid container>
              <Grid item xs={12}>
                { t('mode') } <Chip color="primary" label={mode.mode} />
                &nbsp;
                <Tooltip placement="right" title={`${t('readingDataPath')} ${mode.dataPath}`}>
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            <Masonry columns={5} spacing={4}>
              {itemData.map((item, index) => (
                <Stack key={index}>
                  <Label>{item.title.length > 29 ? `${item.title.slice(0, 29)}...` : item.title}</Label>
                  <img
                    referrerPolicy="no-referrer"
                    src={`${item.img}`}
                    alt={item.title}
                    loading="lazy"
                    style={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}
                  />
                </Stack>
              ))}
            </Masonry>
          </Stack>
        )
      }
    </>
  );
}

const itemData = [
  {
    img: 'https://img-eshop.cdn.nintendo.net/i/16259342084f704aa52da956cf1b1a9c2ad1f88b3de6c3e263c350813e7ccd1f.jpg',
    title: 'Breath of the wild',
  },
  {
    img: 'https://img-eshop.cdn.nintendo.net/i/a0af3e5f59b543af010e54c664c53fa17f66c37098418ba73b45aa6b43ac6f0d.jpg',
    title: 'Splatoon 2',
  },
  {
    img: 'https://img-eshop.cdn.nintendo.net/i/10f565a04c2183b9c9a31365fd7885b991706e7c511e1388d8f1a930504d4edf.jpg',
    title: 'Monster Hunter Rise',
  },
  {
    img: 'https://img-eshop.cdn.nintendo.net/i/22fa52ed91f3cb5cf8ccba24ec495035903a2534ef4020406358c716b7c4e261.jpg',
    title: 'Mario Party Superstars',
  },
  {
    img: 'https://img-eshop.cdn.nintendo.net/i/08af58551a19df2a73ccb36f720388434a1965776b34675c6f69af3f93280330.jpg',
    title: 'Smash bros ultimate',
  },
  {
    img: 'https://img-eshop.cdn.nintendo.net/i/b6b0744c90d5df8a5070b09503f22f30a8847d00b3fa32a35504cddb36000256.jpg',
    title: 'Fast RMX',
  },
  {
    img: 'https://img-eshop.cdn.nintendo.net/i/ef21d2a1a6e009e85148cef6791b3824d9865edc03482ab39f5995cd5aa3afbe.jpg',
    title: 'Hyrule Warriors: Definitive Edition',
  },
];

export default EmulatorContainer;
