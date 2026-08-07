<script lang="ts">
  // Dev-only preview shell — same pattern as the other packages in this
  // monorepo (see ui-kit/src/App.svelte). Never shipped: package.json's
  // "exports" field only publishes `src/lib`, so nothing here reaches
  // anyone who does `import { mountRemotePlugin } from '@aryagg/remote-plugins'`.
  //
  // Its only job is to prove the library actually works end-to-end:
  // a HOST (this component) mounts a REMOTE plugin
  // (./demo/exampleRemotePlugin.ts) exactly the way a real host app would.
  import { onMount, onDestroy } from "svelte";
  import "@aryagg/theme";
  import { ETheme } from "@aryagg/types";
  import {
    mountRemotePlugin,
    createRemotePluginBus,
    RemotePluginMode,
    ERemoteAppEvent,
    type IRemotePluginManifest,
    type IRemotePluginContext,
    type IMountedRemotePlugin,
  } from "./lib";

  let targetEl: HTMLDivElement;
  let mounted = $state(false);
  let theme = $state<ETheme>(ETheme.LIGHT);
  let loggedIn = $state(false);
  let log = $state<string[]>([]);

  let controller: IMountedRemotePlugin | undefined;
  // One bus per mounted instance — created once, reused across update()
  // calls, cleared by the controller on destroy().
  const bus = createRemotePluginBus();

  // In production this URL would point at a plugin deployed on its own
  // domain (e.g. "https://plugins.example.com/course-widget/v1/entry.js").
  // Here it points at a file inside THIS project purely so the demo has
  // something real to fetch — mountRemotePlugin() has no idea the two are
  // related, it just does `import(entryUrl)`.
  const manifest: IRemotePluginManifest = {
    id: "demo-widget",
    name: "Demo Widget",
    version: "1.0.0",
    entryUrl: new URL("./demo/exampleRemotePlugin.ts", import.meta.url).href,
    modes: [RemotePluginMode.WIDGET],
  };

  function appendLog(entry: string) {
    log = [...log.slice(-9), entry];
  }

  // Rebuilt on every toggle so `controller.update()` always gets a fresh,
  // consistent snapshot — `bus` and `navigate` stay the same reference,
  // only the data (theme/user) changes.
  function currentContext(): IRemotePluginContext {
    return {
      apiVersion: 1,
      host: { id: "demo-host", name: "Remote Plugins Demo" },
      user: loggedIn
        ? { id: "u1", name: "Arya", email: "arya@example.com", role: "admin" }
        : null,
      theme,
      locale: "en",
      mode: RemotePluginMode.WIDGET,
      params: {},
      navigate: (path) =>
        appendLog(`remote asked host to navigate → "${path}"`),
      bus,
    };
  }

  onMount(async () => {
    // These MUST be registered before mountRemotePlugin() is called: the
    // remote plugin emits ERemoteAppEvent.READY synchronously inside its
    // own mount(), which runs before mountRemotePlugin() returns. Attach
    // listeners after awaiting it and you silently miss that first event.
    bus.on(ERemoteAppEvent.READY, () => appendLog("remote → host: ready"));
    bus.on(ERemoteAppEvent.CUSTOM_EVENT, (payload) =>
      appendLog(`remote → host: custom_event ${JSON.stringify(payload)}`),
    );
    bus.on(ERemoteAppEvent.NAVIGATE, (payload) => {
      const path = (payload as { path?: string })?.path ?? "";
      appendLog(`remote → host: navigate("${path}")`);
    });

    controller = await mountRemotePlugin(manifest, targetEl, currentContext());
    mounted = true;
  });

  onDestroy(() => {
    controller?.destroy();
  });

  function toggleTheme() {
    theme = theme === ETheme.LIGHT ? ETheme.DARK : ETheme.LIGHT;
    document.documentElement.classList.toggle("dark", theme === ETheme.DARK);
    controller?.update(currentContext());
  }

  function toggleUser() {
    loggedIn = !loggedIn;
    controller?.update(currentContext());
  }

  async function unmountPlugin() {
    await controller?.destroy();
    mounted = false;
    appendLog("host: destroyed the plugin instance");
  }
</script>

<div
  class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8 text-primary"
>
  <header>
    <h1 class="font-bold text-2xl">@aryagg/remote-plugins — live demo</h1>
    <p class="text-secondary">
      The panel below is the <strong>host</strong>. The card inside it is a
      <strong>remote plugin</strong>, loaded through
      <code>mountRemotePlugin()</code>
      exactly like it would be from a separately-deployed micro-app.
    </p>
  </header>

  <div class="flex flex-wrap gap-3">
    <button
      class="rounded-md border border-border-primary bg-surface-primary px-3 py-1.5 text-sm hover:bg-surface-secondary"
      onclick={toggleTheme}
    >
      Toggle theme (currently {theme})
    </button>
    <button
      class="rounded-md border border-border-primary bg-surface-primary px-3 py-1.5 text-sm hover:bg-surface-secondary"
      onclick={toggleUser}
    >
      {loggedIn ? "Log out" : "Log in"}
    </button>
    <button
      class="rounded-md border border-border-primary bg-surface-primary px-3 py-1.5 text-sm hover:bg-surface-secondary disabled:opacity-40"
      onclick={unmountPlugin}
      disabled={!mounted}
    >
      Destroy plugin
    </button>
  </div>

  <section
    class="rounded-lg border border-border-primary bg-surface-secondary p-4"
  >
    <p class="mb-2 text-tertiary text-xs uppercase tracking-wide">
      host container (target element)
    </p>
    <div bind:this={targetEl}></div>
    {#if !mounted}
      <p class="text-tertiary text-sm italic">plugin not mounted</p>
    {/if}
  </section>

  <section>
    <p class="mb-2 text-tertiary text-xs uppercase tracking-wide">
      bus event log (last 10)
    </p>
    <ul
      class="flex flex-col gap-1 rounded-lg border border-border-primary bg-surface-primary p-3 font-mono text-xs"
    >
      {#each log as entry (entry)}
        <li>{entry}</li>
      {:else}
        <li class="text-tertiary italic">no events yet</li>
      {/each}
    </ul>
  </section>
</div>

<style>
  :global(.remote-plugin-card) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px dashed var(--semantic-accent);
    background-color: var(--surface-primary);
  }
  :global(.remote-plugin-card__badge) {
    margin: 0;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--semantic-accent);
  }
  :global(.remote-plugin-card button) {
    border: 1px solid var(--border-primary);
    border-radius: 0.375rem;
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
    background-color: var(--surface-secondary);
    color: var(--text-primary);
  }
  :global(.remote-plugin-card button:hover) {
    background-color: var(--surface-tertiary);
  }
</style>
