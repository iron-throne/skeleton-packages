import { EInputType } from "../types/input";

export const NATIVE_TEXT_TYPES = new Set([
    EInputType.TEXT,
    EInputType.EMAIL,
    EInputType.TEL,
    EInputType.URL,
    EInputType.SEARCH,
    EInputType.NUMBER,
    EInputType.DATE,
    EInputType.TIME,
    EInputType.DATETIME_LOCAL,
    EInputType.MONTH,
    EInputType.WEEK,
    EInputType.COLOR,
    EInputType.HIDDEN,
    EInputType.IMAGE,
]);

export const INPUT_TYPE_CLASSES: Partial<Record<EInputType, string>> = {
    [EInputType.COLOR]: 'h-10 px-2 py-1 cursor-pointer',
    [EInputType.PASSWORD]: 'pr-11',
    [EInputType.TEXTAREA]: 'resize-y',
    [EInputType.SELECT]: 'appearance-none cursor-pointer pr-10',
    [EInputType.SELECT_ADDNEW]: 'appearance-none cursor-pointer pr-10',
    [EInputType.RICHTEXT]: 'min-h-[8rem] prose prose-sm max-w-none focus:outline-none',
    [EInputType.CHECKBOX]: 'w-4 h-4 rounded accent-accent cursor-pointer bg-surface-primary',
    [EInputType.RANGE]: 'flex-1 accent-accent cursor-pointer',
    [EInputType.FILE]: 'h-10 py-0 flex items-center file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-surface-secondary file:text-content-primary hover:file:bg-accent hover:file:text-surface-primary file:cursor-pointer file:transition disabled:opacity-50',
};
