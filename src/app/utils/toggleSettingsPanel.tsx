export const toggleSettingsPanel = (
  isSettingsOpen: boolean,
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setSettingsOpen(!isSettingsOpen);
};
