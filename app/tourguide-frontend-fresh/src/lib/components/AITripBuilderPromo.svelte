<script lang="ts">
import Button from './Button.svelte';
</script>
<section class="ai-trip-builder-promo">
  <h2>AI Trip Builder</h2>
  <p class="promo-desc">
    Design your ideal trip and let AI generate a complete, research-based travel plan. Input your departure, destination, transport, budget, and tourism preferences — and receive an optimized day-by-day itinerary with accommodation options, food recommendations, budget breakdown, and practical travel tips.
  </p>
  <ul class="promo-list">
    <li>Structured day-by-day itinerary with activities & logistics</li>
    <li>Up to 5 accommodation options per night at varied price ranges</li>
    <li>5 food recommendations per day matched to your tourism type</li>
    <li>Budget-aligned cost breakdown and practical travel tips</li>
    <li>Included with Premium Membership (€35/year)</li>
  </ul>
  <Button variant="gold" style="width:100%;margin-top:1.2rem;" on:click={() => window.location.href = '/ai-trip-builder'}>Launch AI Trip Builder</Button>
</section>
<style>
.ai-trip-builder-promo {
  background: #232946;
  border-radius: 1.2rem;
  padding: 2.5rem 1.5rem;
  margin: 2.5rem 0;
  color: #f0f2f5;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
}
.ai-trip-builder-promo h2 {
  color: #ffe478;
  margin-bottom: 0.7rem;
}
.promo-desc {
  font-size: 1.08rem;
  color: #eebd6b;
  margin-bottom: 1.1rem;
}
.promo-list {
  margin: 0 0 1.2rem 0;
  padding-left: 1.2rem;
}
.promo-list li {
  margin-bottom: 0.4rem;
}
</style>
