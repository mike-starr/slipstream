import AddonReference from "@/addon/AddonReference";
import { GameFlavor } from "@/addon/GameFlavor";

export default interface AddonRepository {
  search(searchTerm: string, gameFlavor: GameFlavor): Promise<AddonReference[]>;
  getAddonInstallationData(id: number, gameFlavor: GameFlavor): Promise<AddonReference>;
}
