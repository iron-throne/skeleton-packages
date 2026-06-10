<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { Save, ArrowClockwise, X } from 'svelte-bootstrap-icons';
	import { EInputType, type IForm, type IFormField, type InputValue } from '@aryagg/types';
	import Input from './Input.svelte';
	import { loaderStore } from '$lib/stores/loader.svelte';

	let {
		form = $bindable(),
		action,
		formClass,
		id,
		novalidate = false,
		submitLabel = 'Submit',
		cancelLabel = 'Cancel',
		hideSubmit = false,
		hideReset = false,
		hideCancel = false,
		hideActions = false,
		loading = $bindable(false),
		onSubmit,
		onResult,
		onReset,
		onCancel,
	}: {
		form: IForm;
		action?: string;
		formClass?: string;
		id?: string;
		submitLabel?: string;
		cancelLabel?: string;
		hideSubmit?: boolean;
		hideReset?: boolean;
		hideCancel?: boolean;
		hideActions?: boolean;
		novalidate?: boolean;
		loading?: boolean;
		onSubmit?: (formData: FormData) => void | Promise<void>;
		onResult?: (result: ActionResult) => void | Promise<void>;
		onReset?: () => void;
		onCancel?: () => void;
	} = $props();

	let formEl: HTMLFormElement;

	// Snapshot initial values at mount time for reset
	const initialValues = new Map<string, InputValue>(
		form.sections.flatMap((s) => s.fields.map((f) => [f.key, f.value ?? null])),
	);

	const allFields = $derived(form.sections.flatMap((s) => s.fields));
	const showActions = $derived(!hideActions && (!hideSubmit || !hideReset || !hideCancel));

	function isEmpty(field: IFormField): boolean {
		const v = field.value;
		if (field.type === EInputType.CHECKBOX) return v !== true;
		if (field.type === EInputType.MULTISELECT || field.type === EInputType.MULTISELECT_ADDNEW)
			return !Array.isArray(v) || v.length === 0;
		return v == null || v === '';
	}

	function validate(): boolean {
		let valid = true;
		for (const field of allFields) {
			if (field.required && isEmpty(field)) {
				field.errorMsg = `${field.label} is required`;
				valid = false;
				continue;
			}
			if (field.rules?.length && field.value != null) {
				const str = String(field.value);
				const failed = field.rules.find((r) => !str.match(r.regex));
				field.errorMsg = failed ? failed.message : '';
				if (failed) valid = false;
			} else {
				field.errorMsg = '';
			}
		}
		return valid;
	}

	export function submit() {
		formEl.requestSubmit();
	}

	const handleSubmit = async ({
		formData,
		cancel,
	}: {
		formData: FormData;
		cancel: () => void;
	}) => {
		if (!validate()) {
			cancel();
			return;
		}
		loaderStore.show();
		loading = true;
		if (onSubmit) {
			cancel();
			try {
				await onSubmit(formData);
			} finally {
				loaderStore.hide();
				loading = false;
			}
			return;
		}
		return async ({
			result,
			update,
		}: {
			result: ActionResult;
			update: () => Promise<void>;
		}) => {
			if (onResult) {
				await onResult(result);
			} else {
				await update(); // 
			}
			loaderStore.hide();

			loading = false;
		};
	};

	function handleReset() {
		for (const field of allFields) {
			field.value = initialValues.get(field.key) ?? null;
			field.errorMsg = '';
		}
		onReset?.();
	}
</script>

<form
	bind:this={formEl}
	{id}
	{action}
	method="POST"
	use:enhance={handleSubmit}
	{novalidate}
	class="mx-auto flex max-w-3xl flex-col gap-6 {formClass ?? ''}"
>
	{#each form.sections as section (section.id)}
		<div class={section.class}>
			{#if section.title}
				<div
					class="bg-surface-secondary/30 border-border-primary flex items-center gap-3 border-b px-6 py-2"
				>
					{#if section.icon}
						<span class="text-xl" aria-hidden="true">{section.icon}</span>
					{/if}
					<h2 class="text-content-primary text-base font-semibold">{section.title}</h2>
				</div>
			{/if}

			<div class="grid gap-6 sm:grid-cols-2">
				{#each section.fields as field, fInd (field.key)}
					<div class={field.classes ?? ''}>
						<Input bind:field={section.fields[fInd]!} />
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if showActions}
		<div class="flex items-center gap-2 pt-1">
			{#if !hideCancel}
				<button type="button" onclick={onCancel} class="btn btn-sm" disabled={loading}>
					<X width="13" />
					{cancelLabel}
				</button>
			{/if}
			{#if !hideReset}
				<button type="button" onclick={handleReset} class="btn btn-sm" disabled={loading}>
					<ArrowClockwise width="13" />
					Reset
				</button>
			{/if}
			{#if !hideSubmit}
				<button type="submit" class="btn btn-primary btn-sm ml-auto" disabled={loading}>
					{#if loading}
						<ArrowClockwise width="13" class="animate-spin" />
					{:else}
						<Save width="13" />
					{/if}
					{submitLabel}
				</button>
			{/if}
		</div>
	{/if}
</form>
