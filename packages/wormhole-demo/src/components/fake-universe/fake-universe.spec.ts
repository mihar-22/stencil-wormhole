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

const buildUniverse = (slot: string) => `<fake-universe>${slot}</fake-universe>`
const buildConsumer = () => '<fake-consumer />'

it('should pass data through the wormhole', async () => {
  await buildPage({
    html: buildUniverse(buildConsumer())
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
    html: buildUniverse(`${buildConsumer()}${buildUniverse(buildConsumer())}`)
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
    html: buildUniverse(buildConsumer())
  })
  
  const universe = page.body.querySelector('fake-universe')!
  const consumer = page.body.querySelector('fake-consumer')!

  document.body.innerHTML = '';
  await page.waitForChanges();

  expect(universe.wasConnectedCallbackCalled).toHaveBeenCalledWith('')
  expect(universe.wasDisconnectedCallbackCalled).toHaveBeenCalledWith('')
  expect(consumer.wasConnectedCallbackCalled).toHaveBeenCalledWith(undefined)
  expect(consumer.wasDisconnectedCallbackCalled).toHaveBeenCalledWith('')
});

it('should safely connect/disconnect universe', async () => {
  await buildPage({ html: '' })
  
  const universe = page.doc.createElement('fake-universe')!
  const consumer = page.doc.createElement('fake-consumer')!
  universe.appendChild(consumer);
  page.body.appendChild(universe);

  await page.waitForChanges();
  expect(consumer.message).toEqual('');
  universe.state = { message: 'apples' };
  await page.waitForChanges();
  expect(consumer.message).toEqual('apples');

  universe.remove();
  await page.waitForChanges();
  
  page.body.appendChild(universe);
  await page.waitForChanges();
  universe.state = { message: 'apples' };
  await page.waitForChanges();
  expect(consumer.message).toEqual('apples');
});

it('should safely connect/disconnect consumer', async () => {
  await buildPage({
    html: buildUniverse('')
  })
  
  const universe = page.body.querySelector('fake-universe')!
  const consumer = page.doc.createElement('fake-consumer');

  universe.appendChild(consumer);

  await page.waitForChanges();
  expect(consumer.message).toEqual('');
  expect(consumer.data).toEqual({});

  universe.state = { message: 'apples' };
  await page.waitForChanges();
  expect(consumer.message).toEqual('apples');

  consumer.remove();
  universe.state = { message: 'chicken' };
  await page.waitForChanges();
  expect(consumer.message).toEqual('apples');
});

it('should accept custom updater', async () => {
  await buildPage({
    html: buildUniverse('<div class="custom">Custom El</div>')
  });

  const universe = page.body.querySelector('fake-universe')!
  const customEl = page.root!.querySelector('div.custom');
  const customUpdater = jest.fn();

  customEl.dispatchEvent(new CustomEvent('openWormhole', {
    bubbles: true,
    detail: {
      consumer: customEl,
      fields: ['message'],
      updater: customUpdater,
    },
  }));

  universe.state = { message: 'lemons' };
  await page.waitForChanges();
  expect(customUpdater).toHaveBeenCalledWith('message', 'lemons');
});