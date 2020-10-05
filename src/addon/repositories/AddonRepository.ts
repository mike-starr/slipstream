import AddonDescription from "@/addon/AddonDescription";
import { GameFlavor } from "@/addon/GameFlavor";

export default interface AddonRepository {
  search(searchTerm: string, gameFlavor: GameFlavor): Promise<AddonDescription[]>;
  addonDescriptionsForIds(ids: number[], gameFlavor: GameFlavor): Promise<AddonDescription[]>;
}
