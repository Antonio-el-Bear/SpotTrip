<script lang="ts">
  export let title: string;
  export let member: string;
  export let country: string;
  export let days: string;
  export let price: string;
  export let tags: string[] = [];
  export let avatar: string = '';
  export let memberRole: string = 'Member';
  export let memberBy: string = '';
</script>
<div class="featured-trip-card">
  <div class="featured-trip-card__header">
    <div class="featured-trip-card__avatar">{avatar}</div>
    <div>
      <div class="featured-trip-card__role">{memberRole}</div>
      <div class="featured-trip-card__by">by {memberBy}</div>
    </div>
  </div>
  <h3 class="featured-trip-card__title">{title}</h3>
  <div class="featured-trip-card__meta">
    <span>{country}</span>
    <span>{days}</span>
    <span>{price}</span>
  </div>
  <div class="featured-trip-card__tags">
    {#each tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
</div>
<style>
.featured-trip-card {
  background: #232946;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  border: 1px solid #d4a017;
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  margin-bottom: 1.5rem;
  color: #f0f2f5;
  min-width: 260px;
}
.featured-trip-card__header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.7rem;
}
.featured-trip-card__avatar {
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
.featured-trip-card__role {
  font-size: 0.85rem;
  color: #d4a017;
  font-weight: 600;
}
.featured-trip-card__by {
  font-size: 0.9rem;
  color: #ffe478;
}
.featured-trip-card__title {
  margin: 0.5rem 0 0.7rem 0;
  font-size: 1.15rem;
  color: #ffe478;
}
.featured-trip-card__meta {
  display: flex;
  gap: 1.1rem;
  font-size: 0.98rem;
  margin-bottom: 0.7rem;
}
.featured-trip-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag {
  background: #d4a017;
  color: #fff;
  border-radius: 0.7rem;
  padding: 0.22rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
