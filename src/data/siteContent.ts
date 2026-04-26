export type SectionKey =
  | 'everything'
  | 'diary'
  | 'life-education'
  | 'music-playlists'
  | 'slow-travel'
  | 'advice';

export type Section = {
  key: SectionKey;
  name: string;
  shortName: string;
  description: string;
  intro: string;
};

export const site = {
  title: 'Our Old Dad',
  headerTagline: 'Raising Two Generations',
  tagline: 'Flailing, Raging, and Raising Two Generations',
  intro:
    'Notes on fatherhood, music, memory, learning, and the attempt to build a bigger life while time is still on the clock.',
  footerNote: 'A dad diary with fewer lies and better playlists.',
};

export const sections: Section[] = [
  {
    key: 'everything',
    name: 'Everything',
    shortName: 'Everything',
    description: 'All posts in one place.',
    intro: 'All posts in one place.',
  },
  {
    key: 'diary',
    name: 'Diary of an Old Dad',
    shortName: 'Diary',
    description: 'Scenes, memory, family life, and the day-to-day absurdity of being an old dad.',
    intro:
      'Scenes from family life, remembered moments, and the ordinary chaos that turns into the real record later.',
  },
  {
    key: 'life-education',
    name: 'Life Education',
    shortName: 'Life Education',
    description: 'What is worth learning, how kids grow, and what makes a life feel real.',
    intro:
      'Thoughts on learning, judgment, capability, and the kind of education that reaches beyond compliance.',
  },
  {
    key: 'music-playlists',
    name: 'Music Playlists',
    shortName: 'Playlists',
    description: 'Songs, seasons, road soundtracks, memory triggers, and what to put on next.',
    intro:
      'Playlists, music memories, and little essays about the songs that stick around.',
  },
  {
    key: 'slow-travel',
    name: 'Slow Travel',
    shortName: 'Slow Travel',
    description: 'Building the trip, building the life, and learning how to move more slowly on purpose.',
    intro:
      'Planning the road ahead, learning from the trips already taken, and figuring out how to move more slowly on purpose.',
  },
  {
    key: 'advice',
    name: 'Advice from an Old Dad',
    shortName: 'Advice',
    description: 'Direct pieces, sharper takes, hard-earned advice, and a little fatherly bluntness.',
    intro:
      'Sharper takes, direct lessons, warnings, and hard-earned advice without too much setup.',
  },
];

export const navigation = [
  { label: 'Home', href: '#/' },
  { label: 'Everything', href: '#/section/everything' },
  { label: 'Diary', href: '#/section/diary' },
  { label: 'Life Education', href: '#/section/life-education' },
  { label: 'Playlists', href: '#/section/music-playlists' },
  { label: 'Slow Travel', href: '#/section/slow-travel' },
  { label: 'Advice', href: '#/section/advice' },
  { label: 'About', href: '#/about' },
];

export function getSectionName(sectionKey: SectionKey): string {
  return sections.find((section) => section.key === sectionKey)?.name ?? sectionKey;
}

export const featuredPostSlug: string | null = null;
