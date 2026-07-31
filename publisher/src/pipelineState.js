export function resetPipelineForStatusCheck(pipeline) {
  return pipeline.map((step, index) => {
    if (index < 5) return step;
    if (index === 5) return { ...step, state: 'active', detail: 'Rechecking required pull-request checks' };
    if (index === 7) return { ...step, state: 'active', detail: 'Rechecking the target site preview' };
    return { ...step, state: 'pending', detail: undefined };
  });
}
