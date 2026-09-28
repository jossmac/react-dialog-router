import type { RefObject, Ref } from 'react';

/**
 * Merges multiple refs into a single ref function.
 * @param refs - The refs to merge.
 * @returns A single ref function that will call all the given refs.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as RefObject<T | null>).current = node;
      }
    });
  };
}
