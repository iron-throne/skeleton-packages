export interface IForm {
    name?: string;
    icon?: string;
    formClass?: string;
    sections: IFormSection[];
}

export interface IFormSection {
    title?: string;
    icon?: any;
    id: string;
    class?: string;
    fields: IFormField[];
}

export interface IFormField {
    key: string;
    id: string;
    label: string;
    hideLabel?: boolean;
    placeholder?: string;
    type: EInputType;
    value?: InputValue;
    icon?: any;
    helperText?: string;
    required?: boolean;
    rules?: Array<IValidationRule>;
    attributes?: Record<string, string | number | boolean>;
    disabled?: boolean;
    readOnly?: boolean;
    klass?: string;
    options?: Array<ISelectOption>;
    multiple?: boolean;
    errorMsg?: string;
    onChange?: (value: InputValue) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onInput?: () => void;
    onKeydown?: (e: KeyboardEvent) => void;
}

export interface ISelectOption {
    label: string;
    value: any;
    icon?: any;
}

export interface IValidationRule {
    regex: RegExp;
    message: string;
}

export enum EInputType {
    TEXT = 'text',
    PASSWORD = 'password',
    EMAIL = 'email',
    NUMBER = 'number',
    SEARCH = 'search',
    TEL = 'tel',
    URL = 'url',
    DATE = 'date',
    TIME = 'time',
    DATETIME_LOCAL = 'datetime-local',
    MONTH = 'month',
    WEEK = 'week',
    FILE = 'file',
    IMAGE = 'image',
    COLOR = 'color',
    TEXTAREA = 'textarea',
    CHECKBOX = 'checkbox',
    RADIO = 'radio',
    RANGE = 'range',
    HIDDEN = 'hidden',
    SELECT = 'select',
    MULTISELECT = 'multiselect',
    MULTISELECT_ADDNEW = 'multiselect_add_new',
    SELECT_ADDNEW = 'select_add_new',
    RICHTEXT = 'richtext',
}

export enum EDataType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    DATE = 'date',
    ARRAY = 'array',
    OBJECT = 'object',
    NULL = 'null',
}

export type InputValue = string | number | boolean | File | File[] | null;
