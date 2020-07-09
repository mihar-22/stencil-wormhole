import { h, Component, Element, Prop } from "@stencil/core";
import { Universe } from "stencil-wormhole";

@Component({
  tag: 'fake-universe'
})
export class FakeUniverse {
  @Element() el!: HTMLElement;

  @Prop({ mutable: true }) state: Record<string, any> = {};

  @Prop() wasDisconnectedCallbackCalled = jest.fn()

  disconnectedCallback() {
    this.wasDisconnectedCallbackCalled()
  }

  render() {
    return (
      <Universe creator={this} state={this.state}>
        <fake-consumer />
      </Universe>
    )
  }
}
