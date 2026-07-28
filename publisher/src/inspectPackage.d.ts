import type { SiteProfile } from '../siteProfiles.mjs';
import type { NormalizedManifest } from './packageManifest.js';

export type Check = { group: string; label: string; ok: boolean; detail: string };
export type ImageView = NormalizedManifest['images'][number] & {
  url: string;
  present: boolean;
  imported: boolean;
  altMatches: boolean;
  captionMatches: boolean;
};
export type Inspection = {
  root: string;
  dropPrefix: string;
  manifest: NormalizedManifest;
  profile: SiteProfile;
  files: string[];
  productionFiles: string[];
  checks: Check[];
  images: ImageView[];
};

export function inspectPackage(file: Blob | ArrayBuffer | Uint8Array): Promise<Inspection>;
