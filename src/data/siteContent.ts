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
    "I'm a 61-year-old teacher and father of four, raising a 4-year-old daughter and a 2-year-old son while still helping two older kids find their way into adult life. This site follows our attempt to build a slow-travel life, use life education to explore the world, and document the strange, funny, exhausting adventure of being an old dad doing all of it at once.",
  footerNote:
    'A record of fatherhood, slow travel, life education, music, and the work of building a bigger life before time runs out.',
};

export const sections: Section[] = [
  {
    key: 'everything',
    name: 'Everything',
    shortName: 'Everything',
    description: 'All posts in one place, shown together instead of split into lanes.',
    intro:
      'This is the full running list. Same cards, same posts, just all together in one place so you can scan everything without choosing a lane first.',
  },
  {
    key: 'diary',
    name: 'Diary of an Old Dad',
    shortName: 'Diary',
    description: 'Scenes, memory, family life, and the day-to-day absurdity of being an old dad.',
    intro:
      'This is the most lived-in lane on the site: remembered scenes, current moments, family stories, and the kind of ordinary chaos that becomes the real record later.',
  },
  {
    key: 'life-education',
    name: 'Life Education',
    shortName: 'Life Education',
    description: 'What is worth learning, how kids grow, and what makes a life feel real.',
    intro:
      'Not a policy blog and not a school rant bin. This section is for what matters in learning, judgment, capability, and building a life that is more than compliance.',
  },
  {
    key: 'music-playlists',
    name: 'Music Playlists',
    shortName: 'Playlists',
    description: 'Songs, seasons, road soundtracks, memory triggers, and what to put on next.',
    intro:
      'Some posts will be actual playlists. Some will be little essays disguised as playlists. This lane gives music a place without pretending it has to be separate from the rest of life.',
  },
  {
    key: 'slow-travel',
    name: 'Slow Travel',
    shortName: 'Slow Travel',
    description: 'Building the trip, building the life, and learning how to move more slowly on purpose.',
    intro:
      'This is where the planning, experiments, route sketches, lessons from the road, and the deeper why behind slow travel will live.',
  },
  {
    key: 'advice',
    name: 'Advice from an Old Dad',
    shortName: 'Advice',
    description: 'Direct pieces, sharper takes, hard-earned advice, and a little fatherly bluntness.',
    intro:
      'Less scene, more point. When a post wants to get to the lesson, the warning, or the argument without too much setup, it belongs here.',
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
