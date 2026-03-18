<script lang="ts">
  export let value: string = '';
  export let placeholder: string = 'Search destinations, trips, members...';
  export let onSearch: (query: string) => void = () => {};

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
  }
  function handleSearch(e: Event) {
    e.preventDefault();
    onSearch(value);
  }
</script>
<form class="search-bar" on:submit|preventDefault={handleSearch}>
  <input
    class="search-bar__input"
    type="text"
    bind:value
    {placeholder}
    aria-label="Search"
  />
  <button class="search-bar__button" type="submit">Search</button>
</form>
<style>
.search-bar {
  display: flex;
  align-items: center;
  background: #232946;
  border-radius: 0.7rem;
  padding: 0.2rem 0.5rem;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  margin: 1.5rem 0 2.5rem 0;
  max-width: 480px;
  width: 100%;
}
.search-bar__input {
  flex: 1;
  border: none;
  background: transparent;
  color: #f0f2f5;
  font-size: 1.1rem;
  padding: 0.7rem 1rem;
  outline: none;
}
.search-bar__button {
  background: #d4a017;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.search-bar__button:hover {
  background: #ffe478;
  color: #232946;
}
</style>
