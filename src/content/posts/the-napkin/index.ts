import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'the-napkin',
  title: 'The Napkin',
  excerpt: "A fictionalized story from the early '80s, when a fraternity road trip became an exercise in terrible decisions, bad explanations, and trying not to laugh.",
  seoTitle: "The Napkin: An Early-1980s Fraternity Road Trip Story",
  seoDescription: "An early-1980s fraternity trip to Miami University in Ohio turns into a story of terrible decisions, dark hallways, and an explanation nobody wants to believe.",
  section: 'diary',
  publishedAt: '2026-10-11',
  status: 'Recent',
  heroImage,
  heroAlt: "An empty institutional basement dining hall with folding tables, metal chairs, and a lone napkin on the floor.",
  cardImage,
  cardAlt: "A stack of white paper napkins covering a raised mound on the floor of a basement dining hall.",
  bodyHtml: `
<p>&quot;You guys want to hear something fucked up?&quot;</p>
<p>It was late Saturday night, and five of us were sprawled on the floor of a borrowed room in a fraternity house at Miami University, the one in Ohio. We'd been drunk, with brief interruptions, since Friday afternoon.</p>
<p>Smitty, who'd never met a bad idea he didn't like, was flat on his back. Meat, a pledge built like a vending machine who took everything you said at face value, was sitting up in a sleeping bag. And Danny was propped against the wall with a beer on his chest, wearing the look of a guy who'd been sitting on something for a while.</p>
<p>Of course we wanted to hear it.</p>
<p>Some context. This was the early '80s, a few years after <em>Animal House</em> convinced a generation of college guys that fraternity life was supposed to involve drinking, destruction, and the occasional visit from the police.</p>
<p>Every year our pledges staged something called a walkout. They'd pretend they'd had enough of the brothers' bullshit, pack up, and escape to another chapter for the weekend.</p>
<p>Officially, this was part of their fraternity education. They'd learn songs and traditions and whatever else supposedly turned a pledge into a brother.</p>
<p>Unofficially, it was an excuse to get completely fucked up in another college town, and Miami was a favorite because the bars in Ohio weren't nearly as fussy about ID as the ones back home in Indiana.</p>
<p>The pledges got to invite a few older guys along, and they always invited Danny. He was a senior, and he was the one guy in the house who'd never bothered with the hazing. He didn't line pledges up at two in the morning, didn't quiz them on the founders, didn't pretend any of it mattered.</p>
<p>He came for the parties and skipped the rest, and the pledges loved him for it.</p>
<p>If you'd asked them who in the whole chapter was least likely to embarrass them, they'd have said Danny.</p>
<p>Our hosts weren't thrilled to have us.</p>
<p>Visiting chapters had a reputation for drinking everything, breaking things, and leaving the hosts to deal with the fallout, so the Miami guys laid down rules. Where we could go, when we could be in the house, what we could touch.</p>
<p>Most important, they had a sorority function Saturday afternoon, and we had to be out of the building well before it started.</p>
<p>Not upstairs. Not in a back room. Gone.</p>
<p>It was a reasonable concern.</p>
<p>&quot;So last night,&quot; Danny said, &quot;I had to take a shit.&quot;</p>
<p>The house was enormous: three floors of bedrooms and hallways and common rooms, and as far as any of us could tell, one working bathroom.</p>
<p>Friday night there were bodies everywhere. Some passed out, some still drinking, some paired off and making use of whatever floor space was available.</p>
<figure class="post-figure">
  <img src="${bodyImageOne}" alt="An empty basement dining hall with folding tables, metal chairs, and a napkin left conspicuously on the floor." loading="lazy" decoding="async" />
</figure>
<p>&quot;I go upstairs, and there's a couple making out in the middle of the staircase. I have to say 'excuse me' and climb over them. Then I get to the bathroom, and there's another couple lying on the floor right in front of the door.&quot;</p>
<p>&quot;Doing what?&quot;</p>
<p>&quot;I don't know. Lying there. I had to get them to move so I could open it.&quot;</p>
<p>He did his business, got the couple to move again, climbed back over the staircase couple, and rejoined the party.</p>
<p>Twenty minutes later he had to go again.</p>
<p>Badly.</p>
<p>&quot;And I'm thinking, I'm not doing the couples again. It's a huge house. There's got to be another bathroom.&quot;</p>
<p>There wasn't. Or if there was, Danny didn't find it.</p>
<p>The downstairs was pitch dark, he couldn't find a light switch, and he didn't want to wake the whole house, so he felt his way along the walls, opening doors, while the situation got more urgent by the minute.</p>
<figure class="post-figure">
  <img src="${bodyImageTwo}" alt="A young man feels along the wall of a shadowy institutional basement corridor, searching for a bathroom." loading="lazy" decoding="async" />
</figure>
<p>&quot;At some point it's not a search anymore,&quot; he said. &quot;It's in my pants or on the floor.&quot;</p>
<p>&quot;So which—&quot;</p>
<p>&quot;I'm wearing these pants, aren't I?&quot;</p>
<p>Afterward, he'd felt around in the dark and found a stack of napkins on a table, which took care of him.</p>
<p>It didn't take care of the floor.</p>
<p>&quot;What was I supposed to do? Go back upstairs, climb over both couples, wake up one of the guys who made all the rules, and say, 'Hey, I shit on your floor. Where do you keep the garbage bags?'&quot;</p>
<p>&quot;So what'd you do?&quot;</p>
<p>&quot;I put a napkin over it.&quot;</p>
<p>He took a sip of his beer.</p>
<p>&quot;I'm not an animal.&quot;</p>
<p>&quot;Where?&quot;</p>
<p>&quot;Downstairs somewhere. I think it was the dining room.&quot;</p>
<p>&quot;You shit in their dining room?&quot;</p>
<p>&quot;I couldn't find the bathroom!&quot;</p>
<p>He'd spent all of Saturday waiting for somebody to say something.</p>
<p>Nobody did. No accusations, no house meeting, nobody looking at him funny.</p>
<p>He'd gotten away with it clean.</p>
<p>Then Smitty sat up.</p>
<p>&quot;Let's go see if it's still there.&quot;</p>
<p>It was the stupidest idea anyone had all weekend, and everybody agreed immediately.</p>
<p>The problem was getting caught.</p>
<p>We weren't supposed to be wandering the house at all, and if one of the hosts came downstairs and found five visitors standing around a pile of shit, laughing, he wasn't going to ask a lot of follow-up questions.</p>
<p>He'd assume we'd just done it.</p>
<p>And there was no good defense.</p>
<p><em>No, no, you've got it all wrong. That's been there since Friday.</em></p>
<p>So we went down in the dark, in our socks, one hand on the wall. Danny led, which was a mistake, because Danny's memory of the route was about what you'd expect.</p>
<p>&quot;Is this it?&quot;</p>
<p>&quot;I think so.&quot;</p>
<p>&quot;You think so?&quot;</p>
<p>&quot;It was dark!&quot;</p>
<p>We were already having trouble keeping quiet, partly because we were drunk and partly because the whole expedition was so fucking ridiculous.</p>
<p>Then somebody found a light switch.</p>
<p>It was still there.</p>
<p>Right out in the open, in the middle of the dining room floor. Not under a table, not in a corner.</p>
<p>A pile of shit with a napkin over it, exactly where Danny had left it more than twenty-four hours earlier.</p>
<figure class="post-figure">
  <img src="${bodyImageThree}" alt="Three college students struggle not to laugh while looking into an empty basement dining room." loading="lazy" decoding="async" />
</figure>
<p>We stood there staring at it.</p>
<p>Then Danny said, very quietly, &quot;Wait. Wasn't the sorority thing in here?&quot;</p>
<p>It was.</p>
<p>This was the room.</p>
<p>The one they'd cleared us out of the building to protect.</p>
<p>All those rules, all that worry about the visitors embarrassing the chapter, and an entire sorority social had happened around Danny's napkin.</p>
<p>Had nobody seen it?</p>
<p>Had people just stepped around it with their drinks?</p>
<p>That's when the laughing started, and the problem with the laughing was that none of it could happen out loud.</p>
<p>We were bent over, hands clamped over our mouths, eyes watering, grabbing each other's shirts to make each other stop, which only made it worse.</p>
<p>Somebody started imagining how it went.</p>
<p>Some sorority girl with a drink in her hand, pointing:</p>
<p>&quot;Excuse me, what's that?&quot;</p>
<p>And her date, thinking fast:</p>
<p>&quot;Oh, that? A dog must've gotten in.&quot;</p>
<p>That nearly finished us.</p>
<p>Then Meat frowned at the napkin like he was working a word problem.</p>
<p>&quot;But how would a dog wipe its ass?&quot;</p>
<p>Somebody went down on one knee.</p>
<p>Somebody else buried his face in a curtain.</p>
<p>I honestly thought I was going to pass out from not breathing.</p>
<p>And the worst part was that we couldn't just stand there and laugh. We had to get out. If somebody came downstairs and found us, we'd be completely fucked.</p>
<p>But every time we tried to move, somebody would start shaking again.</p>
<p>We got the lights off and made it back upstairs one step at a time, not looking at each other, because looking at each other was fatal.</p>
<figure class="post-figure">
  <img src="${bodyImageFour}" alt="College friends in separate sleeping bags in a borrowed room, helplessly laughing in the middle of the night." loading="lazy" decoding="async" />
</figure>
<p>Back in the room, we finally let loose.</p>
<p>We were laughing so hard we could barely breathe. Every time somebody tried to tell the others to shut up, it just made things worse.</p>
<p>Eventually we lay down and tried to sleep.</p>
<p>It got quiet.</p>
<p>A minute went by.</p>
<p>Maybe two.</p>
<p>Then, from the corner:</p>
<p>&quot;How would a dog—&quot;</p>
<p>&quot;SHUT THE FUCK UP!&quot;</p>
<p>Too late.</p>
<p>We were gone again.</p>
<p>And it kept happening.</p>
<p>We'd finally get ourselves under control, and somebody would start snorting in the dark. That was all it took. You'd hear one guy trying to hold it in, and before long everybody was doing it.</p>
<p>Nobody could look at anybody. Nobody could say anything. We couldn't even lie there quietly without setting each other off.</p>
<p>I don't know how much sleep we got. If we finally passed out, it was probably from exhaustion.</p>
<p>Sunday morning, we packed up, thanked our hosts, and got the hell out of there.</p>
<p>We'd spent most of the weekend trying to avoid getting caught, and by Sunday nobody wanted to push our luck any further.</p>
<p>Nobody from the Miami chapter ever said a word to us.</p>
<p>No phone call, no angry letter, no bill.</p>
<p>Nobody ever asked, &quot;Hey, did one of you guys shit in our dining room?&quot;</p>
<p>Which, under the circumstances, would've been a perfectly reasonable question.</p>

<p>Got a college story that can still set you off laughing forty years later? <a href="https://ourolddad.com/contact">Tell us through the contact page.</a></p>

  `,
};

export default post;
