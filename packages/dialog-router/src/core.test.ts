import { describe, expect, it } from 'vitest';
import { createRouterState, createSnapshot, routerReducer } from './core';

type Views = {
  home: undefined;
  details: { itemId: string };
  confirm: { itemId: string };
};

function createState() {
  return createRouterState<Views>([{ view: 'home' }]);
}

describe('routerReducer', () => {
  it('stamps keys on the initial stack', () => {
    const state = createState();
    const { current, stack } = createSnapshot(state.stack);
    expect(current.key).toEqual(expect.any(String));
    expect(stack).toHaveLength(1);
    expect(stack[0].key).toBe(current.key);
  });

  it('assigns a new key on push', () => {
    const state = createState();
    const rootKey = state.stack[0].key;

    const next = routerReducer(state, { type: 'push', view: 'details', params: { itemId: 'a' } });
    const snap = createSnapshot(next.stack);

    expect(snap.length).toBe(2);
    expect(snap.current.view).toBe('details');
    expect(snap.current.key).not.toBe(rootKey);
    expect(snap.stack[0].key).toBe(rootKey);
  });

  it('preserves the key on replace', () => {
    let state = createState();
    state = routerReducer(state, { type: 'push', view: 'details', params: { itemId: 'a' } });
    const keyBefore = state.stack[state.stack.length - 1].key;

    state = routerReducer(state, { type: 'replace', view: 'details', params: { itemId: 'b' } });
    const snap = createSnapshot(state.stack);

    expect(snap.length).toBe(2);
    expect(snap.current.params).toEqual({ itemId: 'b' });
    expect(snap.current.key).toBe(keyBefore);
  });

  it('does not mutate the initial seed when navigating', () => {
    let state = createState();
    state = routerReducer(state, { type: 'push', view: 'details', params: { itemId: 'a' } });
    state = routerReducer(state, { type: 'push', view: 'confirm', params: { itemId: 'a' } });
    expect(state.stack).toHaveLength(3);

    state = routerReducer(state, { type: 'reset' });

    expect(state.stack).toHaveLength(1);
    expect(state.stack[0].view).toBe('home');
    expect(state.initial).toEqual([{ view: 'home' }]);
  });

  it('re-keys on no-arg reset', () => {
    let state = createState();
    const originalKey = state.stack[0].key;
    state = routerReducer(state, { type: 'push', view: 'details', params: { itemId: 'a' } });

    state = routerReducer(state, { type: 'reset' });

    expect(state.stack[0].key).not.toBe(originalKey);
    expect(state.stack[0].view).toBe('home');
  });

  it('assigns fresh keys on reset with views', () => {
    let state = createState();
    const originalKey = state.stack[0].key;

    state = routerReducer(state, {
      type: 'reset',
      views: [{ view: 'details', params: { itemId: 'z' } }],
    });

    const snap = createSnapshot(state.stack);
    expect(snap.length).toBe(1);
    expect(snap.current.view).toBe('details');
    expect(snap.current.key).not.toBe(originalKey);
  });

  it('preserves the matched entry key on backTo with params', () => {
    let state = createState();
    state = routerReducer(state, { type: 'push', view: 'details', params: { itemId: 'a' } });
    const detailsKey = state.stack[state.stack.length - 1].key;
    state = routerReducer(state, { type: 'push', view: 'confirm', params: { itemId: 'a' } });

    state = routerReducer(state, {
      type: 'backTo',
      view: 'details',
      params: { itemId: 'updated' },
    });

    const snap = createSnapshot(state.stack);
    expect(snap.length).toBe(2);
    expect(snap.current.view).toBe('details');
    expect(snap.current.params).toEqual({ itemId: 'updated' });
    expect(snap.current.key).toBe(detailsKey);
  });

  it('returns the same state reference on no-op back or backTo', () => {
    const state = createState();

    expect(routerReducer(state, { type: 'back' })).toBe(state);
    expect(routerReducer(state, { type: 'backTo', view: 'home' })).toBe(state);
    expect(routerReducer(state, { type: 'backTo', view: 'details' })).toBe(state);
  });
});
