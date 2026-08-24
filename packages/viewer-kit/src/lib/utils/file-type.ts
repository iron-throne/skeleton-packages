import type { SupportedFileType, ViewerSource } from '../types';

const mimeTypes: Record<string, SupportedFileType> = {
	'application/pdf': 'pdf',
	'application/vnd.ms-powerpoint': 'ppt',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
	'application/vnd.ms-excel': 'xls',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
	'image/svg+xml': 'svg',
	'model/gltf+json': 'gltf',
	'model/gltf-binary': 'glb',
	'application/x-step': 'ifc',
	'application/acad': 'dwg',
	'application/x-acad': 'dwg',
	'application/dwg': 'dwg',
	'application/x-dwg': 'dwg',
	'image/vnd.dwg': 'dwg',
	'image/x-dwg': 'dwg'
};

export function detectFileType(
	source: ViewerSource,
	fileName?: string,
	mimeType?: string
): SupportedFileType | undefined {
	const knownMimeType = mimeType || (source instanceof Blob ? source.type : undefined);
	if (knownMimeType && mimeTypes[knownMimeType.toLowerCase()]) {
		return mimeTypes[knownMimeType.toLowerCase()];
	}

	const candidates = [fileName, typeof source === 'string' ? source : undefined];
	for (const candidate of candidates) {
		if (!candidate) continue;
		const path = candidate.split(/[?#]/, 1)[0].toLowerCase();
		if (path.endsWith('.pdf')) return 'pdf';
		if (path.endsWith('.pptx')) return 'pptx';
		if (path.endsWith('.ppt')) return 'ppt';
		if (path.endsWith('.xlsx')) return 'xlsx';
		if (path.endsWith('.xls')) return 'xls';
		if (path.endsWith('.dwg')) return 'dwg';
		if (path.endsWith('.ifc')) return 'ifc';
		if (path.endsWith('.gltf')) return 'gltf';
		if (path.endsWith('.glb')) return 'glb';
		if (path.endsWith('.svg')) return 'svg';
	}
	return undefined;
}

export function microsoftOfficeEmbedUrl(source: string): string {
	return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(source)}`;
}

export const microsoftPowerPointEmbedUrl = microsoftOfficeEmbedUrl;
