import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrueSheetNames } from "../../../navigation/constants";
import AppButton from "../../../components/AppButton";
import { scale } from "../../../theme/utils";
import NotificationSettings from "./NotificationSettings";
import SettingsSheet from "./SettingsSheet";

const NotificationSettingsSheet = () => {
  const { t } = useTranslation();
  const [resetSignal, setResetSignal] = useState(0);
  const [submitSignal, setSubmitSignal] = useState(0);

  const handleWillPresent = () => {
    setResetSignal((currentSignal) => currentSignal + 1);
  };

  const handleSavePress = () => {
    setSubmitSignal((currentSignal) => currentSignal + 1);
  };

  return (
    <SettingsSheet
      name={TrueSheetNames.SETTINGS_NOTIFICATIONS}
      title={t("notifications")}
      onWillPresent={handleWillPresent}
      footer={
        <AppButton
          title={t("save")}
          onPress={handleSavePress}
          margin={{ marginHorizontal: scale(24) }}
        />
      }
    >
      <NotificationSettings
        resetSignal={resetSignal}
        submitSignal={submitSignal}
        showSectionTitle={false}
      />
    </SettingsSheet>
  );
};

export default NotificationSettingsSheet;
