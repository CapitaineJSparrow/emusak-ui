import React, { useEffect, useState } from "react";
import "./bootstrap.css";
import useTranslation from "../../i18n/I18nService";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ipcRenderer } from "electron";

const BootstrapComponent = () => {
  const { t } = useTranslation();
  const [hasDns, setHasDns] = useState(false);

  useEffect(() => {
    ipcRenderer.invoke("has-dns-file").then(setHasDns);
  }, []);

  return (
    <div className="loader-container">
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
      <h3 dangerouslySetInnerHTML={{ __html: t("loading_data") }} />

      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={hasDns} />}
          onChange={() => ipcRenderer.invoke("toggle-custom-dns")}
          label="Use custom DNS resolver (CloudFlare) instead system provided. This may fix infinite load issues when emusak status is up."
        />
      </FormGroup>
    </div>
  );
};

export default BootstrapComponent;
