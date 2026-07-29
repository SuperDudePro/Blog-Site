import type { Inspection } from './inspectPackage.js';

type Handoff = {
  repository: string;
  branch: string;
  commit: string;
  prNumber: number;
  prUrl: string;
  baseBranch: string;
  canonicalUrl?: string;
  title?: string;
};

export const PUBLISHER_JOB_KEY: string;
export function savePublisherJob(storage: Storage, handoff: Handoff, inspection: Inspection): void;
export function loadPublisherJob(storage: Storage): { handoff: Handoff; inspection: Inspection } | null;
export function clearPublisherJob(storage: Storage): void;
