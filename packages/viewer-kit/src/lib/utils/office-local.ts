import type { ViewerSource } from '../types';

export interface SheetCell {
	text: string;
	colSpan: number;
	rowSpan: number;
}

export interface ParsedSheet {
	name: string;
	rows: SheetCell[][];
	/** True when the sheet had more rows than `maxRows` and was cut short. */
	truncated: boolean;
}

/** Resolves a viewer source to its bytes: a Blob is used as-is, a URL is fetched. */
export async function loadSourceBlob(source: ViewerSource, signal?: AbortSignal): Promise<Blob> {
	if (source instanceof Blob) return source;
	const response = await fetch(source, { signal });
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	return response.blob();
}

/** Spreadsheet column label for a zero-based index: 0 → A, 26 → AA. */
export function columnLabel(index: number): string {
	let label = '';
	for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
		label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
	return label;
}

/**
 * Parses an .xlsx workbook into plain rows/cells, keeping number formats and merged cells.
 * exceljs and ssf are large, so they load only when a workbook is actually opened.
 */
export async function parseXlsx(buffer: ArrayBuffer, maxRows = 2000): Promise<ParsedSheet[]> {
	const [{ default: ExcelJS }, { default: SSF }] = await Promise.all([
		import('exceljs'),
		import('ssf')
	]);
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(buffer);

	return workbook.worksheets.map((sheet) => {
		const skip = new Set<string>();
		const spans = new Map<string, { colSpan: number; rowSpan: number }>();
		// exceljs keeps merge ranges on an internal model; read them defensively.
		const merges: string[] = (sheet.model as unknown as { merges?: string[] }).merges ?? [];
		for (const range of merges) {
			const [start, end] = range.split(':');
			if (!start || !end) continue;
			const a = sheet.getCell(start);
			const b = sheet.getCell(end);
			const top = Number(a.row);
			const left = Number(a.col);
			const bottom = Number(b.row);
			const right = Number(b.col);
			spans.set(`${top}:${left}`, { colSpan: right - left + 1, rowSpan: bottom - top + 1 });
			for (let r = top; r <= bottom; r++)
				for (let c = left; c <= right; c++) if (r !== top || c !== left) skip.add(`${r}:${c}`);
		}

		const rows: SheetCell[][] = [];
		const rowCount = Math.min(sheet.rowCount, maxRows);
		for (let r = 1; r <= rowCount; r++) {
			const row = sheet.getRow(r);
			if (row.hidden) continue;
			const cells: SheetCell[] = [];
			for (let c = 1; c <= sheet.columnCount; c++) {
				if (skip.has(`${r}:${c}`)) continue;
				const cell = row.getCell(c);
				let text = cell.text ?? '';
				const format = cell.numFmt;
				if (format && typeof cell.value === 'number') {
					try {
						text = SSF.format(format, cell.value);
					} catch {
						/* keep exceljs text */
					}
				}
				cells.push({ text, ...(spans.get(`${r}:${c}`) ?? { colSpan: 1, rowSpan: 1 }) });
			}
			rows.push(cells);
		}
		return { name: sheet.name, rows, truncated: sheet.rowCount > maxRows };
	});
}
