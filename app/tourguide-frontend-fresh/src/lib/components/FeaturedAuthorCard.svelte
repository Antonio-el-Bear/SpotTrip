<script lang="ts">
  export let initials: string;
  export let name: string;
  export let countries: string;
  export let trips: string;
  export let bio: string;
  export let rate: string;
  export let tags: string[] = [];
  export let offerType: string = '';
</script>
<div class="featured-author-card">
  <div class="featured-author-card__header">
    <div class="featured-author-card__avatar">{initials}</div>
    <div>
      <h3>{name}</h3>
      <div class="featured-author-card__countries">{countries}</div>
      <div class="featured-author-card__trips">{trips} trips</div>
    </div>
  </div>
  <div class="featured-author-card__bio">{bio}</div>
  <div class="featured-author-card__rate-offer">
    <span class="offer-type">{offerType}</span>
    <span class="rate">{rate}</span>
  </div>
  <div class="featured-author-card__tags">
    {#each tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
</div>
<style>
.featured-author-card {
  background: #232946;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  border: 1px solid #d4a017;
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  margin-bottom: 1.5rem;
  color: #f0f2f5;
  min-width: 260px;
}
.featured-author-card__header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.7rem;
}
.featured-author-card__avatar {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: #ffe478;
  color: #232946;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.featured-author-card__countries {
  font-size: 0.95rem;
  color: #ffe478;
}
.featured-author-card__trips {
  font-size: 0.9rem;
  color: #d4a017;
}
.featured-author-card__bio {
  margin: 0.7rem 0 0.7rem 0;
  font-size: 0.98rem;
  color: #eebd6b;
}
.featured-author-card__rate-offer {
  display: flex;
  gap: 1.1rem;
  font-size: 0.98rem;
  margin-bottom: 0.7rem;
}
.offer-type {
  background: #d4a017;
  color: #fff;
  border-radius: 0.7rem;
  padding: 0.22rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.rate {
  color: #ffe478;
  font-weight: 700;
}
.featured-author-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag {
  background: #232946;
  color: #ffe478;
  border-radius: 0.7rem;
  padding: 0.22rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #ffe478;
}
</style>
