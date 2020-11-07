import { getElement } from "@stencil/core";
import { createDeferredPromise, DeferredPromise } from "./deferred";

export interface WormholeConsumer {
  prototype?: any
  connectedCallback?(): void
  disconnectedCallback?(): void
}

export type ForcedDestruction = () => void;

export interface WormholeOpening {
  consumer: WormholeConsumer
  fields: string[]
  updater: (prop: any, value: any) => void
  onOpen?: DeferredPromise<ForcedDestruction>
}

export const openWormhole = (
  Component: WormholeConsumer, 
  props: string[],
  isBlocking = true,
) => {
  const isConstructor = (Component.constructor.name === 'Function');
  const Proto = isConstructor ? Component.prototype : Component;
  const componentWillLoad = Proto.componentWillLoad;

  Proto.componentWillLoad = function () {
    const el = getElement(this);
    const onOpen = createDeferredPromise();

    const event = new CustomEvent<WormholeOpening>('openWormhole', {
      bubbles: true,
      composed: true,
      detail: {
        consumer: this,
        fields: props,
        updater: (prop, value) => { this[prop] = value; },
        onOpen,
      },
    });

    el.dispatchEvent(event);

    const willLoad = () => {
      if (componentWillLoad) {
        return componentWillLoad.call(this);
      }
    }

    return isBlocking ? onOpen.promise.then(() => willLoad()) : (willLoad());
  };
};
