import React from "react";
import { CustomBadgeWrapepr } from "../cards/CustomBadge";
import { useTranslation } from "react-i18next";

const HalalTag = ({ status }) => {
  const { t } = useTranslation();

  if (status !== 1) return null;

  return (
    <CustomBadgeWrapepr
      border_radius="0px 4px 4px 0px"
      fontSize="12px"
    >
      {t("Halal")}
    </CustomBadgeWrapepr>
  );
};

export default HalalTag;
