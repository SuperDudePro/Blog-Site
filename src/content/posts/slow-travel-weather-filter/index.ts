import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';

const post: BlogPost = {
  slug: 'slow-travel-weather-filter',
  title: 'The Weather Filter: Why Most Great Destinations Fail Before We Even Pack',
  excerpt: 'A slow-travel weather filter for choosing places where daily life works instead of fighting heat, cold, rain, smoke, and the wrong road setup.',
  section: 'slow-travel',
  publishedAt: '2026-06-20',
  status: 'Recent',
  heroImage,
  heroAlt: 'An older father and two children stand between a stormy road and a calmer route beside a small travel trailer.',
  cardImage,
  cardAlt: 'A toy truck and camper sit on a folded map showing stormy and calm travel routes.',
  bodyHtml: `
    <p>Weather is the first constraint because weather doesn't care how clever the rest of the plan is.</p>

    <p>A place can be cheap, safe, beautiful, interesting, walkable, and full of things for the kids to do. It can have good food, decent housing, a reasonable visa situation, and the kind of neighborhood where I can imagine us settling in for six weeks. Then the weather shows up and turns daily life into a problem we should have seen coming.</p>

    <p>That's not cosmetic. Weather decides sleep, mood, routines, groceries, laundry, playgrounds, walks, naps, school, work, and whether a normal Tuesday feels possible. A bad weather match doesn't just make the trip less pretty. It makes the life harder.</p>

    <p>This isn't about chasing perfect beach days. I've lived through Chicago, Minneapolis, Montana, Boston, and Nederland, Colorado, at 8,200 feet. I've shoveled enough snow and driven enough icy roads. I've done the character-building weather package, and I'm done volunteering for it.</p>

    <p>The whole point of slow travel is that we don't have to prove anything to the weather. We can just leave.</p>

    <h2>The Real Question</h2>

    <p>The question isn't whether we can handle bad weather. Of course we can. People handle bad weather all the time. That doesn't make it a good family strategy. People also handle terrible jobs, bad marriages, clogged toilets, and toddlers who discover markers. Human beings are adaptable. That doesn't mean every situation deserves our loyalty.</p>

    <p>The better question is why we would choose a place where the weather works against the life we're trying to build.</p>

    <p>We're not going somewhere for three days, checking off landmarks, and getting back on a plane. We're talking about staying long enough to have grocery runs, playground afternoons, nap schedules, school, work, and whatever passes for my exercise routine by then. The weather doesn't have to be perfect. It just can't fight us every day.</p>

    <p>That's the filter: not perfect, workable.</p>

    <h2>Two Kinds of Travel, Two Weather Rules</h2>

    <p>We'll travel in two basic modes.</p>

    <p>The first is overseas base living: an apartment or house for six weeks or more, probably in a city or town where we can walk, take transit, cook, work, learn, and live like semi-normal people instead of frantic tourists with backpacks and heat exhaustion.</p>

    <p>The second is North America road travel. That might mean tent camping. It might mean a trailer or camper. It might mean truck travel, parks, forests, deserts, coastlines, small towns, national parks, state parks, and the occasional motel reset when everybody needs a shower and a door that closes. This mode has a wider weather range than tent camping alone because the setup matters.</p>

    <p>A trailer or camper gives us more margin. It doesn't make bad weather good, but it can turn some hard noes into maybes. A cold night that would be miserable in a tent might be fine with heat and real beds. A hot afternoon might be manageable with shade, hookups, and air conditioning. A rainy day might become soup, books, and board games instead of damp shoes, clothes, towels, and children, and me pretending this is all building resilience.</p>

    <p>But road travel still depends on outdoor life. The point is to be outside: hiking, exploring, playgrounds, beaches, rivers, campfires, bikes, dirt, bugs, stars, and kids getting tired in the correct way. If the weather keeps us sealed inside a small box for days, it doesn't matter much whether that box has wheels and a tiny refrigerator. We're still trapped.</p>

    <p>For overseas bases, the weather target is fairly simple. Daytime temperatures around 65 to 80 degrees are ideal: warm enough to be outside, cool enough that the kids aren't melting, and comfortable enough that walking around doesn't become a negotiation with the sun.</p>

    <p>Nights matter more than people think. If the temperature drops below 50 every night, mornings start cold and annoying. Maybe that's fine for a weekend. For six weeks with kids, it's not nothing. A couple of cold nights are fine. A pattern of cold nights means we need to check the housing, the heating, the bedding, and whether we're signing ourselves up for cranky mornings because the spreadsheet got excited.</p>

    <p>Heat is the other hard line. A hot afternoon is fine. A hot country is fine. I'm not trying to raise children who collapse when the sun exists. But when the "feels like" temperature sits in the 90s or worse for days, and the night never cools down, that stops being weather and becomes an endurance event. If the low is around 80, the day didn't really end. It just dimmed.</p>

    <p>Rain is more flexible. I actually like rain when we have a roof, a working washing machine, and comfortable temperatures. A rainy afternoon can be great. A rainy week is different. If we're trapped inside three or four days a week for a long stay, the kids don't care that the food scene is underrated and the rent is reasonable. They care that they can't run.</p>

    <p>Then there's air quality, which I didn't think enough about at first. That was a mistake.</p>

    <p>Some popular slow-travel places have seasons where the air isn't just unpleasant. It's bad for you. Bad enough that schools close, people with money leave, and "we'll just wear masks" starts to sound less like planning and more like denial. This isn't only an Asia problem either. Wildfire smoke in the western United States and parts of Europe creates the same issue with a different source. I don't care whether the pollution comes from traffic, crop burning, forest fires, or the gods being annoyed. If the air is regularly bad enough that small children shouldn't be breathing it, we shouldn't be there.</p>

    <p>For road travel, the rules depend on the setup. Tent nights need to be forgiving. A 50-degree night in an apartment might be annoying; a 50-degree night in a tent with small kids is a dumb hobby. With a trailer or camper, we get more range, especially if we have heat, shade, ventilation, and power. But severe weather is still a non-starter. High winds, hail, flash flooding, wildfire smoke, and long stretches of cold rain are not "adventure." They're the part where the adult is supposed to make a better plan.</p>


    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="An older father handles wet gear beside a camper while two children wait unhappily in heavy rain." loading="lazy" decoding="async" />
    </figure>

    <h2>What Passes</h2>

    <p>This is where the system starts to become useful, because it doesn't just say no. It finds windows.</p>

    <p>Medellín, Colombia is the obvious example. The "City of Eternal Spring" thing sounds like tourism copy, but in this case the tourism copy has a point. The temperatures stay in a narrow, comfortable range most of the year. Warm days, mild nights, enough rain to keep the place green, but often in bursts instead of endless gray punishment. By our weather filter, Medellín barely has a bad month.</p>

    <p>That doesn't mean Medellín automatically wins. Weather is only the first filter. Safety, housing, budget, visa, healthcare, language, transportation, and all the rest still matter. But weather clears easily, so it goes on the board.</p>

    <p>Lisbon in October is another easy pass. Not August, when half of Europe seems to be standing in the same line while pretending this is leisure. October. Warm enough for outdoor life, cooler than summer, less crowded, and still mostly dry before the heavier rain starts settling in. That's exactly what shoulder season is for. You let the tourists fight July and August. We show up when the city can breathe again.</p>


    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="An older father walks with two children through a mild mountain town with purple accents." loading="lazy" decoding="async" />
    </figure>

    <p>Chiang Mai from November through January also passes beautifully. Cool season. Dry season. Warm days, comfortable nights, almost no rain, good food, lower costs, plenty to explore. On paper, that's one of the best slow-travel bases in Southeast Asia.</p>

    <p>In the right months.</p>

    <h2>What Fails</h2>

    <p>Bangkok in April fails before we even get cute about it.</p>

    <p>That doesn't mean Bangkok is bad. It means Bangkok in April is not for us. Average highs are brutal, nighttime lows stay hot, humidity piles on, and the heat index can move from uncomfortable to "why are we doing this to children?" pretty fast. I'm not dragging little kids through an oven because a YouTube family said the street food is life-changing. Street food can be life-changing in January.</p>

    <p>Delhi in November and December is a different kind of fail. The temperature can look fine, which is the trap. The air is the problem. If the AQI is regularly deep into unhealthy or hazardous territory, the weather filter shuts it down. I don't need a philosophical debate about resilience while my youngest is breathing smoke and pollution for weeks.</p>

    <p>Then there's Chiang Mai again. From November through January, it looks great. From February through April, the burning season can turn the region into a smoke bowl. Fields and forests burn across northern Thailand and neighboring countries, the smoke settles into the valley, and the city that looked almost perfect a few months earlier becomes something else entirely.</p>

    <p>This is the point I keep coming back to: a destination isn't good or bad in the abstract. It's good or bad for the weeks you're actually there.</p>

    <p>Travel advice online often treats cities like fixed objects. "Chiang Mai is great." "Bangkok is amazing." "Lisbon is perfect." "Oaxaca is underrated." Fine. But when? With which kids? In what housing? During what season? Under what conditions?</p>

    <p>The real unit isn't the city. It's the place-plus-date window.</p>

    <h2>The Borderline Cases</h2>

    <p>Oaxaca in January and February is the kind of case that makes the filter more useful, not less.</p>

    <p>The days look beautiful: sunny, dry, warm, walkable, the kind of weather that makes you feel a little superior to everyone who stayed home. But the nights can get cold enough to matter. Maybe not dangerous. Maybe not a dealbreaker. But cold enough that the actual apartment matters.</p>

    <p>A well-built place with decent blankets is probably fine. A drafty rental with tile floors and no heat is a different story. Now we're waking up cold, starting the day annoyed, and pretending the magic of Mexico is supposed to compensate for the fact that everyone slept badly.</p>

    <p>That doesn't mean Oaxaca fails. It gets flagged.</p>

    <p>A hard fail means no. A flag means investigate. What's the specific housing? Does it have heat? How cold does it actually get in that neighborhood? Are we talking about two chilly mornings or six weeks of kids wrapped in blankets while I make eggs and question my judgment?</p>

    <p>The same thing applies to road travel. A chilly night in a tent might be a no, while the same night in a camper might be fine. A hot afternoon without shade might be awful, while a hot afternoon with hookups, air conditioning, and a lake nearby might work. A little rain on a trailer trip might be manageable. Three straight days of rain in a cramped setup with small kids is how cheerful family travel becomes a hostage situation with snacks.</p>

    <p>The filter isn't there to make every decision for us. It's there to show us where the real decision is hiding.</p>

    <h2>The Tricks</h2>

    <p>Weather constraints can sound limiting until you remember that Earth is large. There's good weather somewhere all the time. The trick is lining up where we are with when it's good to be there.</p>

    <p>Altitude helps. If the lowlands are too hot, we can go higher. A city at 5,000 feet can feel like a different country from the coast below it. Medellín works partly because elevation does the work that air conditioning would otherwise have to do.</p>

    <p>Coasts help too. Oceans smooth out extremes. They can keep highs lower, nights warmer, and temperature swings less violent. Not always. Nothing always works. But coastal moderation is real enough to earn its place in the system.</p>

    <p>Shoulder seasons may be the real cheat code. The best family travel window is often just before or after the season everyone else has been trained to want. Lisbon in October instead of August. Southern Europe in spring or fall instead of peak summer. Southeast Asia after the rains but before the smoke. Not the most famous month. The best working month.</p>

    <p>For North America, wheels give us another trick. We can move with the season instead of sitting in one place and being noble about suffering. That might mean using higher elevations during hot stretches, lower elevations when the mountains start freezing, the coast when inland temperatures get stupid, or the desert when colder places stop making sense. A trailer or camper makes that easier because it gives us more margin, but the real tool is movement.</p>

    <p>And when one hemisphere stops working, there's another one. When the Northern Hemisphere is cold, the Southern Hemisphere is warming up. When Southeast Asia gets smoky, maybe we don't try to be heroes. We go somewhere else. That's not weakness. That's geography.</p>

    <h2>How We'll Actually Use It</h2>

    <p>The weather filter works two ways.</p>

    <p>Sometimes we'll test a specific idea: Can we do Chiang Mai from November 1 to January 15? Does Madrid work from April 15 to July 1? Can we spend six weeks in Oaxaca starting in mid-December? Is Lisbon still good in late October, or are we starting to push our luck?</p>

    <p>Other times we'll go broad and ask for twenty places that fit our weather rules from June 1 through August 1. Not twenty famous places. Not twenty places influencers are currently ruining. Twenty places where the actual conditions match the life we're trying to live.</p>

    <p>For road travel, the question gets one more layer: what's the setup? Tent, trailer, camper, cabin, motel reset, hookups or no hookups, shade or no shade, heat or no heat. The same park might fail as a tent stop and pass as a trailer stop. The same region might work for a week and fail for a month. The same route might be brilliant in September and idiotic in July.</p>

    <p>That's where the system earns its keep. It surfaces places we wouldn't have thought of because it isn't starting with a bucket list. It's starting with fit.</p>

    <p>The goal isn't to win travel. The goal is to build a life that can move. We need places where the kids can sleep, play, learn, walk, and be outside, and where I'm not spending half the day solving problems I created by ignoring the obvious. Weather is only the first constraint, and passing it doesn't mean we go. A place still has to clear safety, housing, budget, visa, healthcare, transportation, and the rest.</p>

    <p>But if the weather fails, we're done.</p>

    <p>That's not dramatic. It's just useful. I have a limited number of years, a limited amount of patience, and two little kids who need the world to be big without every week turning into a survival exercise. So the weather gets checked first. Not because it's the whole plan, but because it can wreck the plan before anything else gets a vote.</p>

    <p>The next constraint can argue with us after we've all had a decent night's sleep.</p>
  `,
};

export default post;
