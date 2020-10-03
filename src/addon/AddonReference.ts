import AddonDescription from "./AddonDescription";
import AddonStatus from './AddonStatus';

export default interface AddonReference {
  readonly description: AddonDescription;
  readonly version: string;
  status: AddonStatus;
}

export function createAddonReference(
  description: AddonDescription,
  version: string,
  status: AddonStatus
): AddonReference {
  return {
    description,
    version,
    status
  };
}
