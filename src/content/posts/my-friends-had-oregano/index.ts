import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';

const post: BlogPost = {
  slug: 'my-friends-had-oregano',
  title: 'My Friends Had Oregano',
  excerpt: 'In 1983, I flew to Hawaii with a fake Kentucky license, handed a hundred dollars to two strangers, and somehow ended the week with the stash. My friends had oregano.',
  section: 'diary',
  publishedAt: '2026-07-12',
  status: 'Recent',
  heroImage,
  heroAlt: 'A teenage boy in a purple tropical shirt watches a surfer-like stranger approach along a Waikiki street at night.',
  cardImage,
  cardAlt: 'A laughing teenage boy bends over in a 1980s hotel lounge while embarrassed friends hold a bag of oregano and girls watch.',
  bodyHtml: `
    <p>Whenever I start wondering how kids today can be so fucking stupid, it helps to remember the spring of 1983, when I flew to Hawaii with a fake Kentucky driver's license and gave a hundred dollars to two strangers because one of them looked like Spicoli.</p>

    <p>I was a senior in high school. My parents weren't really class-trip people. They weren't current on what other families were doing, and a bunch of high school kids flying to Hawaii wasn't something that would've naturally occurred to them. My dad's business had struggled during the first part of my high school years, but by senior year things had turned around completely. He was doing well. He was winning for a while. So when the school trip to Honolulu came up, he offered to let me go.</p>

    <p>This was a much bigger deal in 1983 than it would be for kids from a similar high school today. Most of us hadn't been flying around the country with our families. Some of us had barely flown at all. Hawaii wasn't one more vacation destination we could compare with Cancun or the Bahamas. It was Hawaii. It was as far away as we could imagine going.</p>

    <p>There were probably fifteen of us, divided into hotel rooms with three or four boys or girls in each. No mixing was supposed to happen. I don't think any actual couples started the trip together, although a few temporary ones formed once we got there.</p>

    <p>Our adult sponsor was a bit of a lush himself. I never heard anything worse about him. I think he figured out that he could get a free trip to Hawaii, drink while he was there, and maintain just enough awareness of us to prevent an international incident. He probably gave us a few tips about where to go and what not to do, but nobody was pretending we wouldn't be drinking.</p>

    <p>The drinking age in Hawaii was eighteen. I was seventeen. I'd turn eighteen on April 15, not long after the trip, but we were smart enough to know that a bartender probably wasn't going to accept, "Come on, I'll be legal in a couple of weeks."</p>

    <p>Drinking ages were changing all over the country then. Once I turned eighteen, I could still drink legally in Wisconsin because I'd made whatever grandfather cutoff they used when the age went up. There was never a period after my eighteenth birthday when I couldn't drink there. Illinois was different, and the rest of the states were gradually being pushed toward twenty-one. The federal government eventually finished the job by threatening highway money. But Hawaii was still eighteen, and we needed fake IDs.</p>

    <p>There wasn't any internet to explain how to get one. There were no Reddit threads, YouTube videos, fake-ID review sites, or high-resolution home printers. Everything we knew came through rumors, older brothers, somebody's cousin, or a guy who supposedly knew another guy. Somehow, someone found a kid with an apartment near UIC. At least I think it was near UIC. What I remember clearly is that he had a giant Kentucky driver's license hanging on his wall.</p>

    <p>You stood in front of the poster while he took your picture. Then he reduced the photograph until you and the giant Kentucky license became the size of a real license. He laminated the whole crappy thing and handed it to you. That was it. There were no holograms, scanners, magnetic strips, databases, or ultraviolet lights — nothing that might reveal that the Kentucky Department of Transportation didn't normally issue licenses through a kid's apartment in Chicago. There was just my face photographed in front of a poster and sealed inside plastic.</p>

    <p>And it worked.</p>

    <p>I did the same thing a year later at Purdue, except that one had to say I was twenty-one. The Kentucky license became pointless as soon as I actually turned eighteen, so I got another one by standing in front of a different giant license and letting another amateur government agency take my picture. This was the level of technology involved in our criminal enterprise.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A sheepish teenage boy poses in front of an oversized state driver’s license poster in a shabby Chicago apartment." loading="lazy" decoding="async" />
    </figure>

    <p>Before Hawaii, I also bought tropical clothes. Not clothes I would've worn anywhere else. Colored pants, bright shirts, and things that must've looked to me like what a sophisticated young man wore while drinking beside a pool in Honolulu. It was almost a costume. My Hawaii lounge collection.</p>

    <p>We probably carried traveler's checks along with cash. I had some amount of money budgeted for each day, although I couldn't tell you the amount now. I was working by then, and my parents probably gave me spending money too. Somehow it was enough. We'd buy a case of beer to start the day. Then we'd sit at the pool bar ordering Mai Tais, Blue Hawaiians, and every other beach cocktail we'd heard about from old movies. We ate too. Not well, probably, but we ate. Then we drank in bars at night.</p>

    <p>I can't make the numbers work anymore. I was seventeen years old in a Honolulu hotel, eating, drinking cocktails at the pool, buying beer, and going to bars, yet I apparently didn't exhaust my entire travel budget before noon on the second day. I can't imagine recreating it today for under $300 a day.</p>

    <p>When we arrived, everything felt incredible at once. We were in Hawaii. We were staying in hotel rooms without our parents. We could walk into a bar. We were surrounded by classmates, strangers, tourists, palm trees, music, and warm night air that smelled like flowers instead of a Chicago spring.</p>

    <p>The hotel had a downstairs club where they played disco and pop music. I still have a playlist of the songs we heard during that trip. They're tied to the place now. I can hear one and be back in that room with all of us trying to act like we belonged there. We didn't. We weren't club kids. Back home, we went to house parties. We drank in somebody's basement, in the woods, or at whatever house had parents who were gone for the weekend. It was much closer to <em>Dazed and Confused</em> than Studio 54. We were all pretending to be cooler and more experienced than we were.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="A young woman in a purple swimsuit waves a teenage boy toward the ocean on Waikiki Beach." loading="lazy" decoding="async" />
    </figure>

    <p>That first night, six or seven of us guys decided we needed pot. Most of us had smoked before. I'd been smoking occasionally since about eighth grade, so this wasn't a rebellion we'd invented in Hawaii. The problem was that we had no idea how to buy weed in Honolulu. There was nothing to look up. We only had the same technique we used back home when we needed someone to buy us alcohol.</p>

    <p>We called it getting a run. You stood outside a liquor store, approached some adult who looked willing to commit a small crime on behalf of children, and asked whether he'd buy you a case of beer. Then you handed him cash and hoped he came back. Amazingly, people did this for us all the time.</p>

    <p>So we wandered around Honolulu looking for somebody who appeared capable of selling pot. We didn't know what that person was supposed to look like, but eventually we saw a skinny white guy who looked exactly like Spicoli walking with a huge Black guy dressed in what our sheltered suburban brains classified as Jamaican. <em>Fast Times at Ridgemont High</em> had come out earlier that school year, so we knew exactly what we were looking at. This seemed promising.</p>

    <p>I don't remember our opening line. It was probably something subtle and sophisticated like, "Hey, you got weed?" Spicoli said he could get it.</p>

    <p>We hadn't discussed how much we wanted, what it should cost, who was contributing, or what we'd do if two strangers simply took our money. We'd skipped all the unnecessary planning that might've interfered with the purity of the experience. I think we asked for an ounce. We had no idea what an ounce of Hawaiian pot was supposed to cost. The number that survives in my memory is a hundred dollars. I handed it over. Everybody else assured me they'd contribute. We were all buying it together. Once the weed arrived, we'd divide the cost and everything would be fair because these were my friends.</p>

    <p>Then Spicoli and the Jamaican guy disappeared, and we waited. At first everyone was confident. These guys knew what they were doing. They probably had to drive somewhere. Maybe they had a connection across town. This was Hawaii. Good weed couldn't be rushed. Then more time passed, and somebody said, "I don't think they're coming back." Other people agreed.</p>

    <p>I was the last one willing to say it because it was my hundred dollars. That money had to last for the rest of the trip. Everyone else could accept the educational value of the experience because they hadn't paid the tuition.</p>

    <p>The group began breaking apart. Two guys decided they were going back to the club. Then another pair left. One by one, the people who had promised to split the cost remembered other obligations. They also began explaining that they weren't giving me any money if the guys didn't come back. I explained that this wasn't how our agreement worked. They explained that it was exactly how our agreement worked because they were leaving. Eventually, every one of my actual friends abandoned me there.</p>

    <p>One guy stayed. His name was Paul. We knew each other, but we weren't friends. He wasn't part of my regular group, and I don't even think he smoked pot. He just saw what happened and decided it would be shitty to leave me standing alone in Honolulu waiting for two drug dealers who were almost certainly never coming back. So Paul waited with me.</p>

    <p>We probably talked for two hours. I don't remember what we said. It was likely the kind of conversation that feels profound when two seventeen-year-old boys accidentally talk honestly for the first time. We became friends in that small way people sometimes do when one of them simply refuses to leave the other alone in a bad situation.</p>

    <p>Then Spicoli came back.</p>

    <p>I don't remember whether the Jamaican guy dropped him off or just disappeared from the story. By then it was me, Paul, and Spicoli. He had a big bag of weed, and he wanted to come back to our hotel room to finish the deal. He was nervous about entering the hotel. He seemed to believe the employees recognized him and knew exactly what he was doing. Maybe they did. Maybe he'd sold weed to half the teenagers who came through Honolulu. Maybe he was just paranoid because he was <em>really</em> high. Either way, we got him upstairs.</p>

    <p>The bag was huge. We didn't know how to roll joints. We had smoked out of apples, beer cans, aluminum foil, and whatever else could be turned into temporary drug paraphernalia and then thrown away before somebody's parents came home. Spicoli knew what he was doing, so he rolled one for us. Paul didn't smoke. That left me and Spicoli, and we smoked the entire joint.</p>

    <p>The weed we got back home was whatever brown, dry, seed-filled garbage had survived a journey from somewhere else. This was Hawaiian weed in Hawaii, and it existed on a completely different level. By the end of the joint, I could barely see. My eyes felt sealed shut. I couldn't follow a thought from one end to the other.</p>

    <p>I was out of my fucking mind.</p>

    <p>Spicoli looked at me and asked, "You want to smoke another one?" The correct answer was no. I was already high enough that I was a little dizzy and had to modulate my breath just to stay there and not float away. But I was seventeen, sitting in a Honolulu hotel room with an actual Hawaiian pot dealer, and saying I was too high sounded impossibly uncool. Still, I volunteered to go back in.</p>

    <p>"Yeah, sure."</p>

    <p>He rolled another one, and I made it about halfway through before admitting that I could no longer participate in whatever test of manhood I thought was happening. Spicoli didn't care. He wasn't challenging me. He was just a friendly stoner with apparently unlimited lung capacity. He told us about the people he lived with and invited us to a luau the next day. He was remarkably nice for someone we had spent the previous two hours accusing of stealing my money. Then he left.</p>

    <p>Paul had to get me downstairs. I was in the classic early-years-of-smoking condition where I kept asking whether people could tell I was high while looking like my face had been tranquilized. I couldn't stop laughing. Everything felt both dangerously serious and unbelievably funny.</p>

    <p>We made it back to the hotel club. The whole group was there now, guys and girls, gathered around listening to the music and trying to figure out what people did in a nightclub. They were sitting on big lounge couches that filled the room. It was '83, but Holiday Inn lounges were still planted in the '70s.</p>

    <p>I wanted to tell them he'd come back. I wanted it so badly. But I was so stoned that I glowed before I even got into the room, and I didn't get the pleasure of delivering the news. I just started laughing when I saw them — that uncontrollable, you-literally-pee-your-pants kind of laughing that only happens when you're so high you can't even see straight. I laughed because the guys had left me alone to lose my hundred dollars. They'd announced that none of them would help cover it. They'd gone back to the club to continue their Hawaiian adventure while I waited like an idiot with a guy I barely knew. Except the dealers had come back. Now I had the biggest bag of weed any of us had ever seen, and they had nothing. Even better, they had to look dumb and completely unstoned in front of the girls.</p>

    <p>Or so I thought. While Paul and I were waiting, my friends had pooled their money and found another seller. I think he was a Marine. They proudly showed me what they'd bought.</p>

    <p>It was a bag of oregano.</p>

    <p>Not even loose oregano that might fool somebody for three seconds. The oregano itself had been held together with fishing line inside the bag, apparently to make it resemble a chunk of marijuana. I couldn't breathe. I was already higher than I'd ever been, and now the guys who had refused to risk any money with me were standing in a Honolulu nightclub holding a handcrafted bundle of Italian seasoning while the girls watched.</p>

    <p>I laughed directly into their faces. I laughed until I bent over. I laughed until they were furious. I laughed every time somebody tried to explain that it looked real when they bought it. I laughed harder when they opened the bag and smelled it. The weed was held together with fishing line.</p>

    <p>Fishing line.</p>

    <p>Eventually, of course, I wanted people to smoke with. I wasn't going to spend the entire trip guarding an ounce of Hawaiian weed from my friends like a drug kingpin. But I made them suffer first. I think they had to buy part of it from me, pay for some of my drinks, or otherwise renegotiate the partnership they'd abandoned. I don't remember the final arrangement. I remember that I had the stash.</p>

    <p>That first night changed the entire trip for me. I was one of the only guys who hadn't made a complete ass of himself. I'd waited. The dealer had come back. I had enough Hawaiian weed for the week, and every guy who wanted some had to come through me. For once, I was the man.</p>

    <p>The second night, things got even better. I ended up with a girl who, in my mind, was completely out of my league. Homecoming queen, prom queen type. The kind of girl I would've assumed knew I existed only because my name appeared near hers in the yearbook. She had a boyfriend, of course, because apparently being beautiful wasn't enough. He played baseball at a Big Ten school. But they were on the rocks, and for whatever reason, in Hawaii, she chose me.</p>

    <p>We made it to second base. That was enough. I was still in the phase of my life where I was so thankful that a girl had looked at me that once I had her attention, I stopped looking at or thinking about anyone else. I fell immediately into deep infatuation.</p>

    <p>For the rest of the trip, we snuck around trying to stay together every night. Mostly we kissed, barely touched each other, and wished the time would stop. In our heads, or at least in mine, Hawaii had become a separate world where the regular rules didn't apply and the week never had to end. We left with plans to go to prom together.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A teenage couple stands together on Waikiki Beach at sunset, her head resting on his shoulder." loading="lazy" decoding="async" />
    </figure>

    <p>For that week, I had the weed, I had the girl, and I had somehow gone from the guy abandoned on a Honolulu street to the guy everyone else probably thought was having the best trip. It sent me toward the end of senior year carrying myself differently, because I'd had one week where everything broke in my direction.</p>

    <p>Of course, once we got home, she went back to the baseball player and dumped me a few weeks later. Apparently, I'd served my purpose. They eventually got married, and as far as I know, they're still married today.</p>

    <p>He got the rest of her life.</p>

    <p>I got crushed.</p>

    <p>It was worth it for the week.</p>

    <p>Whenever I look at teenagers today and wonder how they can make such terrible decisions with the entire recorded knowledge of humanity sitting in their pockets, I try to remember what we had instead: rumors, traveler's checks, a fake Kentucky license, a chaperone drinking somewhere near the pool, and a hundred dollars handed to two strangers with no plan whatsoever.</p>

    <p>My friends had oregano.</p>
  `,
};

export default post;
