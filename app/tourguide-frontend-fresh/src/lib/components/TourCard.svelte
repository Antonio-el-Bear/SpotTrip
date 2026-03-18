<script lang="ts">
  export let title: string;
  export let description: string;
  export let image: string = '';
  export let price: string = '';
  export let location: string = '';
  export let duration: string = '';
  export let onClick: (() => void) | undefined = undefined;
</script>
<div class="tour-card" on:click={onClick}>
  {#if image}
    <img class="tour-image" src={image} alt={title} />
  {/if}
  <div class="tour-content">
    <h3>{title}</h3>
    <p class="desc">{description}</p>
    <div class="tour-meta">
      {#if location}
        <span class="meta">📍 {location}</span>
      {/if}
      {#if duration}
        <span class="meta">⏱ {duration}</span>
      {/if}
      {#if price}
        <span class="meta price">{price}</span>
      {/if}
    </div>
  </div>
</div>
<style>
.tour-card {
  display: flex;
  flex-direction: column;
  background: #232946;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  border: 1px solid #d4a017;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
  margin-bottom: 1.5rem;
}
.tour-card:hover {
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.16);
}
.tour-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.tour-content {
  padding: 1.2rem;
}
.tour-content h3 {
  margin: 0 0 0.5rem 0;
  color: #ffe478;
}
.desc {
  color: #eebd6b;
  margin-bottom: 1rem;
}
.tour-meta {
  display: flex;
  gap: 1.2rem;
  font-size: 0.95rem;
  color: #f0f2f5;
}
.meta.price {
  color: #d4a017;
  font-weight: bold;
}
</style>
