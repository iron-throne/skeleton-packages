export type BimFileType = 'ifc' | 'gltf' | 'glb' | 'svg';
export type OfficeFileType = 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx';
export type MediaFileType = 'image' | 'video' | 'audio';
export type SupportedFileType =
	| 'pdf'
	| 'dwg'
	| 'text'
	| OfficeFileType
	| MediaFileType
	| BimFileType;
export type ViewerSource = string | Blob;

export interface BimViewable {
	source: ViewerSource;
	type: BimFileType;
}

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

export interface ViewerOpenRequest {
	source: ViewerSource;
	type: SupportedFileType;
	fileName?: string;
	mimeType?: string;
}

export interface ViewerDownloadRequest {
	source: ViewerSource;
	fileName?: string;
	mimeType?: string;
	type?: SupportedFileType;
}

export interface FileViewerProps extends BaseViewerProps {
	source: ViewerSource;
	type?: SupportedFileType;
	fileName?: string;
	mimeType?: string;
	showToolbar?: boolean;
	showPowerPointOpenInNewWindow?: boolean;
	powerPointEmbedUrl?: (source: string) => string;
	excelEmbedUrl?: (source: string) => string;
	wordEmbedUrl?: (source: string) => string;
	onrequestopen?: (request: ViewerOpenRequest) => void;
	/** Shown as a Download button on the fallback card for files that cannot be previewed. */
	ondownload?: (request: ViewerDownloadRequest) => void;
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
