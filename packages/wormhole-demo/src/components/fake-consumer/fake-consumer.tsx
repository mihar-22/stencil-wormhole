import { h, Component, Prop } from "@stencil/core";
import { openWormhole } from "stencil-wormhole";

@Component({
  tag: "fake-consumer",
})
export class FakeConsumer {
  @Prop() message!: string;

  @Prop() data!: any;

  @Prop() wasConnectedCallbackCalled:any = jest.fn();

  @Prop() wasDisconnectedCallbackCalled:any = jest.fn();

  connectedCallback() {
    this.wasConnectedCallbackCalled(this.message);
  }

  disconnectedCallback() {
    this.wasDisconnectedCallbackCalled(this.message);
  }

  render() {
    return <div>{this.message}</div>;
  }
}

openWormhole(FakeConsumer, ["message", "data"]);
