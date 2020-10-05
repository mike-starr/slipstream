import { GameFlavor } from './GameFlavor';

export default interface AddonDescription {
  readonly id: number;
  readonly repository: string;
  readonly gameFlavor: GameFlavor;
  readonly title: string;
  readonly summary: string;
  readonly fileUrl: string;
  readonly fileDate: string;
  readonly thumbnailUrl: string;
  readonly directories: string[];
}