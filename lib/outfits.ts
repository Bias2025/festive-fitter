export type Season = 'halloween' | 'christmas';

export interface Outfit {
  id: string;
  label: string;
  season: Season;
  thumbnail: string;
  prompt: string;
}

export const OUTFITS: Outfit[] = [
  {
    id: 'witch',
    label: 'Witch Cloak',
    season: 'halloween',
    thumbnail: '/outfits/witch.svg',
    prompt: 'a flowing black witch cloak with a pointed purple-trimmed collar and a wide-brimmed witch hat'
  },
  {
    id: 'vampire',
    label: 'Vampire Cape',
    season: 'halloween',
    thumbnail: '/outfits/vampire.svg',
    prompt: 'a dramatic black and deep-red vampire cape over a high-collared formal shirt'
  },
  {
    id: 'skeleton',
    label: 'Skeleton Suit',
    season: 'halloween',
    thumbnail: '/outfits/skeleton.svg',
    prompt: 'a fitted black bodysuit printed with a realistic glow-white skeleton bone pattern'
  },
  {
    id: 'pumpkin',
    label: 'Pumpkin Costume',
    season: 'halloween',
    thumbnail: '/outfits/pumpkin.svg',
    prompt: 'a rounded orange pumpkin costume with green stem cap and painted jack-o-lantern face panel'
  },
  {
    id: 'santa',
    label: 'Santa Suit',
    season: 'christmas',
    thumbnail: '/outfits/santa.svg',
    prompt: 'a classic red and white Santa suit with a black belt, white fur trim, and a red Santa hat'
  },
  {
    id: 'elf',
    label: 'Elf Outfit',
    season: 'christmas',
    thumbnail: '/outfits/elf.svg',
    prompt: 'a green and red elf tunic with a pointed collar, striped tights, and a curled-toe elf hat'
  },
  {
    id: 'nutcracker',
    label: 'Nutcracker Uniform',
    season: 'christmas',
    thumbnail: '/outfits/nutcracker.svg',
    prompt: 'a navy and gold nutcracker soldier uniform with braided epaulettes and brass buttons'
  },
  {
    id: 'sweater',
    label: 'Fair Isle Sweater',
    season: 'christmas',
    thumbnail: '/outfits/sweater.svg',
    prompt: 'a cream and burgundy fair isle knit Christmas sweater with a snowflake pattern'
  }
];

export function outfitsBySeason(season: Season): Outfit[] {
  return OUTFITS.filter((o) => o.season === season);
}
