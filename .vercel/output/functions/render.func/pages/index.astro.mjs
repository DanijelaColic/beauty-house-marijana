/* empty css                                 */
import { e as createComponent, m as maybeRenderHead, r as renderTemplate, h as addAttribute, k as renderComponent } from '../chunks/astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_P_euJCoa.mjs';
import { $ as $$Header, a as $$Footer } from '../chunks/Footer_Duua4RXW.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Hero = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="bg-background"> <!-- Visina = visina prozora - visina headera (4rem ≈ 64px) --> <div class="mx-auto max-w-7xl px-4 py-6 md:py-8 min-h-[calc(100vh-4rem)] flex items-center"> <div class="grid md:grid-cols-2 gap-8 items-center w-full"> <!-- Lijevo: slika, ograničena da stane u fold --> <div class="rounded-2xl overflow-hidden h-[min(28rem,calc(100vh-10rem))] md:h-[min(34rem,calc(100vh-12rem))]"> <img src="/bh-hero.webp" alt="Beauty House by Marijana Talović — interijer salona" width="1600" height="1200" class="w-full h-full object-cover" loading="eager" decoding="async"> </div> <!-- Desno: naslov + opis + CTA --> <div> <h1 class="text-[clamp(1.9rem,3.2vw,3.2rem)] leading-tight font-semibold text-heroHeading">
Doživite najbolje u njezi kose, gdje se kvalitet susreće s opuštanjem.
</h1> <p class="mt-4 text-base md:text-lg text-textSecondary max-w-prose">
Kombiniramo stručnost i spa atmosferu. Brza online rezervacija termina bez poziva i poruka.
</p> <div class="mt-6 flex gap-3"> <a href="#rezervacije" class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-ctaDark text-white font-medium hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctaDark/50">
Rezerviraj termin
</a> <a href="#usluge" class="btn-secondary">Usluge</a> </div> </div> </div> </div> </section>`;
}, "/home/orisnik/projects/beauty-house-marijana/src/components/Hero.astro", void 0);

const $$Services = createComponent(($$result, $$props, $$slots) => {
  const gallery = [
    { src: "/services/bh-1.webp", alt: "\u0160i\u0161anje i stiliziranje \u2013 precizna linija" },
    { src: "/services/bh-2.webp", alt: "Frizure \u2013 valovi, pun\u0111e, glam styling" },
    { src: "/services/bh-3.webp", alt: "Keratin tretman \u2013 glatka, sjajna kosa" },
    { src: "/services/bh-4.webp", alt: "Pletenice \u2013 klasi\u010Dne i moderni uzorci" }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="usluge" class="scroll-mt-16 bg-surface text-textPrimary"> <div class="mx-auto max-w-6xl px-4 py-10 sm:py-14"> <p class="text-center text-base sm:text-lg leading-relaxed text-textSecondary max-w-3xl mx-auto">
U Beauty House by Marijana Talović nudimo šišanja prilagođena obliku lica,
      elegantne frizure za posebne prigode, keratin tretmane za savršenu glatkoću
      i dugotrajan sjaj, te razne stilove pletenica — od klasičnih do modernih.
      Svaki je tretman personaliziran, s naglaskom na zdravlje i prirodan izgled kose.
</p> <!-- Samo slike --> <div class="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"> ${gallery.map((item) => renderTemplate`<div class="overflow-hidden rounded-2xl bg-[#EDE6DD] shadow"> <img${addAttribute(item.src, "src")}${addAttribute(item.alt, "alt")} loading="lazy" class="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"> </div>`)} </div> </div> </section>`;
}, "/home/orisnik/projects/beauty-house-marijana/src/components/Services.astro", void 0);

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="about" class="scroll-mt-16 bg-surface text-textPrimary"> <div class="mx-auto max-w-6xl px-4 py-12 sm:py-16"> <!-- Naslov sekcije --> <header class="mb-8 text-center md:text-left"> <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight">
O nama
</h2> <div class="mt-2 h-1 w-16 bg-gold rounded-full mx-auto md:mx-0"></div> </header> <!-- Layout slika + tekst --> <div class="grid items-center gap-8 md:grid-cols-2"> <!-- Lijevo: slika --> <div class="overflow-hidden rounded-2xl bg-[#EDE6DD] shadow"> <img src="/team/team-group.jpg" alt="Tim salona Beauty House by Marijana Talović" class="w-full h-auto rounded-2xl" loading="lazy"> </div> <!-- Desno: tekst --> <div class="text-center md:text-left"> <p class="text-base sm:text-lg leading-relaxed text-textSecondary">
U <strong>Beauty House by Marijana Talović</strong> salon uspješno radi već
          20 godina. Izrastao je u mjesto koje ljudi prepoznaju po kvaliteti, a naš
          glavni cilj je pružiti vrhunsku uslugu. Sve što radimo temeljimo na velikoj
          posvećenosti i strasti prema njezi kose i zadovoljstvu klijenata.
</p> </div> </div> </div> </section>`;
}, "/home/orisnik/projects/beauty-house-marijana/src/components/About.astro", void 0);

const $$Team = createComponent(($$result, $$props, $$slots) => {
  const team = [
    { name: "Marijana Talovi\u0107", src: "/team/team-1.jpg" },
    { name: "Ana", src: "/team/team-2.jpg" },
    { name: "Ivana", src: "/team/team-3.jpg" },
    { name: "Martina", src: "/team/team-4.jpg" },
    { name: "Sara", src: "/team/team-5.jpg" },
    { name: "Djelatnica 6", src: "/team/team-6.jpg" }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="tim" class="scroll-mt-16 bg-surface text-textPrimary"> <div class="mx-auto max-w-6xl px-4 py-12 sm:py-16"> <!-- Naslov --> <header class="mb-8 text-center"> <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight">
Naš tim
</h2> <div class="mt-2 h-1 w-16 bg-gold rounded-full mx-auto"></div> </header> <!-- Grid fotki --> <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6"> ${team.map((m) => renderTemplate`<figure class="text-center"> <div class="overflow-hidden rounded-full aspect-square mx-auto shadow"> <img${addAttribute(m.src, "src")}${addAttribute(m.name, "alt")} class="w-full h-full object-cover" loading="lazy"> </div> <figcaption class="mt-2 text-sm sm:text-base text-textSecondary font-medium"> ${m.name} </figcaption> </figure>`)} </div> </div> </section>`;
}, "/home/orisnik/projects/beauty-house-marijana/src/components/Team.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const address = "Ulica Jela 79, Osijek";
  const phoneDisplay = "031 280 678";
  const phoneLink = "+38531280678";
  const email = "info@beautyhouse.hr";
  const hours = ["Pon\u2013Pet 08\u201320", "Sub 08\u201314", "Ned zatvoreno"];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main id="sadrzaj"> <!-- HERO --> ${renderComponent($$result2, "Hero", $$Hero, {})} <!-- USLUGE --> <section id="usluge" aria-labelledby="usluge-title" class="container-wide py-16"> <div class="flex items-baseline justify-between gap-4"> <h2 id="usluge-title" class="section-title">Usluge</h2> </div> ${renderComponent($$result2, "Services", $$Services, {})} ${renderComponent($$result2, "About", $$About, {})} ${renderComponent($$result2, "Team", $$Team, {})} <!-- LOKACIJA & KONTAKT --> <section id="kontakt" aria-labelledby="kontakt-title" class="container-wide py-16"> <h2 id="kontakt-title" class="section-title">Lokacija &amp; kontakt</h2> <div class="grid md:grid-cols-2 gap-8 mt-8 items-start"> <div class="card p-6"> <ul class="space-y-3"> <li> <strong>Adresa:</strong> <a class="ml-2" href="https://maps.google.com/?q=Ulica+Jela+79,+Osijek" target="_blank" rel="noopener" aria-label="Otvori lokaciju na Google kartama"> ${address} </a> </li> <li> <strong>Telefon:</strong> <a class="ml-2"${addAttribute("tel:" + phoneLink, "href")}>${phoneDisplay}</a> </li> <li> <strong>E-mail:</strong> <a class="ml-2"${addAttribute("mailto:" + email, "href")}>${email}</a> </li> <li> <strong>Radno vrijeme:</strong> <span class="ml-2">${hours[0]} • ${hours[1]} • ${hours[2]}</span> </li> </ul> <div class="flex gap-3 mt-6"> <a href="#rezervacije" class="btn-primary" aria-label="Idi na rezervacije">Rezerviraj termin</a> <a href="#usluge" class="btn-secondary" aria-label="Pogledaj sve usluge">Pogledaj usluge</a> </div> </div> <iframe class="w-full h-72 card p-0 overflow-hidden" src="https://www.google.com/maps?q=Ulica%20Jela%2079%2C%20Osijek&output=embed" title="Google Maps — Ulica Jela 79, Osijek" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> </div> </section> <!-- REZERVACIJE --> <section id="rezervacije" aria-labelledby="rez-title" class="container-wide py-16"> <h2 id="rez-title" class="section-title">Rezervacije</h2> <p class="muted mt-2">
Odaberite uslugu, djelatnika, datum i vrijeme te unesite vaše podatke.
</p> <div class="mt-6"> <a href="/rezervacije" class="btn-primary" aria-label="Idi na rezervacije">
Rezerviraj termin
</a> </div> </section> </section></main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/orisnik/projects/beauty-house-marijana/src/pages/index.astro", void 0);

const $$file = "/home/orisnik/projects/beauty-house-marijana/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
