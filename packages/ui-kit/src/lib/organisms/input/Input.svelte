<script lang="ts">
	import { type IFormField, EInputType, EPosition, NATIVE_TEXT_TYPES } from '@aryagg/types';
	import { onMount } from 'svelte';
	import { ExclamationCircle } from 'svelte-bootstrap-icons';
	import { applyDefaultRules } from '$lib/input-shared';
	import CheckboxInput from '$atoms/input-types/checkbox-input/CheckboxInput.svelte';
	import FileInput from '$atoms/input-types/file-input/FileInput.svelte';
	import MultiSelectInput from '$atoms/input-types/multi-select-input/MultiSelectInput.svelte';
	import PasswordInput from '$atoms/input-types/password-input/PasswordInput.svelte';
	import RadioInput from '$atoms/input-types/radio-input/RadioInput.svelte';
	import RangeInput from '$atoms/input-types/range-input/RangeInput.svelte';
	import SelectInput from '$atoms/input-types/select-input/SelectInput.svelte';
	import SwitchInput from '$atoms/input-types/switch-input/SwitchInput.svelte';
	import TextareaInput from '$atoms/input-types/textarea-input/TextareaInput.svelte';
	import TextInput from '$atoms/input-types/text-input/TextInput.svelte';
	import RichTextBox from '$molecules/rich-text-box/RichTextBox.svelte';

	let {
		field = $bindable(),
		icon,
		iconPosition = EPosition.LEFT,
		parentKlass,
		labelKlass
	}: {
		field: IFormField;
		icon?: any;
		iconPosition?: EPosition;
		parentKlass?: string;
		labelKlass?: string;
	} = $props();

	onMount(() => applyDefaultRules(field));
</script>

<!-- Reusable label markup. Rendered inline, AFTER the peer input, wherever labelKlass
     relies on peer-* variants (peer-* only matches siblings that follow the .peer element
     under the same parent — it can't reach backwards or into a nested wrapper). -->
{#snippet labelBlock()}
	<label for={field.id} class="section-label flex gap-1 {labelKlass ?? ''}">
		{#if field.icon}
			<field.icon width={14} height={14} class="text-content-tertiary" />
		{/if}
		{field.label}
		{#if field.required}
			<span class="text-accent text-xs">*</span>
		{/if}
	</label>
{/snippet}

<div class="flex flex-col gap-1 {parentKlass}">
	<!-- Label (types that render their own label inline, after their peer input, are excluded here) -->
	{#if !field.hideLabel && field.type !== EInputType.HIDDEN && field.type !== EInputType.PASSWORD}
		{@render labelBlock()}
	{/if}

	{#if NATIVE_TEXT_TYPES.has(field.type)}
		<TextInput bind:field {icon} {iconPosition} />
	{:else if field.type === EInputType.PASSWORD}
		<PasswordInput bind:field {icon} {iconPosition} {labelBlock} />
	{:else if field.type === EInputType.TEXTAREA}
		<TextareaInput bind:field />
	{:else if field.type === EInputType.CHECKBOX}
		<CheckboxInput bind:field />
	{:else if field.type === EInputType.SWITCH}
		<SwitchInput bind:field />
	{:else if field.type === EInputType.RADIO}
		<RadioInput bind:field />
	{:else if field.type === EInputType.RANGE}
		<RangeInput bind:field />
	{:else if field.type === EInputType.FILE}
		<FileInput bind:field />
	{:else if field.type === EInputType.SELECT || field.type === EInputType.SELECT_ADDNEW}
		<SelectInput bind:field />
	{:else if field.type === EInputType.MULTISELECT || field.type === EInputType.MULTISELECT_ADDNEW}
		<MultiSelectInput bind:field />
	{:else if field.type === EInputType.RICHTEXT}
		<RichTextBox bind:field />
	{/if}

	<!-- Helper / Error -->
	{#if field.errorMsg}
		<p class="text-error flex items-center gap-1 text-[11px] pt-1">
			<ExclamationCircle width={12} height={12} />
			{field.errorMsg}
		</p>
	{:else if field.helperText}
		<p class="text-tertiary text-[11px]">{field.helperText}</p>
	{/if}
</div>
