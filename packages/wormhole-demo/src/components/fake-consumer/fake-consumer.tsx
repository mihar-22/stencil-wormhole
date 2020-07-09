import { h, Component, Prop } from "@stencil/core";
import { openWormhole } from "stencil-wormhole";

@Component({
  tag: 'fake-consumer',
})
export class FakeConsumer {
  @Prop() message: string = '';

  @Prop() data: any = {};

  @Prop() wasConnectedCallbackCalled = jest.fn()

  @Prop() wasDisconnectedCallbackCalled = jest.fn()

  connectedCallback() {
    this.wasConnectedCallbackCalled();
  }

  disconnectedCallback() {
    this.wasDisconnectedCallbackCalled()
  }

  render() {
    return (
      <div>{this.message}</div>
    )
  }
}

openWormhole(FakeConsumer, [
  'message',
  'data'
]);
