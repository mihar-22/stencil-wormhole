import { NewSpecPageOptions, SpecPage } from "@stencil/core/internal";
import { newSpecPage } from "@stencil/core/testing";
import { FakeUniverse } from "./fake-universe";
import { FakeConsumer } from "../fake-consumer/fake-consumer";

let page: SpecPage;

const buildPage = async (opts?: Partial<NewSpecPageOptions>) => {
  page = await newSpecPage({
    components: [FakeUniverse, FakeConsumer],
    ...opts,
  });
};

it('should pass data through the wormhole', async () => {
  await buildPage({
    html: '<fake-universe></fake-universe>'
  })

  const universe = page.body.querySelector('fake-universe')!
  const consumer = page.body.querySelector('fake-consumer')!

  expect(consumer.message).toEqual('');
  expect(consumer.data).toEqual({})
  universe.state = { message: 'apples', data: { apples: 1 } }
  await page.waitForChanges();
  expect(consumer.message).toEqual('apples')
  expect(consumer.data).toEqual({ apples: 1 })
});

it('should be instance scoped', async () => {
  await buildPage({
    html: '<fake-universe></fake-universe><fake-universe></fake-universe>'
  })

  const universes = page.body.querySelectorAll('fake-universe')!
  const consumerA = universes[0].querySelector('fake-consumer')!;
  const consumerB = universes[1].querySelector('fake-consumer')!

  universes[0].state = { message: 'apples' }
  await page.waitForChanges();
  expect(consumerA.message).toEqual('apples')
  expect(consumerB.message).toEqual('')
  universes[1].state = { message: 'apples and more apples' }
  await page.waitForChanges();
  expect(consumerA.message).toEqual('apples')
  expect(consumerB.message).toEqual('apples and more apples')

});

it('should call lifecycle methods', async () => {
  await buildPage({
    html: '<fake-universe></fake-universe>'
  })

  const universe = page.body.querySelector('fake-universe')!
  const consumer = page.body.querySelector('fake-consumer')!
  document.body.innerHTML = '';
  await page.waitForChanges();
  expect(universe.wasDisconnectedCallbackCalled).toHaveBeenCalled()
  expect(consumer.wasConnectedCallbackCalled).toHaveBeenCalled()
  expect(consumer.wasDisconnectedCallbackCalled).toHaveBeenCalled()
});
