<script lang="ts">
import Button from './Button.svelte';
</script>
<section class="membership-options">
  <h2>Membership Options</h2>
  <div class="options-grid">
    <div class="option-card">
      <h3>Subscription</h3>
      <div class="option-price">€35/year</div>
      <ul>
        <li>Full access to member profiles</li>
        <li>Detailed itineraries, travel maps</li>
        <li>Contact info & private messaging</li>
        <li>No priority listing required</li>
      </ul>
      <Button variant="gold" style="width:100%;margin-top:1rem;">Subscribe Now</Button>
    </div>
    <div class="option-card">
      <h3>Priority Listing</h3>
      <div class="option-price">€35/slot/year</div>
      <ul>
        <li>Top placement in search results</li>
        <li>2 countries + 2 classifications/slot</li>
        <li>Independent from subscription</li>
        <li>Add as many slots as needed</li>
      </ul>
      <Button variant="gold" style="width:100%;margin-top:1rem;">Get Priority Listing</Button>
    </div>
    <div class="option-card best-value">
      <div class="best-value-label">Best Value</div>
      <h3>Both</h3>
      <div class="option-price">€70+/year</div>
      <ul>
        <li>Premium membership + priority listing</li>
        <li>Full access plus top placement</li>
        <li>One checkout</li>
      </ul>
      <Button variant="gold" style="width:100%;margin-top:1rem;">Get Both</Button>
    </div>
  </div>
</section>
<style>
.membership-options {
  background: #181e2b;
  border-radius: 1.2rem;
  padding: 2.5rem 1.5rem;
  margin: 2.5rem 0;
  color: #f0f2f5;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
}
.options-grid {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}
.option-card {
  background: #232946;
  border-radius: 1rem;
  border: 1px solid #d4a017;
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  min-width: 240px;
  max-width: 320px;
  flex: 1 1 260px;
  position: relative;
}
.option-card.best-value {
  border: 2px solid #ffe478;
}
.best-value-label {
  position: absolute;
  top: -1.2rem;
  left: 1rem;
  background: #ffe478;
  color: #232946;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.2rem 0.8rem;
  border-radius: 0.7rem;
}
.option-card h3 {
  color: #ffe478;
  margin-bottom: 0.5rem;
}
.option-price {
  color: #d4a017;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
}
ul {
  margin: 0 0 1.2rem 0;
  padding-left: 1.2rem;
}
li {
  margin-bottom: 0.4rem;
}
</style>
