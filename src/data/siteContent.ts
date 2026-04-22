export type SectionKey =
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

export type Post = {
  title: string;
  excerpt: string;
  section: SectionKey;
  date: string;
  status: 'Featured' | 'Recent' | 'Starter';
};

export const site = {
  title: 'Our Old Dad',
  tagline: 'Flailing, Raging, and Raising Two Generations',
  intro:
    "I'm a 61-year-old teacher and father of four, raising a 4-year-old daughter and a 2-year-old son while still helping two older kids find their way into adult life. This site follows our attempt to build a slow-travel life, use life education to explore the world, and document the strange, funny, exhausting adventure of being an old dad doing all of it at once.",
  footerNote:
    'A record of fatherhood, slow travel, life education, music, and the work of building a bigger life before time runs out.',
};

export const sections: Section[] = [
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

export const starterPosts: Post[] = [
  {
    title: 'Why We Are Building the Adventure Before We Feel Ready',
    excerpt:
      'A starter piece about time, age, and why the plan has to become a life before it becomes perfect.',
    section: 'slow-travel',
    date: 'Coming soon',
    status: 'Featured',
  },
  {
    title: 'What It Means to Raise Two Generations at Once',
    excerpt:
      'A field-note style introduction to being an older father with little kids and almost-grown kids at the same time.',
    section: 'diary',
    date: 'Coming soon',
    status: 'Recent',
  },
  {
    title: 'Life Education Is Not an Education Blog',
    excerpt: 'A clarifying post about what belongs in this lane and what does not.',
    section: 'life-education',
    date: 'Coming soon',
    status: 'Recent',
  },
  {
    title: 'The Songs That Make a Family Trip Feel Real',
    excerpt:
      'A first playlist-led piece: road songs, memory songs, and songs that help stitch time together.',
    section: 'music-playlists',
    date: 'Coming soon',
    status: 'Starter',
  },
  {
    title: 'Advice I Wish I Could Hand My Kids Before They Need It',
    excerpt: 'A direct, plainspoken piece in the Advice from an Old Dad lane.',
    section: 'advice',
    date: 'Coming soon',
    status: 'Starter',
  },
  {
    title: 'The Ordinary Day That Turns Into the Story Later',
    excerpt:
      'A piece about noticing the family moments that only become important in hindsight.',
    section: 'diary',
    date: 'Coming soon',
    status: 'Starter',
  },
];

export const navigation = [
  { label: 'Home', href: '#/' },
  { label: 'Diary of an Old Dad', href: '#/section/diary' },
  { label: 'Life Education', href: '#/section/life-education' },
  { label: 'Music Playlists', href: '#/section/music-playlists' },
  { label: 'Slow Travel', href: '#/section/slow-travel' },
  { label: 'Advice from an Old Dad', href: '#/section/advice' },
  { label: 'About', href: '#/about' },
];

export function getSectionName(sectionKey: SectionKey): string {
  return sections.find((section) => section.key === sectionKey)?.name ?? sectionKey;
}
