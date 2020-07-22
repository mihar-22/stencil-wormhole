export interface DeferredPromise {
  promise: Promise<void>,
  resolve: () => void;
}

export const createDeferredPromise = (): DeferredPromise => {
  let resolve: () => void;
  const promise = new Promise<void>((res) => { resolve = res; });
  return { promise, resolve };
};