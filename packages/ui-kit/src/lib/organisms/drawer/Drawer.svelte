<script lang="ts">
	import Icon from '../../atoms/icon/Icon.svelte';
	import { ESize } from '@aryagg/types';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { XLg } from 'svelte-bootstrap-icons';
	import type { DrawerPosition, DrawerProps, DrawerVariant } from './types';

	let {
		open = $bindable(false),
		title = '',
		description = '',
		icon = null,
		variant = 'default',
		position = 'right',
		size = ESize.MD,
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
	}: DrawerProps = $props();

	const titleId = crypto.randomUUID();
	const descriptionId = crypto.randomUUID();

	const sizeClass: Partial<Record<ESize, string>> = {
		[ESize.XS]: 'max-w-xs',
		[ESize.SM]: 'max-w-sm',
		[ESize.MD]: 'max-w-md',
		[ESize.LG]: 'max-w-lg',
		[ESize.XL]: 'max-w-xl',
		[ESize.XL2]: 'max-w-2xl',
		[ESize.XL3]: 'max-w-3xl',
		[ESize.FULL]: 'max-w-full'
	};
	const variantClass: Record<DrawerVariant, string> = {
		default: 'bg-accent/10 text-accent',
		info: 'bg-info/10 text-info',
		success: 'bg-success/10 text-success',
		warning: 'bg-warning/15 text-warning',
		danger: 'bg-error/10 text-error'
	};

	const justifyClass = $derived(position === 'left' ? 'justify-start' : 'justify-end');
	const borderClass = $derived(position === 'left' ? 'border-r' : 'border-l');
	const flyX = $derived(position === 'left' ? -400 : 400);

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
		class="fixed inset-0 z-2000 flex {justifyClass} bg-black/40 backdrop-blur-sm {backdropClass} {className}"
		role="presentation"
		onclick={handleBackdrop}
		transition:fade={{ duration: 160 }}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
			aria-describedby={description ? descriptionId : undefined}
			class="border-border-primary bg-surface-primary text-primary relative flex h-full w-full flex-col overflow-hidden {borderClass} shadow-2xl {sizeClass[
				size
			] ?? sizeClass[ESize.MD]} {panelClass}"
			transition:fly={{ x: flyX, duration: 220, easing: cubicOut }}
		>
			{#if header}
				{@render header()}
			{:else if title || description || icon || dismissible}
				<header
					class="border-border-primary flex shrink-0 items-start gap-3 border-b px-5 py-4 {headerClass}"
				>
					{#if icon}
						<span
							class="grid size-9 shrink-0 place-items-center rounded-full {variantClass[variant]}"
						>
							<Icon {icon} klass="size-4" />
						</span>
					{/if}
					<div class="min-w-0 flex-1">
						{#if title}<h2 id={titleId} class="text-primary text-base font-semibold">
								{title}
							</h2>{/if}
						{#if description}
							<p id={descriptionId} class="text-secondary mt-1 text-sm leading-5">
								{description}
							</p>
						{/if}
					</div>
					{#if dismissible}
						<button
							type="button"
							aria-label="Close panel"
							class="text-tertiary! hover:bg-surface-secondary! hover:text-primary! grid size-8 shrink-0 place-items-center rounded-md border-0! bg-transparent! p-0!"
							onclick={close}
						>
							<XLg class="size-4" />
						</button>
					{/if}
				</header>
			{/if}

			<div class="text-secondary min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm {bodyClass}">
				{@render children()}
			</div>

			{#if footer}
				<footer
					class="border-border-primary bg-surface-secondary/50 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 {footerClass}"
				>
					{@render footer()}
				</footer>
			{/if}
		</div>
	</div>
{/if}
