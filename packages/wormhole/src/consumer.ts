import { getElement } from "@stencil/core";
import { createDeferredPromise, DeferredPromise } from "./deferred";
import { ListenerConnectionStatus } from "dom-context";
import { context } from "./shared";

export interface WormholeConsumer {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}

export interface WormholeConsumerConstructor {
  new (...args: any[]): WormholeConsumer;
}

export type ForcedDestruction = () => void;

export interface WormholeOpening {
  consumer: WormholeConsumer;
  fields: string[];
  updater: (prop: any, value: any) => void;
  onOpen?: DeferredPromise<ForcedDestruction>;
}

export const openWormhole = (
  Component: WormholeConsumerConstructor,
  props: string[]
) => {
  const ComponentPrototype = Component.prototype;
  const { componentWillLoad } = ComponentPrototype;

  ComponentPrototype.componentWillLoad = function () {
    const el = getElement(this);
    const onOpen = createDeferredPromise();

    const listener = new context.Listener({
      element: el,
      onChange: (val) => {
        props.map((prop) => {
          this[prop] = val[prop];
        });
      },
      onStatus: (status) => {
        if (status === ListenerConnectionStatus.CONNECTED) {
          onOpen.resolve(true);
        }
      },
    });

    listener.start();

    // const event = new CustomEvent<WormholeOpening>('openWormhole', {
    //   bubbles: true,
    //   composed: true,
    //   detail: {
    //     consumer: this,
    //     fields: props,
    //     updater: (prop, value) => { this[prop] = value; },
    //     onOpen,
    //   },
    // });

    // el.dispatchEvent(event);

    return onOpen.promise.then(() => {
      if (componentWillLoad) {
        return componentWillLoad.call(this);
      }
    });
  };
};
