import astroApp from './entry.mjs';

export default async function handler(request, context) {
  try {
    return await astroApp(request, context);
  } catch (error) {
    console.error('Astro handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}