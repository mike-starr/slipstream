import AddonDescription from "./AddonDescription";
import AddonStatus from './AddonStatus';

export default interface AddonReference {
  readonly description: AddonDescription;
  status: AddonStatus;
}