// 'hello world' → 'Hello world'
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// 'hello world' → 'Hello World'
export function titleCase(str: string): string {
	return str.replace(/\w\S*/g, (word) => capitalize(word));
}

// 'Hello World!' → 'hello-world'
//  into a URL‑friendly version:
export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// '<p>Hello</p>' → 'Hello'
export function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '');
}

// 'hello world foo' → 3
export function countWords(str: string): number {
	return str.trim().split(/\s+/).filter(Boolean).length;
}

// 'John Doe' → 'JD'
export function initials(name: string, max = 2): string {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, max)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

// maskString('4111111111111234') → '************1234'
export function maskString(str: string, visibleEnd = 4, mask = '*'): string {
	if (str.length <= visibleEnd) return str;
	return mask.repeat(str.length - visibleEnd) + str.slice(-visibleEnd);
}

// 'firstName' → 'first_name'
export function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

// 'first_name' → 'firstName'
export function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}