import React, { useEffect } from "react";
import { LS_KEYS } from "../../../types";
import Swal from "sweetalert2";
import pirate_icon from "../../resources/pirate_icon.png";
import useTranslation from "../../i18n/I18nService";

const TOSComponent = () => {
  const { t } = useTranslation();
  const accepted = localStorage.getItem(LS_KEYS.TOS);

  const spamUserUntilTosAccepted = async () => {
    let letUserPass = false;

    if (!accepted) {
      while (!letUserPass) {
        await Swal.fire({
          html: `<div>
            <p><img src="${pirate_icon}" alt=""></p>
            <p style="text-align: left">${t("tos")}</p>
          </div>`,
          input: "checkbox",
          inputPlaceholder: t("agree"),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed && result.value) {
            letUserPass = true;
            localStorage.setItem(LS_KEYS.TOS, "true");
          }
        });
      }
    }
  };

  useEffect(() => {
    spamUserUntilTosAccepted();
  }, []);

  return (
    <></>
  );
};

export default TOSComponent;
