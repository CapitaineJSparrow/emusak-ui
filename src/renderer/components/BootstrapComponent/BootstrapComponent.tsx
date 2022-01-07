import React from "react";
import './bootstrap.css';
import useTranslation from "../../i18n/I18nService";

const BootstrapComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="loader-container">
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
      <h3 dangerouslySetInnerHTML={{ __html: t('loading_data') }} />
    </div>
  );
}

export default BootstrapComponent;
