import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from './core';

type Views = {
  home: undefined;
  details: { itemId: string };
  confirm: { itemId: string };
};

function createRouter() {
  return new MemoryRouter<Views>([{ view: 'home' }]);
}

describe('MemoryRouter', () => {
  it('stamps keys on the initial stack', () => {
    const router = createRouter();
    const { current, stack } = router.getSnapshot();
    expect(current.key).toEqual(expect.any(String));
    expect(stack).toHaveLength(1);
    expect(stack[0].key).toBe(current.key);
  });

  it('assigns a new key on navigate (push)', () => {
    const router = createRouter();
    const rootKey = router.getSnapshot().current.key;

    router.navigate('details', { itemId: 'a' });

    const snap = router.getSnapshot();
    expect(snap.length).toBe(2);
    expect(snap.current.view).toBe('details');
    expect(snap.current.key).not.toBe(rootKey);
    expect(snap.stack[0].key).toBe(rootKey);
  });

  it('preserves the key on replace', () => {
    const router = createRouter();
    router.navigate('details', { itemId: 'a' });
    const keyBefore = router.getSnapshot().current.key;

    router.replace('details', { itemId: 'b' });

    const snap = router.getSnapshot();
    expect(snap.length).toBe(2);
    expect(snap.current.params).toEqual({ itemId: 'b' });
    expect(snap.current.key).toBe(keyBefore);
  });

  it('does not mutate the initial seed when navigating', () => {
    const router = createRouter();
    router.navigate('details', { itemId: 'a' });
    router.navigate('confirm', { itemId: 'a' });
    expect(router.getSnapshot().length).toBe(3);

    router.reset();

    expect(router.getSnapshot().length).toBe(1);
    expect(router.getSnapshot().current.view).toBe('home');
  });

  it('re-keys on no-arg reset', () => {
    const router = createRouter();
    const originalKey = router.getSnapshot().current.key;
    router.navigate('details', { itemId: 'a' });

    router.reset();

    expect(router.getSnapshot().current.key).not.toBe(originalKey);
    expect(router.getSnapshot().current.view).toBe('home');
  });

  it('assigns fresh keys on reset(...views)', () => {
    const router = createRouter();
    const originalKey = router.getSnapshot().current.key;

    router.reset({ view: 'details', params: { itemId: 'z' } });

    const snap = router.getSnapshot();
    expect(snap.length).toBe(1);
    expect(snap.current.view).toBe('details');
    expect(snap.current.key).not.toBe(originalKey);
  });

  it('preserves the matched entry key on backTo with params', () => {
    const router = createRouter();
    router.navigate('details', { itemId: 'a' });
    const detailsKey = router.getSnapshot().current.key;
    router.navigate('confirm', { itemId: 'a' });

    router.backTo('details', { itemId: 'updated' });

    const snap = router.getSnapshot();
    expect(snap.length).toBe(2);
    expect(snap.current.view).toBe('details');
    expect(snap.current.params).toEqual({ itemId: 'updated' });
    expect(snap.current.key).toBe(detailsKey);
  });

  it('notifies subscribers with action types', () => {
    const router = createRouter();
    const listener = vi.fn();
    router.subscribe(listener);

    router.navigate('details', { itemId: 'a' });
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: 'push', snapshot: router.getSnapshot() }),
    );

    router.replace('details', { itemId: 'b' });
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'replace' }));

    router.navigate('confirm', { itemId: 'b' });
    router.back();
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'back' }));

    router.navigate('confirm', { itemId: 'b' });
    router.backTo('home');
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'backTo' }));

    router.reset();
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'reset' }));
  });

  it('does not notify on no-op back or backTo', () => {
    const router = createRouter();
    const listener = vi.fn();
    router.subscribe(listener);

    router.back();
    router.backTo('home');
    router.backTo('details');

    expect(listener).not.toHaveBeenCalled();
  });
});
