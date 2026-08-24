# @aryagg/viewer-kit

Extensible Svelte 5 file viewing components for documents, Office files, DWG drawings, and open BIM models. DWG, IFC, GLB, glTF, and SVG render locally in the browser without uploading files to a conversion service.

## Install

```sh
npm install @aryagg/viewer-kit
```

## Unified viewer

```svelte
<script lang="ts">
	import { FileViewer } from '@aryagg/viewer-kit';
</script>

<FileViewer source="/documents/report.pdf" heightClass="h-[80vh]" />
<FileViewer source="https://files.example.com/slides.pptx" />
<FileViewer source="https://files.example.com/budget.xlsx" />
<FileViewer source="/models/building.glb" />
<FileViewer source={localDwgFile} fileName={localDwgFile.name} />
```

The type is detected from the URL, `fileName`, or `mimeType`. It can also be explicit:

```svelte
<FileViewer source={pdfBlob} type="pdf" />
```

You may import `PdfViewer`, `PowerPointViewer`, and `ExcelViewer` directly when automatic detection is not needed.

## Local BIM and DWG viewer

IFC is decoded locally with WebAssembly. IFC and GLB/glTF models include orbit, pan, zoom-to-fit, lighting, a reference grid, element picking, and property display. SVG drawings open directly:

```svelte
<FileViewer source="/models/coordination.glb" />
<FileViewer source="/drawings/level-01.svg" />
```

DWG is decoded by local browser workers and rendered as an interactive 2D drawing. It includes pan, zoom, fit, entity selection, measurement, and layer visibility:

```svelte
<FileViewer source={dwgFile} fileName={dwgFile.name} />
```

Local files should come from a browser file input. A Windows path such as `C:/Models/building.ifc` is not a browser-readable URL:

```svelte
<script lang="ts">
	import { FileViewer } from '@aryagg/viewer-kit';
	let model = $state<File>();
</script>

<input
	type="file"
	accept=".dwg,.ifc,.glb,.gltf,.svg"
	onchange={(event) => (model = event.currentTarget.files?.[0])}
/>
{#if model}<FileViewer source={model} fileName={model.name} />{/if}
```

Serve the built app over HTTP or HTTPS (an existing static web server is enough). Browsers do not reliably allow module workers or local-file fetching from an SMB/`file://` page.

The DWG bridge uses the pure-TypeScript `@node-projects/acad-ts` reader inside a terminable browser worker with file-size, output-size, and elapsed-time safety limits. It writes the graphical DXF sections needed for preview while deliberately excluding the non-graphical object dictionary. Generated DXF is displayed only when it parses, contains a complete `ENTITIES` section, ends with `EOF`, and has finite geometry. The viewer reports when model-space entities could not be represented, and no drawing bytes are uploaded.

DWGs up to 64 MiB start automatically. Files from 64 to 192 MiB require an explicit confirmation because local decoding can consume more than 1 GB of memory; larger files are rejected to protect the tab. Selected `File`/`Blob` data is passed directly to the worker so the main page does not make another full-size copy.

AutoCAD Architecture and Civil 3D AEC/custom objects are not ordinary DWG drawing entities. If a drawing contains only those objects, the viewer reports that no browser-renderable model-space geometry exists. Use a matching PDF/DXF export for viewing, or use the authoring application to flatten/export the objects to standard AutoCAD entities first. Merely changing the DWG release number does not convert custom objects into standard geometry.

When a rejected DWG contains an embedded PNG or BMP thumbnail, the error view displays it as a clearly marked, non-interactive reference. `ViewerModal` also offers a companion-PDF picker and switches its header and content to that PDF without closing. The user must select the PDF explicitly: browser file pickers intentionally do not reveal the selected DWG's folder or grant access to sibling files.

This means no backend, cloud converter, hosted SDK, account, or upload is required. It is not literally dependency-free: the viewer embeds open-source parsing and rendering libraries. DWG is presented as 2D CAD geometry; use IFC/GLB for BIM elements and properties. Password-protected, damaged, or application-specific custom objects can still be rejected or omitted.

RVT, NWD, and NWC still require export to IFC or GLB before opening. The DWG reader and 2D renderer are MIT-licensed open-source dependencies; review the [acad-ts source](https://github.com/node-projects/acad-ts) and [CadView core source](https://github.com/wiscaksono/cadview/tree/main/packages/core) when preparing a distribution.

## Page and popup viewers

Use `ViewerPage` for a complete document-viewing screen with a modern header and file actions:

```svelte
<ViewerPage source={documentUrl} fileName="Project presentation.pptx" />
```

The parent controls the header branding and typography:

```svelte
<ViewerPage
	{source}
	fileName="Project presentation.pptx"
	appTitle="ARYA Document Center"
	appSubtitle="Project files and presentations"
	headerClass="border-slate-700 bg-slate-950 font-mono text-white"
	titleClass="text-base tracking-tight"
	subtitleClass="text-slate-400"
	accentClass="bg-cyan-400/10 text-cyan-300 ring-cyan-400/30"
	primaryActionClass="border-cyan-500 bg-cyan-500 text-slate-950"
/>
```

The same Tailwind class properties work on `ViewerModal`. When `appTitle` or `appSubtitle` is omitted, the viewer falls back to the file name and detected format. Components contain no internal CSS or inline styles.

Use `ViewerModal` for an accessible popup. `open` is bindable and the popup closes from its button, backdrop, or Escape key:

```svelte
<script lang="ts">
	import { ViewerModal } from '@aryagg/viewer-kit';
	let open = $state(false);
</script>

<button onclick={() => (open = true)}>Preview</button>
<ViewerModal bind:open {source} fileName="Report.pdf" />
```

## PowerPoint limitation

Browsers do not render PowerPoint files natively. By default, `PowerPointViewer` uses Microsoft Office's online embed viewer, so the document URL must be reachable by that service. Private files, authenticated URLs, `Blob`s, and localhost files need to be converted to PDF/images on a backend or served through a custom viewer.

Supply a custom embed adapter when your project has one:

```svelte
<FileViewer
	source={privatePresentationUrl}
	type="pptx"
	powerPointEmbedUrl={(url) => `/presentation-preview?source=${encodeURIComponent(url)}`}
/>
```

Excel uses the same Office web-viewer requirement. Public workbook URLs work by default. For private workbooks, provide `excelEmbedUrl` with your own preview service.

## Events and errors

Use callback props for loading and error handling:

```svelte
<FileViewer
	{source}
	onload={() => console.log('loaded')}
	onerror={(error) => console.error(error.code, error.message)}
/>
```

## Development

```sh
npm install
npm run check
npm run build
npm run dev
```
