<script lang="ts">
	import '@aryagg/theme';
	import type { Component } from 'svelte';

	import HomePage from './routes/HomePage.svelte';
	import AccordionPage from './routes/accordion/Page.svelte';
	import AlertPage from './routes/alert/Page.svelte';
	import AutocompletePage from './routes/autocomplete/Page.svelte';
	import AvatarPage from './routes/avatar/Page.svelte';
	import BadgePage from './routes/badge/Page.svelte';
	import BreadcrumbPage from './routes/breadcrumb/Page.svelte';
	import ButtonPage from './routes/button/Page.svelte';
	import CardPage from './routes/card/Page.svelte';
	import ChartPage from './routes/chart/Page.svelte';
	import ComboboxPage from './routes/combobox/Page.svelte';
	import ConfirmDialogPage from './routes/confirm-dialog/Page.svelte';
	import DatePickerPage from './routes/date-picker/Page.svelte';
	import DialogPage from './routes/dialog/Page.svelte';
	import DropdownPage from './routes/dropdown/Page.svelte';
	import FolderHierarchyPage from './routes/folder-hierarchy/Page.svelte';
	import FormPage from './routes/form/Page.svelte';
	import IconPage from './routes/icon/Page.svelte';
	import ImagePage from './routes/image/Page.svelte';
	import InputPage from './routes/input/Page.svelte';
	import InputFieldPage from './routes/input-field/Page.svelte';
	import LoaderPage from './routes/loader/Page.svelte';
	import NoDataPage from './routes/no-data/Page.svelte';
	import OtpInputPage from './routes/otp-input/Page.svelte';
	import RatingPage from './routes/rating/Page.svelte';
	import RichTextEditorPage from './routes/rich-text-editor/Page.svelte';
	import SearchSuggestionsPage from './routes/search-suggestions/Page.svelte';
	import SnackbarPage from './routes/snackbar/Page.svelte';
	import TablePage from './routes/table/Page.svelte';
	import TabsPaginationPage from './routes/tabs-pagination/Page.svelte';
	import ThemePage from './routes/theme/Page.svelte';
	import TooltipPage from './routes/tooltip/Page.svelte';

	// Dev-only preview shell — no SvelteKit, so routing is a plain hash map
	// instead of file-based routing. Never shipped: only `src/lib` is published.
	const routes: Record<string, Component> = {
		'': HomePage,
		accordion: AccordionPage,
		alert: AlertPage,
		autocomplete: AutocompletePage,
		avatar: AvatarPage,
		badge: BadgePage,
		breadcrumb: BreadcrumbPage,
		button: ButtonPage,
		card: CardPage,
		chart: ChartPage,
		combobox: ComboboxPage,
		'confirm-dialog': ConfirmDialogPage,
		'date-picker': DatePickerPage,
		dialog: DialogPage,
		dropdown: DropdownPage,
		'folder-hierarchy': FolderHierarchyPage,
		form: FormPage,
		icon: IconPage,
		image: ImagePage,
		input: InputPage,
		'input-field': InputFieldPage,
		loader: LoaderPage,
		'no-data': NoDataPage,
		'otp-input': OtpInputPage,
		rating: RatingPage,
		'rich-text-editor': RichTextEditorPage,
		'search-suggestions': SearchSuggestionsPage,
		snackbar: SnackbarPage,
		table: TablePage,
		'tabs-pagination': TabsPaginationPage,
		theme: ThemePage,
		tooltip: TooltipPage
	};

	function currentPath(): string {
		return window.location.hash.replace(/^#\/?/, '');
	}

	let path = $state(currentPath());

	function onHashChange() {
		path = currentPath();
	}

	$effect(() => {
		window.addEventListener('hashchange', onHashChange);
		return () => window.removeEventListener('hashchange', onHashChange);
	});

	const CurrentPage = $derived(routes[path] ?? HomePage);
</script>

<div class="h-screen w-screen">
	<CurrentPage />
</div>
