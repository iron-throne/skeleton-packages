import type { EDataType, EInputType } from "./input";

export interface IToast {
    id: number;
    message: string;
    type: ESnackType;
}

export interface ISnackData {
    message: string;
    type: ESnackType;
    timeOut?: number;
    class?: string;
}

export interface IGenericObject {
    [key: string]: any;
}

export interface ITab {
    id: string;
    label: string;
    badge?: string | number;
    disabled?: boolean;
    icon?: any;
}

export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    class?: string;
    type?: EDataType;
}

export enum ESnackType {
    SUCCESS = 'success',
    DANGER = 'danger',
    WARNING = 'warning',
    INFO = 'info',
}

export enum ETheme {
    LIGHT = 'light',
    DARK = 'dark'
}

export enum ELocale {
    EN = 'en',
    ES = 'es',
    AR = 'ar',
}
