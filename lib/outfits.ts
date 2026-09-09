export type Season = 'halloween' | 'christmas';
export type Category = 'costume' | 'pyjamas' | 'sweater' | 'accessory';

export interface Outfit {
  id: string;
  label: string;
  season: Season;
  category: Category;
  thumbnail: string;
  prompt: string;
}

export const OUTFITS: Outfit[] = [
  // ── Halloween ──────────────────────────────────────────────
  {
    id: 'witch',
    label: 'Witch Cloak',
    season: 'halloween',
    category: 'costume',
    thumbnail: '/outfits/witch.svg',
    prompt: 'a flowing black witch cloak with a pointed purple-trimmed collar and a wide-brimmed witch hat'
  },
  {
    id: 'vampire',
    label: 'Vampire Cape',
    season: 'halloween',
    category: 'costume',
    thumbnail: '/outfits/vampire.svg',
    prompt: 'a dramatic black and deep-red vampire cape over a high-collared formal shirt'
  },
  {
    id: 'skeleton',
    label: 'Skeleton Suit',
    season: 'halloween',
    category: 'costume',
    thumbnail: '/outfits/skeleton.svg',
    prompt: 'a fitted black bodysuit printed with a realistic glow-white skeleton bone pattern'
  },
  {
    id: 'pumpkin',
    label: 'Pumpkin Costume',
    season: 'halloween',
    category: 'costume',
    thumbnail: '/outfits/pumpkin.svg',
    prompt: 'a rounded orange pumpkin costume with green stem cap and painted jack-o-lantern face panel'
  },

  // ── Christmas · costumes ───────────────────────────────────
  {
    id: 'santa',
    label: 'Santa Suit',
    season: 'christmas',
    category: 'costume',
    thumbnail: '/outfits/santa.svg',
    prompt: 'a classic red and white Santa suit with a black belt, white fur trim, and a red Santa hat'
  },
  {
    id: 'elf',
    label: 'Elf Outfit',
    season: 'christmas',
    category: 'costume',
    thumbnail: '/outfits/elf.svg',
    prompt: 'a green and red elf tunic with a pointed collar, striped tights, and a curled-toe elf hat'
  },
  {
    id: 'nutcracker',
    label: 'Nutcracker Uniform',
    season: 'christmas',
    category: 'costume',
    thumbnail: '/outfits/nutcracker.svg',
    prompt: 'a navy and gold nutcracker soldier uniform with braided epaulettes and brass buttons'
  },

  // ── Christmas · sweaters ──────────────────────────────────
  {
    id: 'sweater',
    label: 'Fair Isle Sweater',
    season: 'christmas',
    category: 'sweater',
    thumbnail: '/outfits/sweater.svg',
    prompt: 'a cream and burgundy fair isle knit Christmas sweater with a snowflake pattern'
  },

  // ── Christmas · pyjamas ───────────────────────────────────
  {
    id: 'pj-red-plaid',
    label: 'Red Plaid Pyjamas',
    season: 'christmas',
    category: 'pyjamas',
    thumbnail: '/outfits/pj-red-plaid.svg',
    prompt:
      'a matching red and black buffalo-plaid flannel pyjama set with a button-up long-sleeve top and full-length pants, piped trim on the collar and cuffs'
  },
  {
    id: 'pj-fairisle',
    label: 'Fair Isle Pyjama Set',
    season: 'christmas',
    category: 'pyjamas',
    thumbnail: '/outfits/pj-fairisle.svg',
    prompt:
      'a cream knit-look pyjama set with a red and green fair isle snowflake pattern across the chest, ribbed cuffs, and a relaxed pullover top'
  },
  {
    id: 'pj-reindeer-onesie',
    label: 'Reindeer Onesie',
    season: 'christmas',
    category: 'pyjamas',
    thumbnail: '/outfits/pj-reindeer-onesie.svg',
    prompt:
      'a soft tan fleece hooded onesie with a full-length front zip, a reindeer face on the hood with felt antlers, and mitten cuffs'
  },
  {
    id: 'pj-santa-lounge',
    label: 'Santa Lounge Set',
    season: 'christmas',
    category: 'pyjamas',
    thumbnail: '/outfits/pj-santa-lounge.svg',
    prompt:
      'a plush red lounge set with white faux-fur trim on the hem and cuffs, a matching short-sleeve top and jogger-style bottoms, black ribbon belt detail at the waist'
  },
  {
    id: 'pj-tartan-nightdress',
    label: 'Tartan Nightdress',
    season: 'christmas',
    category: 'pyjamas',
    thumbnail: '/outfits/pj-tartan-nightdress.svg',
    prompt:
      'a knee-length green and navy tartan flannel nightdress with a ruffled round collar, long sleeves with ruffled cuffs, and a small ribbon bow at the neckline'
  }
];

export function outfitsBySeason(season: Season): Outfit[] {
  return OUTFITS.filter((o) => o.season === season);
}

export function outfitsByCategory(category: Category): Outfit[] {
  return OUTFITS.filter((o) => o.category === category);
}

export function categoriesInSeason(season: Season): Category[] {
  const seen = new Set<Category>();
  for (const o of OUTFITS) {
    if (o.season === season) seen.add(o.category);
  }
  return Array.from(seen);
}
