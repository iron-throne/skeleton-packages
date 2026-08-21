# @aryagg/viewer-kit

Extensible Svelte 5 file viewing components for documents, Office files, and BIM/CAD models. GLB, glTF, and SVG render directly; DWG, DXF, IFC, RVT, NWD, and NWC connect through a conversion adapter.

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
```

The type is detected from the URL, `fileName`, or `mimeType`. It can also be explicit:

```svelte
<FileViewer source={pdfBlob} type="pdf" />
```

You may import `PdfViewer`, `PowerPointViewer`, and `ExcelViewer` directly when automatic detection is not needed.

## BIM and CAD viewer

GLB/glTF models include orbit, pan, zoom-to-fit, lighting, a reference grid, element picking, and display of simple metadata from glTF `extras`. SVG drawings open directly:

```svelte
<FileViewer source="/models/coordination.glb" />
<FileViewer source="/drawings/level-01.svg" />
```

Browsers cannot decode native DWG, RVT, or Navisworks files. Provide a converter that uploads the source to Autodesk APS or an internal conversion service and returns a web-viewable result:

```svelte
<script lang="ts">
	import { FileViewer, type BimConverter } from '@aryagg/viewer-kit';

	const bimConverter: BimConverter = async (source, type) => {
		const body = new FormData();
		body.append('file', source);
		body.append('type', type);
		const response = await fetch('/api/bim/convert', { method: 'POST', body });
		if (!response.ok) throw new Error('Conversion failed');
		return response.json();
	};
</script>

<FileViewer source={dwgFile} fileName={dwgFile.name} {bimConverter} />
```

The converter may return `gltf`, `glb`, `svg`, or `iframe`. Use `iframe` when the backend returns an Autodesk APS Viewer page or another hosted viewer.

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
