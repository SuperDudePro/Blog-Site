import type { BlogPost } from '../../postTypes';
import topImage from './top-billboard-crop.png';
import acmeBillboardImage from './inline-acme-billboard.png';
import crosswalkImage from './inline-school-crosswalk.png';

const post: BlogPost = {
  slug: 'dad-do-you-love-me-enough-to-protect-me',
  title: 'Dad, Do You Love Me Enough to Protect Me?',
  excerpt:
    'The sales pitch will not look like tyranny. It will look like parental love with a subscription plan.',
  section: 'diary',
  publishedAt: '2026-05-01',
  status: 'Recent',
  heroImage: topImage,
  heroAlt:
    'Close crop of a glowing child-safety billboard with a teddy bear and purple tracking accents in a dark school-zone scene.',
  cardImage: topImage,
  cardAlt:
    'Glowing child-safety billboard with a teddy bear, shield icon, and restrained purple accents.',
  bodyHtml: `
    <p>In the ’90s, I was sunk into a lopsided couch off 6th and Pearl in Boulder, watching the local news through a haze of bong water, thrift-store patchouli, wet ski gloves, and whatever else we had decided counted as an evening.</p>
    <p>We’d flip between news and reruns, argue about whether The Sink or Dot’s Diner had the better hangover eggs, and stare out at the Flatirons like they were trying to tell us something. That night, two stories ran together in my memory: pets getting microchipped and some breathless segment about barcodes for people.</p>
    <p>We were not “if you’ve got nothing to hide” guys.</p>
    <p>We had plenty to hide.</p>
    <p>This was dial-up and pagers and a shoebox full of Dead tapes. Jerry was still alive. Gravity bongs were made out of two-liter bottles. In Boulder, you could be a stoner and still feel like a citizen. In a lot of other places, the same behavior could still turn you into a criminal. Boulder made you lax. You’d forget the rules changed at the county line.</p>
    <p>Our position on the whole thing was not complicated.</p>
    <p>No chips.<br />No codes.<br />No thanks.</p>
    <p>And besides, we said, no one would ever go for that.</p>
    <p>That was the part we got wrong.</p>
    <p>Not because everyone secretly wants to be tracked. Most people don’t. Most people still like the idea of privacy, at least in theory. They like saying things like “that’s creepy” and “I don’t want the government knowing everything I do.”</p>
    <p>But people also want to sleep at night.</p>
    <p>And when the story is scary enough, sleep wins.</p>
    <p>That’s how they’ll sell it.</p>
    <p>Not as control.<br />Not as surveillance.<br />Not as a permanent data stream attached to your child.</p>
    <p>They’ll call it peace of mind.</p>
    <p>A company — call it Acme — will launch an affordable child chip. Soft colors. Clean app. Teddy bear logo. A parent looking relieved in a kitchen full of morning light. The slogan will be something like:</p>
    <p><strong>Always Connected. Always Protected.</strong></p>
    <p>The product won’t look like dystopia. That would be bad branding.</p>
    <p>It’ll look like love.</p>
    <figure class="post-figure">
      <img src="${acmeBillboardImage}" alt="Dystopian city street with a polished child-safety billboard promising peace of mind while a toy wagon and child shoe sit in the foreground." loading="lazy" decoding="async" />
      <figcaption>It never arrives looking like control. It arrives looking soft, safe, and responsible.</figcaption>
    </figure>
    <p>Then the stories will come.</p>
    <p>Two kidnappings. Two families. Two children.</p>
    <p>The first child is chipped. The coverage is operatic. Helicopters. Ring camera loops. Dashboard maps. A police briefing every twenty minutes. A rescue caught on bodycam. Thermal footage. Slow-motion hugs. A crying anchor. Experts explaining how the chip narrowed the search window. A governor at a podium. The company’s stock jumps before the kid even gets home.</p>
    <p>The message will be clear:</p>
    <p><strong>This child was saved because the parents made the responsible choice.</strong></p>
    <p>The second child is not chipped.</p>
    <p>That coverage will feel different.</p>
    <p>The family will be described as “skeptical” or “noncompliant” or “concerned about privacy.” The tone will sharpen. The experts will purse their lips. The chyron verbs will do the work: refused, failed, unprotected. Pundits will ask whether parental rights should include the right to leave a child vulnerable. A senator will promise hearings. A prosecutor will announce a task force. A bill will be named after the kid before the funeral flowers wilt.</p>
    <p>The message will be clear there, too:</p>
    <p><strong>This child was lost because the parents said no.</strong></p>
    <p>That’s the whole sales pitch.</p>
    <p>One halo.<br />One horror.<br />Then the line around the block.</p>
    <p>You don’t need a mandate right away. Mandates are clumsy. Mandates make people notice the door closing.</p>
    <p>Defaults work better.</p>
    <p>At first, it’s optional. Then it’s recommended. Then it’s built into the pediatric intake form. Then schools ask about it. Then insurance offers a discount. Then daycare charges a little more if your kid isn’t enrolled in the “enhanced safety system.” Then stadiums and airports and camps create fast lanes. Then “opting out” starts to feel less like a choice and more like making your child walk through life without shoes.</p>
    <p>No one forces you.</p>
    <p>They just make “no” expensive, suspicious, and inconvenient.</p>
    <p>That’s how the trap works.</p>
    <p>And the worst part is that the technology will probably help sometimes.</p>
    <p>That’s what makes the argument hard.</p>
    <p>Pets do come home because of chips. Missing people do get found because of phones, cameras, plate readers, location data, and a thousand little signals we pretend are separate until someone needs them all at once. I’m not pretending the tool is useless. I’m not pretending every parent who wants it is a fool.</p>
    <p>A few children probably would be saved.</p>
    <p>That’s the knife.</p>
    <p>Because once the saved child is on every screen in America, the debate is not really a debate anymore. Vivid stories beat slow questions. Fear beats math. A crying parent beats a policy paper. And when the subject is children, the only acceptable risk number is zero.</p>
    <p>Zero kidnappings.<br />Zero failures.<br />Zero regrets.</p>
    <p>It sounds moral. It feels moral.</p>
    <p>But zero risk is where freedom goes to die.</p>
    <p>Kids need protection. They also need room. They need to become people away from the dashboard. They need to make dumb choices, have private thoughts, go places their parents don’t instantly know about, and grow into adults who are not permanently legible to every company, school, insurer, cop, and bored administrator with a login.</p>
    <p>Privacy is not a crime plan.</p>
    <figure class="post-figure">
      <img src="${crosswalkImage}" alt="Moody grayscale school-zone crosswalk at dusk with a lone child watching classmates cross beneath a glowing child-safety billboard with subtle purple accents." loading="lazy" decoding="async" />
      <figcaption>The question is not whether parents love their kids. The question is what we normalize in the name of that love.</figcaption>
    </figure>
    <p>Privacy is part of growing up.</p>
    <p>A kid deserves some untracked space before the world starts converting him into data. A teenager deserves some room to be stupid without a permanent record of every route, pause, mistake, and association. An adult deserves to look back on childhood as a life, not as a searchable event log.</p>
    <p>But that’s not how the sales copy will frame it.</p>
    <p>The sales copy will say:</p>
    <p><strong>Don’t you love your child?</strong></p>
    <p>That’s where it gets ugly.</p>
    <p>Because of course you do.</p>
    <p>You love your child enough to imagine the worst thing. You love your child enough to wake up at 2:00 a.m. and check the locks. You love your child enough to rehearse disaster. You love your child enough to know that if something happened and there had been a device, an app, a chip, a subscription, a little glowing map that might have helped, you would never fully forgive yourself for saying no.</p>
    <p>That is the pressure point.</p>
    <p>That is what they’ll press.</p>
    <p>They won’t sell the chip to your politics. They’ll sell it to the part of you that stands over a sleeping kid and feels the terror hiding inside love.</p>
    <p>And once enough parents buy in, the rest of the system will do what systems do.</p>
    <p>It will expand.</p>
    <p>First, the chip is for little kids.</p>
    <p>Then for children with medical needs.</p>
    <p>Then for dementia patients.</p>
    <p>Then for parolees.</p>
    <p>Then for “high-risk” students.</p>
    <p>Then for employees in sensitive roles.</p>
    <p>Then for campus access.</p>
    <p>Then for travel.</p>
    <p>Then for “voluntary identity verification.”</p>
    <p>Then for whatever emergency arrives next.</p>
    <p>Every emergency leaves behind a little machinery. The emergency ends. The machinery stays.</p>
    <p>That’s the part people never want to count.</p>
    <p>They want to count the rescue. They want to count the one child found in the warehouse, the field, the motel, the basement, the van. They don’t want to count the millions of ordinary days after that, when the tool becomes normal and the normal becomes mandatory without anyone having to say the word.</p>
    <p>They don’t want to count the false ping.</p>
    <p>The wrong door.</p>
    <p>The school counselor with access she shouldn’t have.</p>
    <p>The custody fight where one parent uses location data as a weapon.</p>
    <p>The insurance company that adjusts a rate because the kid keeps going somewhere flagged as risky.</p>
    <p>The app update that changes the terms.</p>
    <p>The breach.</p>
    <p>The quiet sale of “de-identified” data.</p>
    <p>The bored detective reading from a dashboard while you try to prove your child wasn’t where the system says he was.</p>
    <p>They don’t want to count the child who grows up never knowing what it feels like to be unobserved.</p>
    <p>That loss is harder to put on television.</p>
    <p>No helicopter shot.</p>
    <p>No crying anchor.</p>
    <p>No ribbon.</p>
    <p>Just a generation raised inside a permission structure and told it was love.</p>
    <p>And spare me “nothing to hide.”</p>
    <p>Everyone has something to hide.</p>
    <p>A route.<br />A crush.<br />A fight.<br />A bad afternoon.<br />A place you went because you needed to be alone.<br />A friend your parents don’t like.<br />A mistake that should have disappeared into memory instead of becoming metadata.</p>
    <p>A child’s life should not begin as evidence.</p>
    <p>That’s my line.</p>
    <p>Not “never use technology.” Not “smash the machines.” Not “every safety tool is tyranny.” That’s too easy, and it isn’t true.</p>
    <p>My line is this:</p>
    <p>Not by default.<br />Not forever.<br />Not without warrants.<br />Not without hard limits.<br />Not because a company found the most frightened part of parenthood and built a subscription model around it.</p>
    <p>If this ever becomes real — and I think some version of it will — the questions need to come before the tears, not after.</p>
    <p>Who owns the data?</p>
    <p>Who sees it?</p>
    <p>What is the warrant standard?</p>
    <p>Can a parent consent away a child’s future privacy?</p>
    <p>When does the device expire?</p>
    <p>Can the child remove it at 13? At 16? At 18?</p>
    <p>What happens to families who refuse?</p>
    <p>Can schools pressure them?</p>
    <p>Can insurers punish them?</p>
    <p>Can police search the system without telling anyone?</p>
    <p>Can the company sell the data?</p>
    <p>What happens when the company gets bought?</p>
    <p>What happens when the app shuts down?</p>
    <p>What happens when the thing designed to protect the child becomes the thing that follows the adult?</p>
    <p>Those are not anti-child questions.</p>
    <p>Those are parent questions.</p>
    <p>Real parent questions.</p>
    <p>The kind you ask before the commercial, before the panic, before the senator, before the dead child gets turned into a bill title and the rescued child gets turned into an ad campaign.</p>
    <p>Because once the story is rolling, it’s too late.</p>
    <p>The story will do what stories do. It will flatten everything. It will make one side look like love and the other side look like negligence. It will turn doubt into cruelty. It will turn privacy into selfishness. It will turn “wait a minute” into “how dare you.”</p>
    <p>That’s how the machine wins.</p>
    <p>Not by defeating your values.</p>
    <p>By rearranging them.</p>
    <p>It makes protection the only value that counts. Then it sells you protection in a form that eats all the others.</p>
    <p>I don’t want that for my kids.</p>
    <p>I don’t want childhood run through a dashboard. I don’t want every fear answered with a device. I don’t want the deepest parts of parenting — love, risk, trust, judgment, letting go — outsourced to Acme and billed monthly.</p>
    <p>And I really don’t want to be told, years from now, that the whole thing was inevitable.</p>
    <p>It wasn’t.</p>
    <p>It never is.</p>
    <p>There is always a moment before the default hardens. A moment before the form is redesigned. A moment before the discount appears. A moment before everyone shrugs and says, “Well, that’s just how it works now.”</p>
    <p>That’s the moment to say no.</p>
    <p>Not the all-caps internet no.</p>
    <p>The ordinary parent no.</p>
    <p>No, not by default.<br />No, not without limits.<br />No, not forever.<br />No, not because you scared me.<br />No, not because you put a teddy bear on the box.<br />No, not because you called it love.</p>
    <p>Love your children.</p>
    <p>Distrust the default.</p>
    <p>And remember the trick before it starts.</p>
  `,
};

export default post;
