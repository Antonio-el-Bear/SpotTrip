<svelte:head><title>Contact · TourGuide</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
  <h1 class="mb-6 text-3xl font-extrabold text-stone-800">Contact Us</h1>
  <div class="rounded-2xl bg-white border border-stone-100 shadow-sm p-8">
    <p class="mb-4 text-stone-700">Have questions, feedback, or need help? Reach out to our team and we’ll get back to you as soon as possible.</p>
    <form class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">Name</label>
        <input type="text" class="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">Email</label>
        <input type="email" class="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">Message</label>
        <textarea class="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200" rows="4" required></textarea>
      </div>
      <button type="submit" class="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">Send Message</button>
    </form>
    <p class="mt-6 text-stone-500 text-sm">Or email us at <a href="mailto:support@tourguide.com" class="text-amber-700 hover:underline">support@tourguide.com</a></p>
  </div>
</div>
