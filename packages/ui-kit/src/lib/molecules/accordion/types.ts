import type { ESize, IconType } from "@aryagg/types";
import type { Snippet } from "svelte";

export interface IAccordionProps {
  "id": string,
  "items": IAccordionData[];
  "leftIcon"?: IExpandIcon;
  "rightIcon"?: IExpandIcon;

  // Behavior
  multiple?: boolean;              // allow multiple open
  collapsible?: boolean;           // allow closing last item
  mandatory?: boolean;             // at least one must stay open
  mandatoryId?: number|string;
  disabled?: boolean;              // disable entire accordion
  readonly?: boolean;              // cannot toggle
  size?:ESize;
  disableListClick?:boolean;

  // Styling
  variant?: "default" | "outlined" | "text" | "inset" | "accordion" | "popout";
  density?: "compact" | "comfortable" | "default";
  parentklass?: string;                  // custom classes


  // Slots / advanced
  listKlass?: string;
  detailKlass?: string;
  summaryKlass?: string;
  articleKlass?: string;
}

export interface IAccordionData {
  "id": number | string,
  "title": string | Snippet;
  subtitle?: string;
  content: string | Snippet;
  disabled?: boolean;              // disable item
  expanded?: boolean;              // override default open
  klass?: string;                  // custom classes
}
export interface IExpandIcon {
  expandIcon: IconType;
  collapseIcon?: IconType;
  onclick?: (id:string|number) => void
}