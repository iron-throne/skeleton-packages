<script lang="ts">
	import Icon from '../../atoms/icon/Icon.svelte';
	import { ESize } from '@aryagg/types';
	import { cubicOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import { XLg } from 'svelte-bootstrap-icons';
	import type { DialogProps, DialogRadius, DialogVariant } from './types';
	import { uniqId } from '@aryagg/utils';

	let {
		open = $bindable(false),
		title = '',
		description = '',
		icon = null,
		variant = 'default',
		size = ESize.MD,
		radius = 'lg',
		dismissible = true,
		closeOnBackdrop = true,
		closeOnEsc = true,
		class: className = '',
		backdropClass = '',
		panelClass = '',
		headerClass = '',
		bodyClass = '',
		footerClass = '',
		children,
		header,
		footer,
		onClose
	}: DialogProps = $props();

	const titleId = uniqId();
	const descriptionId = uniqId();

	const sizeClass: Partial<Record<ESize, string>> = {
		[ESize.XS]: 'max-w-xs',
		[ESize.SM]: 'max-w-sm',
		[ESize.MD]: 'max-w-lg',
		[ESize.LG]: 'max-w-2xl',
		[ESize.XL]: 'max-w-4xl',
		[ESize.XL2]: 'max-w-5xl',
		[ESize.XL3]: 'max-w-6xl',
		[ESize.XL4]: 'max-w-7xl',
		[ESize.FULL]: 'max-w-[calc(100vw-2rem)]'
	};
	const radiusClass: Record<DialogRadius, string> = {
		none: 'rounded-none',
		sm: 'rounded-md',
		md: 'rounded-lg',
		lg: 'rounded-xl',
		xl: 'rounded-2xl'
	};
	const variantClass: Record<DialogVariant, string> = {
		default: 'bg-accent/10 text-accent',
		info: 'bg-info/10 text-info',
		success: 'bg-success/10 text-success',
		warning: 'bg-warning/15 text-warning',
		danger: 'bg-error/10 text-error'
	};

	function close() {
		if (!dismissible) return;
		open = false;
		onClose?.();
	}

	function handleBackdrop(event: MouseEvent) {
		if (closeOnBackdrop && event.target === event.currentTarget) close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (open && closeOnEsc && event.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-2000 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm {backdropClass} {className}"
		role="presentation"
		onclick={handleBackdrop}
		transition:fade={{ duration: 160 }}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
			aria-describedby={description ? descriptionId : undefined}
			class="relative flex max-h-[75vh] md:max-h-[80vh] lg:max-h-[90vh] w-full flex-col overflow-hidden border border-border-primary bg-surface-primary text-primary shadow-2xl {sizeClass[
				size
			] ?? sizeClass[ESize.MD]} {radiusClass[radius]} {panelClass}"
			transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
		>
			{#if header}
				{@render header()}
			{:else if title || description || icon || dismissible}
				<header
					class="flex shrink-0 items-start gap-3 border-b border-border-primary px-5 py-4 {headerClass}"
				>
					{#if icon}
						<span
							class="grid size-9 shrink-0 place-items-center rounded-full {variantClass[variant]}"
						>
							<Icon {icon} klass="size-4" />
						</span>
					{/if}
					<div class="min-w-0 flex-1">
						{#if title}<h2 id={titleId} class="text-base font-semibold text-primary">
								{title}
							</h2>{/if}
						{#if description}
							<p id={descriptionId} class="mt-1 text-sm leading-5 text-secondary">{description}</p>
						{/if}
					</div>
					{#if dismissible}
						<button
							type="button"
							aria-label="Close dialog"
							class="grid size-8 shrink-0 place-items-center rounded-md border-0! bg-transparent! p-0! text-tertiary! hover:bg-surface-secondary! hover:text-primary!"
							onclick={close}
						>
							<XLg class="size-4" />
						</button>
					{/if}
				</header>
			{/if}

			<div class="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm text-secondary {bodyClass}">
				{@render children()}
			</div>

			{#if footer}
				<footer
					class="flex shrink-0 items-center justify-end gap-2 border-t border-border-primary bg-surface-secondary/50 px-5 py-4 {footerClass}"
				>
					{@render footer()}
				</footer>
			{/if}
		</div>
	</div>
{/if}
