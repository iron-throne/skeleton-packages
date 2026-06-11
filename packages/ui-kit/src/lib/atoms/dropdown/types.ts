export interface MenuItem {
    label: string;
    icon?: any;
    onclick: () => void;
    divider?: boolean; // render a divider BEFORE this item
    danger?: boolean;
    disabled?: boolean;
}

export type MenuAlign = 'right' | 'left';