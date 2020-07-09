import {getElement} from "@stencil/core";

export interface OpenWormhole {
  consumer: any
  fields: string[]
}

export interface CloseWormhole {
  consumer: any
}

export interface WormholeConsumer {
  // ...
}

export interface WormholeConsumerConstructor {
  new(...args: any[]): WormholeConsumer
}

export const openWormhole = (Component: WormholeConsumerConstructor, props: string[]) => {
  const ComponentPrototype = Component.prototype;
  const { connectedCallback, disconnectedCallback } = ComponentPrototype;

  ComponentPrototype.connectedCallback = function () {
    const el = getElement(this);

    const event = new CustomEvent<OpenWormhole>('openWormhole', {
      bubbles: true,
      composed: true,
      detail: {
        consumer: this,
        fields: props,
      },
    });

    el.dispatchEvent(event);

    if (connectedCallback) {
      return connectedCallback.call(this);
    }
  };

  ComponentPrototype.disconnectedCallback = function () {
    const el = getElement(this);

    const event = new CustomEvent<CloseWormhole>('closeWormhole', {
      bubbles: true,
      composed: true,
      detail: { consumer: this },
    });

    el.dispatchEvent(event);

    if (disconnectedCallback) {
      disconnectedCallback.call(this);
    }
  };
};
