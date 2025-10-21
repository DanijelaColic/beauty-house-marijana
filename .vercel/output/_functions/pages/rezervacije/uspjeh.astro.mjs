/* empty css                                    */
import { e as createComponent, f as createAstro, k as renderComponent, n as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_P_euJCoa.mjs';
import { $ as $$Header, a as $$Footer } from '../../chunks/Footer_Duua4RXW.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Uspjeh = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Uspjeh;
  const bookingId = Astro2.url.searchParams.get("booking");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="min-h-screen bg-background"> <div class="container-narrow py-16"> <div class="text-center mb-12"> <!-- Success icon --> <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"> <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> </div> <h1 class="section-title mb-4">
Rezervacija potvrđena!
</h1> <p class="text-lg text-textSecondary mb-8">
Vaša rezervacija je uspješno kreirana. Potvrdni email će uskoro stići na vašu adresu.
</p> ${bookingId && renderTemplate`<div class="card p-6 text-left max-w-md mx-auto mb-8"> <h3 class="font-semibold text-textPrimary mb-2">Broj rezervacije</h3> <p class="text-textSecondary font-mono text-sm break-all">${bookingId}</p> </div>`} </div> <!-- What's next --> <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"> <div class="card p-6"> <div class="flex items-start gap-4"> <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg> </div> <div> <h3 class="font-semibold text-textPrimary mb-2">Provjerite email</h3> <p class="text-sm text-textSecondary">
Potvrdni email s detalima rezervacije stiže u sljedećih nekoliko minuta.
</p> </div> </div> </div> <div class="card p-6"> <div class="flex items-start gap-4"> <div class="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0"> <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> <div> <h3 class="font-semibold text-textPrimary mb-2">Dodajte u kalendar</h3> <p class="text-sm text-textSecondary mb-3">
Ne zaboravite termin – dodajte ga u svoj kalendar.
</p> <div class="flex gap-2"> <a href="#" class="text-xs px-2 py-1 bg-primary text-white rounded hover:brightness-110 transition">
Google Calendar
</a> <a href="#" class="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:brightness-110 transition">
Outlook
</a> </div> </div> </div> </div> </div> <!-- Important info --> <div class="card p-6 mb-8"> <h3 class="font-semibold text-textPrimary mb-4">Važne informacije</h3> <div class="space-y-3 text-sm text-textSecondary"> <div class="flex items-start gap-3"> <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div> <p>Molimo dođite 5 minuta prije zakazanog termina</p> </div> <div class="flex items-start gap-3"> <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div> <p>Za otkazivanje termina kontaktirajte nas najkasnije 24 sata unaprijed</p> </div> <div class="flex items-start gap-3"> <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div> <p>Naša adresa: Ulica Jela 79, Osijek</p> </div> </div> </div> <!-- Actions --> <div class="text-center space-y-4"> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/" class="btn-primary">
Povratak na početnu
</a> <a href="#kontakt" class="btn-outline">
Kontakt informacije
</a> </div> <p class="text-sm text-textSecondary">
Imate pitanja? Pozovite nas na
<a href="tel:+38531280678" class="text-primary hover:underline">+385 31 280 678</a> </p> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })} ${renderScript($$result, "/home/orisnik/projects/beauty-house-marijana/src/pages/rezervacije/uspjeh.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/orisnik/projects/beauty-house-marijana/src/pages/rezervacije/uspjeh.astro", void 0);

const $$file = "/home/orisnik/projects/beauty-house-marijana/src/pages/rezervacije/uspjeh.astro";
const $$url = "/rezervacije/uspjeh";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Uspjeh,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
