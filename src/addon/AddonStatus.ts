export type AddonInstallState =
  | "Installed"
  | "NotInstalled"
  | "Installing"
  | "Error";

export type AddonInstallOperation =
  | "Initializing"
  | "Downloading"
  | "Unzipping"
  | "Finalizing";

export default interface AddonStatus {
  state: AddonInstallState;
  progress?: {
    percentage: number;
    operation: AddonInstallOperation;
  };
}

export function makeAddonStatus(
  state: AddonInstallState,
  progressPercentage?: number,
  progressOperation?: AddonInstallOperation
): AddonStatus {
  return {
    state: state,
    progress:
      progressPercentage && progressOperation
        ? {
            percentage: progressPercentage,
            operation: progressOperation
          }
        : undefined
  };
}
