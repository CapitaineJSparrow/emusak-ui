import React, { useEffect, useState } from "react";
import "./bootstrap.css";
import useTranslation from "../../i18n/I18nService";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { invokeIpc } from "../../utils";

const BootstrapComponent = () => {
  const { t } = useTranslation();
  const [hasDns, setHasDns] = useState(false);

  useEffect(() => {
    invokeIpc("has-dns-file").then(setHasDns);
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
          onChange={() => invokeIpc("toggle-custom-dns") && setHasDns(!hasDns)}
          label={t("customDns")}
        />
      </FormGroup>
    </div>
  );
};

export default BootstrapComponent;
