import assert from 'node:assert/strict';
import test from 'node:test';
import { resetPipelineForStatusCheck } from '../src/pipelineState.js';

test('retry clears every stale displayed failure before corrected status is applied', () => {
  const pipeline = Array.from({ length: 10 }, (_, index) => ({
    label: `Step ${index}`,
    state: index < 5 ? 'complete' : 'failed',
    detail: 'Stale failure',
  }));
  const reset = resetPipelineForStatusCheck(pipeline);
  assert.deepEqual(reset.slice(0, 5), pipeline.slice(0, 5));
  assert.equal(reset[5].state, 'active');
  assert.equal(reset[7].state, 'active');
  assert.equal(reset[6].state, 'pending');
  assert.equal(reset[8].state, 'pending');
  assert.equal(reset[9].state, 'pending');
  assert.equal(reset.slice(5).some((step) => step.state === 'failed'), false);
});
