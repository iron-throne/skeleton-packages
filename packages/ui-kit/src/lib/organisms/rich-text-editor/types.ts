import type { ISelectOption } from "@aryagg/types";

export interface IRichTextIcon {
    title: string;
    icon: string;
    command: string;
}

export interface IFormatOptions extends IRichTextIcon {
    type: 'select' | 'color';
    options?: ISelectOption[];
    id?: string;
}

export type TextFormatKeys = 'formatBlock' | 'fontSize' | 'foreColor' | 'hiliteColor';

export interface ITextFormat {
    formatBlock: string;
    fontSize: string;
    foreColor: string;
    hiliteColor: string;
}

export const HEADING_FORMATS: ISelectOption[] = [
    { label: 'Heading 1', value: 'text-4xl font-bold' },
    { label: 'Heading 2', value: 'text-3xl font-bold' },
    { label: 'Heading 3', value: 'text-2xl font-bold' },
    { label: 'Heading 4', value: 'text-xl font-bold' },
    { label: 'Heading 5', value: 'text-lg font-bold' },
    { label: 'Heading 6', value: 'text-base font-bold' },
    { label: 'Paragraph', value: 'text-base' },
];

export const FONT_SIZES: ISelectOption[] = [
    { label: 'Extra Small', value: 'text-xs' },
    { label: 'Small', value: 'text-sm' },
    { label: 'Base', value: 'text-base' },
    { label: 'Medium', value: 'text-md' },
    { label: 'Large', value: 'text-lg' },
    { label: 'Extra Large', value: 'text-xl' },
    { label: '2XL', value: 'text-2xl' },
    { label: '3XL', value: 'text-3xl' },
];

export const FORMAT_OPTIONS: IFormatOptions[] = [
    { title: 'Heading', command: 'formatBlock', type: 'select', options: HEADING_FORMATS, icon: '' },
    { title: 'Font Size', command: 'fontSize', type: 'select', options: FONT_SIZES, icon: '' },
    { title: 'Color', command: 'foreColor', type: 'color', options: [], icon: '', id: 'foreColor' },
    { title: 'Background Color', command: 'hiliteColor', type: 'color', options: [], icon: '', id: 'hiliteColor' },
];

export const RICHTEXT_ICONS: IRichTextIcon[] = [
    { title: 'Bold', icon: 'bi-type-bold', command: 'bold' },
    { title: 'Underline', icon: 'bi-type-underline', command: 'underline' },
    { title: 'Italic', icon: 'bi-type-italic', command: 'italic' },
    { title: 'Strikethrough', icon: 'bi-type-strikethrough', command: 'strikethrough' },
    { title: 'Align Left', icon: 'bi-text-left', command: 'justifyLeft' },
    { title: 'Align Center', icon: 'bi-text-center', command: 'justifyCenter' },
    { title: 'Align Right', icon: 'bi-text-right', command: 'justifyRight' },
    { title: 'Align Justify', icon: 'bi-justify', command: 'justifyJustify' },
    { title: 'List (ol)', icon: 'bi-list-ol', command: 'insertOrderedList' },
    { title: 'List (ul)', icon: 'bi-list-ul', command: 'insertUnorderedList' },
    { title: 'Link', icon: 'bi-link', command: 'createLink' },
    { title: 'Undo', icon: 'bi-arrow-counterclockwise', command: 'undo' },
    { title: 'Redo', icon: 'bi-arrow-clockwise', command: 'redo' },
];
