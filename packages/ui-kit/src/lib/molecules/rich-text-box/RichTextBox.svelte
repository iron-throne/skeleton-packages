<script lang="ts">
	import type { IFormField } from '@aryagg/types';
	import RichTextEditor from '$molecules/rich-text-editor/RichTextEditor.svelte';
	import { emitValue } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();

	// One-way: RichTextEditor only reads `value` once (onMount), so re-passing it on every
	// keystroke (via emitValue below) can't reset the caret the way a reactive sync would.
	const value = $derived(typeof field.value === 'string' ? field.value : '');
</script>

<RichTextEditor
	uniqRef={field.id}
	{value}
	required={field.required}
	disabled={field.disabled}
	placeholder={field.placeholder}
	ariaLabel={field.label}
	onChangeInput={(el) => emitValue(field, el.innerHTML)}
/>
