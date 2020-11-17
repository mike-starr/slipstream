export type AddonInstallState =
  | "Installed"
  | "NotInstalled"
  | "Installing";

export type AddonInstallOperation =
  | "Initializing"
  | "Downloading"
  | "Extracting"
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
      progressPercentage !== undefined && progressOperation !== undefined
        ? {
            percentage: progressPercentage,
            operation: progressOperation
          }
        : undefined
  };
}
