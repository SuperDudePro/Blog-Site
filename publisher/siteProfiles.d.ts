export type SiteProfile = {
  id: string;
  targetSite: string;
  repository: string;
  deploymentProject: string;
  canonicalPrefix: string;
  buildCommand: string;
  sourceFiles: string[];
  metadataFields: string[];
  imageDirectory: string;
  statuses: string[];
  sections: string[];
};

export const SITE_PROFILES: SiteProfile[];
export function getSiteProfile(manifest: unknown): SiteProfile;
export function expectedImageRecords(profile: SiteProfile, bodyCount: number): Array<{ file: string; role: string }>;
export function imageManifestErrors(profile: SiteProfile, images: unknown[]): string[];
export function allowedProductionPaths(profile: SiteProfile, images: unknown[]): Set<string>;
