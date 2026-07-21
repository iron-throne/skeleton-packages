<script lang="ts">
    import ConfirmDialog from '$lib/organisms/modals/ConfirmDialog.svelte';
    import { Trash, InfoCircle, CreditCard } from 'svelte-bootstrap-icons';

    let basicOpen = $state(true);
    let deleteOpen = $state(false);
    let infoOpen = $state(false);
    let paymentOpen = $state(false);
</script>

<div class="min-h-screen bg-surface-tertiary p-8 space-y-6">
    <h1 class="text-xl font-semibold text-content-primary">Modal Examples</h1>

    <!-- Random demo values -->
    <ConfirmDialog
        bind:open={basicOpen}
        title="Welcome to the Demo Modal"
        message="This modal is showing random example content so you can see how your ConfirmDialog looks with real data."
        confirmLabel="Got it"
        cancelLabel="Close"
        onconfirm={() => console.log("Demo confirmed")}
        oncancel={() => console.log("Demo cancelled")}
    />

    <!-- Delete example -->
    <ConfirmDialog
        bind:open={deleteOpen}
        title="Delete File?"
        message="This file will be permanently removed from your storage."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onconfirm={() => console.log("File deleted")}
    />

    <!-- Info example -->
    <ConfirmDialog
        bind:open={infoOpen}
        title="Information"
        message="Your profile has been updated successfully."
        confirmLabel="Okay"
        variant="info"
    />

    <!-- Payment example -->
    <ConfirmDialog
        bind:open={paymentOpen}
        title="Confirm Payment"
        message="You are about to pay AED 249 for your subscription renewal."
        confirmLabel="Pay Now"
        cancelLabel="Cancel"
        variant="success"
        onconfirm={() => console.log("Payment confirmed")}
    />
</div>
