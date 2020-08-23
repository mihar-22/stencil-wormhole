import { getElement } from "@stencil/core";
import { createDeferredPromise, DeferredPromise } from "./deferred";

export interface WormholeConsumer {
  connectedCallback?(): void
  disconnectedCallback?(): void
}

export interface WormholeConsumerConstructor {
  new(...args: any[]): WormholeConsumer
}

export type ForcedDestruction = () => void;

export interface WormholeOpening {
  consumer: WormholeConsumer
  fields: string[]
  updater?: (prop: any, value: any) => void
  onOpen?: DeferredPromise<ForcedDestruction>,
}

export const openWormhole = (Component: WormholeConsumerConstructor, props: string[]) => {
  const ComponentPrototype = Component.prototype;
  const { componentWillLoad } = ComponentPrototype;

  ComponentPrototype.componentWillLoad = function () {
    const el = getElement(this);
    const onOpen = createDeferredPromise();

    const event = new CustomEvent<WormholeOpening>('openWormhole', {
      bubbles: true,
      composed: true,
      detail: {
        consumer: this,
        fields: props,
        onOpen,
      },
    });

    el.dispatchEvent(event);

    return onOpen.promise.then(() => {
      if (componentWillLoad) {
        return componentWillLoad.call(this);
      }
    })
  };
};
