import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';

const post: BlogPost = {
  slug: 'not-everyone-should-teach',
  title: 'Not Everyone Should Teach',
  excerpt: "You can't coach a kid past your own ceiling. Grad school showed me the uncomfortable part: the profession will defend people who can't clear its own basic tests.",
  section: 'life-education',
  publishedAt: '2026-07-19',
  status: 'Recent',
  heroImage,
  heroAlt: 'A teacher standing in an empty classroom beneath a chalkboard describing the myth that every teacher is equally capable of teaching every student.',
  cardImage,
  cardAlt: 'A student studying beside advanced math books under the words you cannot coach a kid past your own ceiling.',
  bodyHtml: `
    <p>There's a truth nobody in education says out loud, so I'll go first: you can't coach a kid past your own ceiling. I don't mean an old SAT or ACT score from when somebody was seventeen. In grad school, I watched adults preparing to teach repeatedly fail the basic proficiency tests required for the profession. Some prospective math teachers could not pass the mathematics test. If you cannot clear the basic test for the job you are asking to do, you are not the person who can coach a capable but dependent student toward a 30 on the ACT. You may hand that kid a book, software, or somebody better. But you cannot diagnose, explain, and extend thinking you do not possess.</p>

    <p>Licensure tests aren't everything. But they aren't nothing. They are supposed to establish a floor: can this person read hard material, write clearly, do the mathematics, hold an abstract idea steady, and see the pattern before it is explained? Those aren't test tricks. They are the thinking skills the job is supposedly about. If you cannot demonstrate them yourself, you are not going to build them at a high level in a fifteen-year-old, and no laminated lesson plan changes that.</p>

    <p>We don't say this because saying it collapses a comfortable myth: that every teacher is equally capable of teaching every student. Most kids will survive either way. But some kids — the sharp ones, the deeply curious ones, the ones already thinking past the pacing guide — need a teacher who can meet them up there. You can't fake that with classroom management.</p>

    <p>I found all this out the honest way: I went to grad school to become a teacher.</p>

    <p>Within a few weeks it was obvious. The program was full of genuinely warm, sweet, cooperative people who could not pass the basic general proficiency test. Some people seeking mathematics credentials could not pass the mathematics licensure exam. The bars were not high. They were barely off the ground. And people kept tripping over them — retakes, waivers, a fog of excuses. The official explanation was always the same: they're just bad test-takers. As if reading, writing, and doing math under mild pressure were somehow unrelated to a job that consists of helping kids read, write, and do math under mild pressure.</p>

    <p>I said this out loud in class once. It went over like a fart in a mindfulness circle.</p>

    <p>Here's the detail that stuck with me: the only people willing to admit the obvious were the ones who'd passed easily. Not one of the people who kept failing ever said, "Maybe this isn't for me." In that world, intentions were sacred and competence was optional.</p>

    <p>Montana took it further. The doctrine in the education programs at the time was that anyone could do anything, given the right supports. It sounded kind, but nobody would admit that cognitive ability might place real limits on some outcomes. Everybody accepts limits on bodies. Tell a room that a four-foot-six kid isn't playing center in the NBA no matter how much we believe in him, and nobody blinks. Say the same thing about minds and the temperature drops.</p>

    <p>So I pushed the claim to its endpoint in class. I asked whether a person with a significant intellectual disability — the kind you recognize a minute into a conversation — could complete a bachelor's degree, medical school, and a residency, and whether they would then be comfortable with that person as their doctor.</p>

    <p>They said yes.</p>

    <p>Not after qualifications or careful distinctions. Yes. The point was not to mock disability. The point was to see whether they would admit any cognitive limit at all. They would not. Because saying no meant admitting that the doctrine had limits. That's what membership cost. You said something you knew wasn't true, with a straight face, or you got labeled cruel for noticing reality.</p>

    <p>It's an obvious point. It should be boring. The fact that it's dangerous to say is the whole diagnosis.</p>

    <p>I'm not pretending any of this is a research paper. It's a judgment from more than two decades inside schools. But the numbers that exist keep pointing the same direction, and they've pointed there for a long time.</p>

    <p>Education majors walk into college with some of the lowest average SAT scores of any major — and walk out with the highest grades. An economist at the University of Missouri compared education majors against twelve other majors across three big state universities and found their GPAs ran half a point to eight-tenths of a point higher than everybody else's. At his own campus, the average education major carried a 3.80 while the science and math kids carried a 2.99. Lowest scores in, highest grades out. That's not rigor. That's a costume of rigor.</p>

    <p>The exit numbers match the entrance numbers. On ETS's own tables, education majors average 151 verbal and 149 quantitative on the GRE — that quant score is the lowest of any broad field, and the profile sits at or near the bottom overall. One researcher put the entry bar in terms I can't improve on: it's easier to get into ed school in America than to qualify to play college football. College sports programs require a minimum GPA and test score. Some teacher-prep programs don't set one at all.</p>

    <p>Meanwhile, the countries that keep embarrassing us on international tests treat my whole argument as obvious policy. Researchers who compared teacher cognitive skills across countries found they predict student performance — and ran the same check on managers, engineers, and health professionals. No other profession's brainpower moved the needle. Teacher brainpower did. The top systems didn't wait for that study. A 2010 McKinsey report measured what they'd already built:</p>

    <table>
      <thead>
        <tr>
          <th>Country</th>
          <th>New teachers from the top third of their class</th>
          <th>What the system looks like</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Finland</td>
          <td>100%</td>
          <td>Roughly 1 in 10 applicants gets into teacher training. Teaching outpolls law and medicine among top students.</td>
        </tr>
        <tr>
          <td>Singapore</td>
          <td>100%</td>
          <td>One national institute trains every teacher. Retention bonuses of $10,000–$36,000 every few years. About 3% of teachers leave annually.</td>
        </tr>
        <tr>
          <td>South Korea</td>
          <td>100%</td>
          <td>About 1% of teachers leave annually.</td>
        </tr>
        <tr>
          <td>United States</td>
          <td>23%</td>
          <td>In high-poverty schools, 14%. Annual attrition around 14% — 20% in high-poverty schools.</td>
        </tr>
      </tbody>
    </table>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Books labeled Finland, Singapore, South Korea, and United States beside a chart showing the share of new teachers drawn from the top third of their class." loading="lazy" decoding="async" />
    </figure>

    <p>Finland isn't kinder than we are. It's more honest. It decided the job of building minds requires a good one, and it staffed accordingly.</p>

    <p>Still not convinced? Run the experiment yourself. Unlimited money, two schools. One staffed entirely with teachers from the top 20 percent of their graduating classes, the other from the bottom 20. Would the top school have some lousy teachers — lazy, arrogant, terrible with kids? Absolutely. Would the bottom school have some warm, hardworking, genuinely useful ones? Also yes. Now: which school gets your kid?</p>

    <p>You didn't hesitate. Nobody does. The ideology only survives while nothing's at stake.</p>

    <p>And that answers the objection I can already hear — passing a test doesn't make a good teacher. Of course it doesn't. Passing the medical boards doesn't make a doctor kind, either. But failing them still disqualifies you. Cognitive ability and subject knowledge aren't the whole job. They are necessary ingredients — and education is the one profession that decided that because they aren't sufficient, they must not be necessary.</p>

    <p>The other standard defense — every teacher is doing their best — might even be true. But sometimes your best isn't good enough. Not because you don't care. Because you can't guide someone farther than you've gone.</p>

    <p>You already agree with me, by the way. You prove it every time you pick a mechanic, a surgeon, a pilot. Nobody boards a plane because the pilot is sweet, great with kids, and keeps failing the simulator with a positive attitude. You want competence. You demand it everywhere else. Three countries demand it for teachers, and their kids are eating our kids' lunch.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="A pilot in a cockpit beside a checklist saying competence is demanded of pilots, surgeons, and engineers and should be demanded of teachers." loading="lazy" decoding="async" />
    </figure>

    <p>It's not elitist to want smart people teaching your kids. It's basic survival.</p>
  `,
};

export default post;
