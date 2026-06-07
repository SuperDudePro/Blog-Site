import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';

const post: BlogPost = {
  slug: 'little-tommy',
  title: 'Little Tommy',
  excerpt:
    'A pre-internet photo cleanout turns into a fake kid named Little Tommy, a pile of mailed junk pictures, and a small experiment in how hard people work to make nothing mean something.',
  section: 'diary',
  publishedAt: '2026-06-06',
  status: 'Recent',
  heroImage,
  heroAlt: 'A man sorting old photographs and Little Tommy letters at an office desk near the Boulder Reservoir.',
  cardImage,
  cardAlt: 'A worn envelope labeled Little Tommy sitting on top of old black-and-white photographs.',
  bodyHtml: `
    <p>Sometime around 1995, I was living up in Nederland with two roommates, Brent and Reggie.</p>
    <p>Brent was one of the first people I met when I moved to Colorado in 1991. I'm pretty sure it was the first day. I say "pretty sure" because memory gets weird about things like that. Some things I know exactly. Some things I know because I've told the story that way long enough that the story has become the memory.</p>
    <p>But Brent was there from the beginning. That part is true.</p>
    <p>He was a friend the whole time I lived in Colorado, and we still stay in touch in that modern, loose way where you technically still know each other, but the actual friendship belongs mostly to another version of your life.</p>
    <p>Reggie was about six years older than me. I met him not long after I started working in Colorado, and he ended up connected to me through a bunch of different people and jobs and houses and whatever else. Eventually the three of us were living in this house on Caribou Ranch in Nederland.</p>
    <p>That part probably doesn't matter much, except that it matters in the way background always matters. You have to know the house, the people, and that this was before the internet came along and gave everybody a thousand little ways to waste the day.</p>
    <p>We had to waste the day by hand.</p>
    <p>I was working at IBM then, out near Boulder. It was a good job in the strangest possible way. There was work to do, but nowhere near enough to fill the time we were expected to be there. If you focused, you could do a few days of work and get credit for the month. Naturally, I usually waited until the last few days to do the few days of work.</p>
    <p>The rest of the time, you weren't exactly on vacation, and you weren't exactly working. You were at work, which was somehow its own third category.</p>
    <p>So there was a lot of hanging around. Reading. Walking. Going out by the Boulder Reservoir. Sitting in an office pretending the empty hours had some professional shape to them.</p>
    <p>It was not a bad setup. The IBM facility was near the reservoir, and the whole area was big and open and easy to disappear into for a while. This was still the world where boredom had to do some actual work. You couldn't just pull out your phone and dissolve.</p>
    <p>One of the ways I entertained myself was by going through a giant box of old photos.</p>
    <p>Back then, you took pictures on film, and then you dropped the film off somewhere and waited to see what kind of idiot you'd been. The photo places were always running deals. Two sets for the price of one. Extra prints. Double prints. Free this. Free that. Anything to get you to bring your roll of film to them instead of somebody else.</p>
    <p>So you ended up with piles of pictures.</p>
    <p>Pictures of mountains that looked incredible when you were standing there and completely average when they were trapped inside a four-by-six rectangle. Pictures from parties you barely remembered. Pictures of people you didn't know anymore. Pictures of people you maybe never knew. Pictures that were blurry, too dark, too bright, half a thumb, somebody's shoe, a picnic table, the side of a car, a red-eyed guy holding a beer in a basement in 1992.</p>
    <p>Not memories exactly.</p>
    <p>Evidence.</p>
    <p>And not even very good evidence.</p>
    <p>I had this big box, probably two feet by two feet, full of years of these things. I had hauled them around, kept them, ignored them, and treated them like something that mattered just because they were photographs. A photo felt like a thing you weren't supposed to throw away, even when it was obviously garbage.</p>
    <p>I sorted at home. I sorted at IBM. I'd bring in stacks and sit in my office going through them over and over. Keep. Maybe keep. Give to somebody. No idea who this is. Why did I take this. Why do I have three copies of this. Why does this picture of a mountain somehow make the mountain seem worse.</p>
    <p>At some point, I ended up with a huge pile of photos I was going to get rid of. And then, instead of just throwing them away like a normal person, I got an idea.</p>
    <p>The idea was simple. I'd send them to people.</p>
    <p>Not people who would recognize them. That was the whole point. If someone from my hometown in Illinois might recognize the basement where we had parties, they didn't get that photo. They'd get some random Colorado outdoor scene. Someone in Colorado might get a Purdue picture. Someone from Purdue might get a Chicago picture. Somebody from work might get people from a party in Illinois.</p>
    <p>The goal was to make sure the picture was close enough to seem like it could mean something, but not close enough to actually mean anything.</p>
    <p>We made bundles of four. Then Brent and Reggie and I started gathering addresses.</p>
    <p>This was another pre-internet thing that seems strange now. Back then people had address books. Real ones. Paper ones. You had friends' addresses, relatives' addresses, old work friends, school friends, people you hadn't seen in years but still technically possessed in written form.</p>
    <p>Between the three of us, and eventually my mom and my sister, we had a lot of names and addresses. Hundreds, maybe. I don't know if it was actually hundreds, but it felt like hundreds when I was sitting there writing the letters.</p>
    <p>The letters were from Little Tommy.</p>
    <p>I'm left-handed, so I wrote them right-handed. The goal was to make them look like a little kid had written them, or maybe like a lunatic thought a little kid wrote. That was the uncomfortable little space the whole thing lived in. If it was actually a kid, you'd feel like a jerk for making fun of it. But if it wasn't a kid, then what kind of grown man was sitting somewhere writing these letters?</p>
    <p>That was the part I kept laughing about while I was doing it.</p>
    <p>What fucking little kid writes dozens and dozens of handwritten letters to strangers and mails them pictures from parties in Illinois?</p>
    <p>No kid.</p>
    <p>Obviously no kid.</p>
    <p>But you couldn't quite say that without also admitting you were now thinking pretty hard about Little Tommy.</p>
    <p>So I wrote with bad spelling. Wobbly letters. The kind of mistakes adults think children make.</p>
    <p>Hi.</p>
    <p>I thot you wood like these pitures.</p>
    <p>I hope you like them.</p>
    <p>Love,</p>
    <p>Little Tommy</p>
    <p>Something like that. I don't remember the exact wording anymore, but that was the voice. Not cute exactly. Not fully threatening. Just wrong enough that you had to decide what kind of wrong it was. I wrote them by hand again and again at IBM, which is a good use of corporate time if you measure corporate time by historical value.</p>
    <p>Then I put each letter in an envelope with a bundle of meaningless pictures. No real return address. Maybe Little Tommy. Maybe nothing.</p>
    <p>But I didn't mail them from Colorado. That would've ruined it.</p>
    <p>If somebody got a weird envelope full of strange photos and it was postmarked Boulder, a few people would've had a decent shot at figuring it out. "Of course Will did this" wouldn't have been the hardest detective work in the world.</p>
    <p>So I boxed the envelopes up and sent them to my sister in the Chicago suburbs. She mailed them from there, so the postmark just said something general like South Suburban, Illinois. That was enough fog.</p>
    <p>The whole thing had five people in on it: me, Brent, Reggie, my mom, and my sister. My mom supplied a bunch of addresses. My sister did some of the mailing. Everybody was supposed to listen.</p>
    <p>That was the real point. Not the mailing. Not the prank. The listening.</p>
    <p>We weren't going to call people and ask if they got the photos. We weren't going to confess. We weren't going to steer the story. We were just going to put these little packets of nonsense into the world and wait for stories to come back to us.</p>
    <p>My theory was that people could not leave it alone. They wouldn't be able to say, "Some idiot mailed me junk photos. Weird." That should've been the obvious answer, because that was the answer. Some idiot had mailed them junk photos.</p>
    <p>But I didn't think that was where most people would land. I thought they'd try to make the pictures mean something. They'd look for a pattern or a connection. They'd ask why these pictures, why me, why now, who is Tommy, what am I supposed to know, what am I missing.</p>
    <p>And they did.</p>
    <p>One guy I worked with got a batch that included some pictures from a Purdue fraternity or West Lafayette or somewhere around that world. He brought it up like he was working a case. He had lost his wallet a few months earlier, and now he had a theory that some college kids at CU Boulder had found it and were using his ID to drink and do stupid college stuff. The pictures, in his mind, were somehow connected to that.</p>
    <p>They were not connected to that.</p>
    <p>They were connected to me having too many bad pictures.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A Little Tommy note and old photos spread across a worn desk." loading="lazy" decoding="async" />
    </figure>

    <p>Another woman got some random party photos from Illinois and became convinced it was a party she had been at a few months earlier. It wasn't. It wasn't the same state. It wasn't the same people. There was no reason to think that except that the human brain hates a vacuum and will decorate one if you leave it alone long enough.</p>
    <p>Somebody else got the same stack of photos and decided it meant a guy was following them. Same envelope as everybody else, just read as a warning instead of a puzzle.</p>
    <p>Another guy I knew from Purdue, who later ended up being part of one of my infamous bad work stories, had his own theory. He thought it might be somebody out to get him. Maybe the kid of some woman he'd had an affair with. Something like that. I don't remember all the pieces, but I remember the general shape: he had built a whole private investigation around four useless pictures and a fake child with bad handwriting.</p>
    <p>Which was perfect, because this guy was already in a bunch of my crazy stories. So of course, when a crazy story arrived in the mail, he believed it was a crazy story.</p>
    <p>He just didn't believe the right one.</p>
    <p>There were more. I know there were. I wish I remembered them better, because that was the best part. But memory does the same thing those people did. It keeps the shape and loses the evidence. I remember the pattern more than the individual cases. People kept trying to solve it. They kept trying to place the pictures into their own lives, as if the universe had mailed them a clue.</p>
    <p>Nobody wanted it to be nothing.</p>
    <p>After the first batch, we sent another one. Little Tommy was not happy.</p>
    <p>The second letter had the same little-kid handwriting, same bad spelling, same weird sincerity, except now he was a little hurt.</p>
    <p>What's wrong?</p>
    <p>Didn't you like the pictures I sent?</p>
    <p>I thought you wood like them.</p>
    <p>Here are some more.</p>
    <p>Again, I'm paraphrasing. But that was the feeling. Little Tommy had feelings now. Little Tommy had expectations. Little Tommy was a child, or a pretend child, or a very strange adult hiding behind a pretend child, and now somehow you had disappointed him.</p>
    <p>So another batch went out. More junk photos. More envelopes. Back to my sister. Mailed from the Chicago suburbs again. Now people had two sets, which made it harder for them to dismiss. That was exactly the kind of stupid escalation that seemed brilliant at the time.</p>
    <p>Then we did a third round. By then Little Tommy was mad.</p>
    <p>Hey.</p>
    <p>I sent you two sets of pitures.</p>
    <p>Why are you still ignoring me?</p>
    <p>What is wrong?</p>
    <p>How come you're doing this?</p>
    <p>Something like that. More hurt. More confused. More demanding. Less "I hope you like these" and more "I have entered into a relationship with you, and you are not holding up your end."</p>
    <p>Which, again, is a ridiculous thing to write to someone when the relationship consists entirely of you secretly mailing them garbage.</p>
    <p>But that was the point. Little Tommy had gone from generous to disappointed to emotionally unstable.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Stacks of addressed envelopes, handwritten notes, and sorted photographs on an office desk." loading="lazy" decoding="async" />
    </figure>

    <p>Brent eventually told his family months later that he had been part of it, and they got genuinely mad at him. Wouldn't talk to him for a while, I think. I don't know what story they had built around it, but apparently it was not, "Our son and his idiot roommates are throwing away duplicate photos in the least efficient way possible."</p>
    <p>Reggie's mom may have been in on it too. She lived in the Bronx and was funny enough that I want that to be true, so I'm leaving it in with a question mark.</p>
    <p>The whole experiment remains open, I guess. Not scientifically. It would not pass peer review. There was no control group, unless the control group was everybody who never mentioned anything and just threw the pictures away like they should have.</p>
    <p>But it did tell me something I already suspected.</p>
    <p>People can't stand nothing. A random envelope full of photos should just be a random envelope full of photos, but almost nobody treated it that way. They turned garbage into evidence. They made the random thing personal because personal is more interesting than random.</p>
    <p>And maybe because random is a little scarier.</p>
    <p>A random envelope is just the world being weird. A meaningful envelope means at least there's a plot.</p>
    <p>I think it's funny, and I'd do it again.</p>
    <p>Give me a giant box of duplicate photos, addresses for a hundred people, and enough free time inside a corporation that accidentally employed me as a full-time boredom artist, and Little Tommy would be licking stamps again.</p>
    <p>And somewhere, probably, there is still a person who wonders why a badly educated child from South Suburban Illinois was so disappointed in them.</p>
  `,
};

export default post;
