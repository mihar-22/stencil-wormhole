export interface DeferredPromise<ResolutionType = any> {
  promise: Promise<void>,
  resolve: (res: ResolutionType) => void;
}

export const createDeferredPromise = (): DeferredPromise => {
  let resolve: () => void;
  const promise = new Promise<void>((res) => { resolve = res; });
  return { promise, resolve };
};