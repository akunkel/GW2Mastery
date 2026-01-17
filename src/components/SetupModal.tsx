import ApiKeyForm from './ApiKeyForm';
import { useAppStore } from '../store/useAppStore';
import DatabaseSection from './DatabaseSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export default function SetupModal() {
  const {
    setupModalOpen: open,
    setSetupModalOpen: onOpenChange,
    handleApiKeySubmit: onApiKeySubmit,
    handleClearKey: onClearKey,
    handleBuildDatabase: onBuildDatabase,
    loading: isLoading,
    buildingDatabase,
    error,
    databaseError,
    hasStoredKey,
    apiKey: storedApiKey,
    databaseTimestamp,
    loadingProgress,
    achievements,
  } = useAppStore();

  const hasAchievements = achievements.length > 0;

  // Prevent closing if achievements aren't loaded
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if achievements are loaded
    if (!newOpen && !hasAchievements) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        hideClose={!hasAchievements}
      >
        <DialogHeader>
          <DialogTitle>Setup</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* API Key Section */}
          <ApiKeyForm
            key={storedApiKey}
            initialKey={storedApiKey}
            loading={isLoading}
            error={error}
            hasStoredKey={hasStoredKey}
            onApiKeySubmit={async (key) => {
              await onApiKeySubmit(key, true);
              if (!useAppStore.getState().error) {
                onOpenChange(false);
              }
            }}
            onClearKey={onClearKey}
          />

          {/* Divider */}
          <div className="border-t border-slate-700/50" />

          {/* Database Section */}
          <DatabaseSection
            databaseTimestamp={databaseTimestamp}
            buildingDatabase={buildingDatabase}
            onBuildDatabase={onBuildDatabase}
            loadingProgress={loadingProgress}
            error={databaseError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

