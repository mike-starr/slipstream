import AddonSearchResult from "@/addon/AddonSearchResult";
import { GameFlavor } from "@/addon/GameFlavor";

export default interface AddonRepository {
  search(searchTerm: string, gameFlavor: GameFlavor): Promise<AddonSearchResult[]>;
}
