<script lang="ts">
import Input from '$lib/components/Input.svelte';
import Textarea from '$lib/components/Textarea.svelte';
import Button from '$lib/components/Button.svelte';
import Card from '$lib/components/Card.svelte';
import Section from '$lib/components/Section.svelte';
import Loader from '$lib/components/Loader.svelte';

let departure = '';
let destinations = [{ country: '', cities: '' }];
let transportType = '';
let totalDays = '';
let tourismTypes: string[] = [];
let maxBudget = '';
let currency = 'EUR';
let additionalNotes = '';
let isGenerating = false;
let tripPlan: any = null;
let errorMsg = '';

const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'CHF', 'AUD', 'CAD', 'JPY'];
const TRANSPORT_TYPES = [
  { value: 'flight', label: 'Flight' },
  { value: 'train', label: 'Train' },
  { value: 'bus', label: 'Bus' },
  { value: 'ship', label: 'Ship / Boat' },
  { value: 'car', label: 'Car' },
  { value: 'motorbike', label: 'Motorbike' },
  { value: 'other', label: 'Other' }
];

function addDestination() {
  destinations = [...destinations, { country: '', cities: '' }];
}
function removeDestination(index: number) {
  if (destinations.length <= 1) return;
  destinations = destinations.filter((_, i) => i !== index);
}
function updateDestination(index: number, field: 'country' | 'cities', value: string) {
  destinations = destinations.map((d, i) => i === index ? { ...d, [field]: value } : d);
}

async function handleGenerate() {
  errorMsg = '';
  const validDestinations = destinations.filter(d => d.country);
  if (!departure || validDestinations.length === 0 || !transportType || !totalDays || tourismTypes.length === 0 || !maxBudget) {
    errorMsg = 'Please fill in all required fields including at least one destination country.';
    return;
  }
  isGenerating = true;
  tripPlan = null;
  try {
    const response = await fetch('/api/core/ai-trip-builder/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        departure,
        destinations: validDestinations,
        transportType,
        totalDays: parseInt(totalDays),
        tourismTypes,
        maxBudget: parseFloat(maxBudget),
        currency,
        additionalNotes
      })
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Failed to generate trip.');
    tripPlan = data.tripPlan;
  } catch (err: any) {
    errorMsg = err.message || 'Something went wrong.';
  } finally {
    isGenerating = false;
  }
}
</script>

<svelte:head>
  <title>AI Trip Builder</title>
</svelte:head>

<Section>
  <Card>
    <h1 style="margin-bottom:1.5rem;">AI Trip Builder</h1>
    {#if errorMsg}
      <div class="error">{errorMsg}</div>
    {/if}
    {#if !tripPlan}
      <form on:submit|preventDefault={handleGenerate}>
        <Input bind:bindValue={departure} placeholder="Departure Location * e.g. London, UK" name="departure" />

        <div style="margin-bottom:1rem;">
          <label style="font-weight:600;">Destinations *</label>
          {#each destinations as dest, i}
            <div class="destination-row">
              <Input placeholder="Country" bind:bindValue={dest.country} name="country" on:input={e => updateDestination(i, 'country', e.target.value)} />
              <Input placeholder="Cities / Regions (optional)" bind:bindValue={dest.cities} name="cities" on:input={e => updateDestination(i, 'cities', e.target.value)} />
              {#if destinations.length > 1}
                <Button type="button" variant="ghost" on:click={() => removeDestination(i)} style="margin-left:0.5rem;">Remove</Button>
              {/if}
            </div>
          {/each}
          <Button type="button" variant="ghost" on:click={addDestination} style="margin-top:0.5rem;">Add Destination</Button>
        </div>

        <div style="margin-bottom:1rem;">
          <label style="font-weight:600;">Transport Type *</label>
          <select bind:value={transportType} class="input">
            <option value="">Select transport...</option>
            {#each TRANSPORT_TYPES as t}
              <option value={t.value}>{t.label}</option>
            {/each}
          </select>
        </div>

        <Input type="number" min="1" max="90" bind:bindValue={totalDays} placeholder="Total Days (incl. travel) * e.g. 10" name="totalDays" />

        <Input bind:bindValue={tourismTypes} placeholder="Tourism Types * e.g. Adventure, Culture" name="tourismTypes" />

        <Input type="number" min="1" bind:bindValue={maxBudget} placeholder="Max Budget Per Person * e.g. 2500" name="maxBudget" />

        <div style="margin-bottom:1rem;">
          <label style="font-weight:600;">Currency</label>
          <select bind:value={currency} class="input">
            {#each CURRENCY_OPTIONS as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>

        <Textarea bind:bindValue={additionalNotes} placeholder="Additional Notes (preferences, dietary requirements, must-see places...)" name="additionalNotes" rows={3} />

        <Button type="submit" disabled={isGenerating} style="width:100%;margin-top:1.2rem;">
          {#if isGenerating}
            <Loader size="1.5rem" /> Generating...
          {:else}
            Generate Trip Proposal
          {/if}
        </Button>
      </form>
    {:else}
      <div class="trip-plan-result">
        <h2>{tripPlan.title}</h2>
        <p>{tripPlan.description}</p>
        <!-- You can expand this section to show more details from tripPlan -->
        <Button on:click={() => tripPlan = null} style="margin-top:1.5rem;">Build Another Trip</Button>
      </div>
    {/if}
  </Card>
</Section>

<style>
.error { color: #b00; margin-bottom: 1rem; }
.destination-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
.trip-plan-result { margin-top: 2rem; padding: 1rem; background: #232946; border-radius: 1rem; color: #ffe478; }
</style>
