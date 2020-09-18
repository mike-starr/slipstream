export default interface AddonReference {
  readonly id: number;
  readonly repository: string;
  readonly title: string;
  readonly summary: string;
  readonly fileUrl: string;
  readonly fileDate: string;
  readonly thumbnailUrl: string;
  readonly directories: string[];
}
