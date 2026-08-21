export type BimFileType = 'dwg' | 'dxf' | 'ifc' | 'rvt' | 'nwd' | 'nwc' | 'gltf' | 'glb' | 'svg';
export type SupportedFileType = 'pdf' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | BimFileType;
export type ViewerSource = string | Blob;

export interface BimViewable {
	source: ViewerSource;
	type: 'gltf' | 'glb' | 'svg' | 'iframe';
}

export type BimConverter = (
	source: ViewerSource,
	type: Exclude<BimFileType, 'gltf' | 'glb' | 'svg'>
) => Promise<BimViewable>;

export interface ViewerError {
	code: 'UNSUPPORTED_TYPE' | 'INVALID_SOURCE' | 'LOAD_FAILED';
	message: string;
	cause?: unknown;
}

export interface BaseViewerProps {
	class?: string;
	title?: string;
	heightClass?: string;
	onload?: () => void;
	onerror?: (error: ViewerError) => void;
}

export interface FileViewerProps extends BaseViewerProps {
	source: ViewerSource;
	type?: SupportedFileType;
	fileName?: string;
	mimeType?: string;
	showToolbar?: boolean;
	powerPointEmbedUrl?: (source: string) => string;
	excelEmbedUrl?: (source: string) => string;
	bimConverter?: BimConverter;
}

export interface ViewerContainerProps extends FileViewerProps {
	downloadName?: string;
	showOpenAction?: boolean;
	showDownloadAction?: boolean;
	appTitle?: string;
	appSubtitle?: string;
	headerClass?: string;
	titleClass?: string;
	subtitleClass?: string;
	accentClass?: string;
	primaryActionClass?: string;
}

export interface ViewerModalProps extends ViewerContainerProps {
	open?: boolean;
	onclose?: () => void;
}
