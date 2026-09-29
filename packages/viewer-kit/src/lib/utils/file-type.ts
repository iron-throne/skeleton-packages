import type { MediaFileType, OfficeFileType, SupportedFileType, ViewerSource } from '../types';

const mimeTypes: Record<string, SupportedFileType> = {
	'application/pdf': 'pdf',
	'application/msword': 'doc',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
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
	'image/x-dwg': 'dwg',
	'application/json': 'text',
	'application/xml': 'text',
	'application/javascript': 'text',
	'application/x-yaml': 'text',
	'application/yaml': 'text',
	'application/ogg': 'audio'
};

const mimePrefixes: [string, SupportedFileType][] = [
	['image/', 'image'],
	['video/', 'video'],
	['audio/', 'audio'],
	['text/', 'text']
];

const extensionGroups: Record<SupportedFileType, string[]> = {
	pdf: ['pdf'],
	doc: ['doc'],
	docx: ['docx'],
	ppt: ['ppt'],
	pptx: ['pptx'],
	xls: ['xls'],
	xlsx: ['xlsx'],
	dwg: ['dwg'],
	ifc: ['ifc'],
	gltf: ['gltf'],
	glb: ['glb'],
	svg: ['svg'],
	image: ['png', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'gif', 'webp', 'avif', 'bmp', 'ico', 'apng'],
	video: ['mp4', 'm4v', 'webm', 'ogv', 'mov', 'mkv'],
	audio: ['mp3', 'wav', 'ogg', 'oga', 'opus', 'm4a', 'aac', 'flac', 'weba'],
	text: [
		'txt', 'log', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'yaml', 'yml', 'ini', 'toml',
		'env', 'html', 'htm', 'css', 'scss', 'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'svelte', 'vue',
		'py', 'java', 'cs', 'c', 'h', 'cpp', 'go', 'rs', 'rb', 'php', 'sh', 'ps1', 'bat', 'sql'
	]
};

const extensions: Record<string, SupportedFileType> = Object.fromEntries(
	(Object.entries(extensionGroups) as [SupportedFileType, string[]][]).flatMap(([type, exts]) =>
		exts.map((ext) => [ext, type])
	)
);

export const officeFileTypes: OfficeFileType[] = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
export const mediaFileTypes: MediaFileType[] = ['image', 'video', 'audio'];

export function isOfficeType(value: SupportedFileType | undefined): value is OfficeFileType {
	return value !== undefined && (officeFileTypes as SupportedFileType[]).includes(value);
}

export function isMediaType(value: SupportedFileType | undefined): value is MediaFileType {
	return value !== undefined && (mediaFileTypes as SupportedFileType[]).includes(value);
}

export function detectFileType(
	source: ViewerSource,
	fileName?: string,
	mimeType?: string
): SupportedFileType | undefined {
	const knownMimeType = (mimeType || (source instanceof Blob ? source.type : '')).toLowerCase();
	if (knownMimeType) {
		if (mimeTypes[knownMimeType]) return mimeTypes[knownMimeType];
		if (knownMimeType.endsWith('+json') || knownMimeType.endsWith('+xml')) return 'text';
	}

	const candidates = [fileName, typeof source === 'string' ? source : undefined];
	for (const candidate of candidates) {
		if (!candidate) continue;
		const path = candidate.split(/[?#]/, 1)[0].toLowerCase();
		const extension = path.match(/\.([a-z0-9]+)$/)?.[1];
		if (extension && extensions[extension]) return extensions[extension];
	}

	for (const [prefix, type] of mimePrefixes) {
		if (knownMimeType.startsWith(prefix)) return type;
	}
	return undefined;
}

export function microsoftOfficeEmbedUrl(source: string): string {
	return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(source)}`;
}

export const microsoftPowerPointEmbedUrl = microsoftOfficeEmbedUrl;
