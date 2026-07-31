export type PipelineStep = {
  label: string;
  state: 'pending' | 'active' | 'complete' | 'failed';
  detail?: string;
};

export function resetPipelineForStatusCheck(pipeline: PipelineStep[]): PipelineStep[];
