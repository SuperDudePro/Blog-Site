import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';

const post: BlogPost = {
  slug: 'not-satisfied',
  title: 'Not Satisfied',
  excerpt: "My wife remembers fish-head soup. My family history is full of people who looked at the life prepared for them and refused to call it enough.",
  section: 'diary',
  publishedAt: '2026-07-11',
  status: 'Recent',
  heroImage,
  heroAlt: 'A young girl carrying a cloth bag watches a boat across the water with mountains behind her.',
  cardImage,
  cardAlt: 'A bowl of fish-head soup on a rough wooden table.',
  bodyHtml: `
    <p>My wife has no pictures of herself as a child.</p>

    <p>Not one image from before she was sixteen remains. For immigrants, especially poor immigrants, maybe that isn't as unusual as it seems. From where we sit in 2026, though, it's almost impossible to imagine. Our kids have thousands of pictures from lives they've barely begun. Maylin has no visual record that most of her childhood ever happened. No baby picture, no first day of school, no birthdays, no old photograph she can stare at and try to remember what the girl in it was thinking.</p>

    <p>She remembers fish-head soup.</p>

    <p>At the beginning of the week, there might be some fish. As the days passed, the meat disappeared. By the end, there were fish heads, broth, and whatever scraps of root vegetables remained. That was what they ate more than anything.</p>

    <p>She learned how to search the jungle for berries and find coconut trees she could climb. She still eats chicken bones. She eats fish bones. When she feels comfortable enough to eat exactly the way she wants, there's almost nothing left on the plate. The world didn't give her the option of leaving bones.</p>

    <p>She was one of eight children in Labason, a town in Zamboanga del Norte with the sea in front of it and mountains behind it. Her parents had no education and almost no information about anything beyond their tiny part of the southern Philippines. They were born under Japanese occupation and lived through the forces that followed, the NPA through the Marcos years and Abu Sayyaf after, coming through and taking pieces from people who already had almost nothing.</p>

    <p>Maylin doesn't know enough about her grandparents to tell me what they survived. The stories weren't recorded. There weren't boxes of photographs or family histories passed down through generations. People survived. They had children. Most of the details disappeared.</p>

    <p>What remained was <em>bahala na</em>. The way Maylin understood it, whatever happened was God's will. Wherever you were was where God had put you. Whatever came was something to accept and endure.</p>

    <p>Her parents had plenty of evidence for that belief. Governments changed. Armies and armed groups came and went. Food ran out. Powerful people made decisions, and families like theirs lived with the consequences.</p>

    <p>Most people around her accepted that this was life. Maylin didn't.</p>

    <p>Fish-head soup wasn't going to be her whole life. Neither was the idea that being born in that place meant dying there in the same conditions, or that hunger, fear, and helplessness must be God's plan because they were the only things she'd known.</p>

    <p>She was thirteen.</p>

    <p>A thirteen-year-old girl from a town between the mountains and the sea found her way off the big island at the bottom of the Philippines, snuck on a boat, and made it to Manila, which may have been an even worse place for a runaway girl with no money or protection. She survived another five or so situations that could have ended her life or destroyed whatever part of her still believed another life was possible. She didn't have a real plan. She had a glimmer of hope and the knowledge that she had not been put on Earth to live through that bullshit and horror.</p>

    <p>How did she know?</p>

    <p>My grandmother was widowed as a teenager. She had a ten-month-old baby boy when her husband died. The life prepared for her was fairly obvious: stay on the farm, stay poor, keep the baby alive, and hope whatever money or strength she had lasted longer than they did.</p>

    <p>She refused it. She moved to Chicago by herself, got a factory job, and found a way to make it work.</p>

    <p>That doesn't mean she created a good childhood for my father. She didn't. A lot of how he grew up was troubling. She lived with depression, and they struggled through the Great Depression. Moving to Chicago didn't turn their lives into a clean story where bravery led directly to happiness. They were still poor, and he still grew up carrying damage.</p>

    <p>What she gave him was breathing room. Not a map into a better life, just enough distance from the farm and the ending waiting there for the light to get through.</p>

    <p>My father barely graduated from high school. He didn't have money, education, connections, or much evidence that the world planned to make room for him. Somewhere inside the damaged life his mother had managed to create, though, he reached the same conclusion.</p>

    <p>I was not born for this shit.</p>

    <p>He saved and sacrificed and struggled for years. Eventually, he became a successful real estate broker and developer. He built businesses and houses and a life that had barely existed as a possibility when he started. Without his mother moving to Chicago, he might never have had enough room to see it. She couldn't give him success. She couldn't even give him a healthy childhood. She gave him a crack in the wall.</p>


    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A young widowed mother holding a baby and suitcase in an industrial Chicago street." loading="lazy" decoding="async" />
    </figure>

    <p>My grandfather grew up in a violent home in Ireland after a civil war had torn through the world around him. His father whipped the children.</p>

    <p>My grandfather stepped in front of his younger brothers and sisters and took their punishments. They weren't whipped. He was. He died with the scars across his back and never told my mother. She learned what he had done only because his younger brother told her when that brother was dying.</p>

    <p>At some point, their father beat their mother again. My grandfather stood up to him and decided it was over. He put his own life on the line because nobody else was coming to stop it. He was still basically a kid.</p>

    <p>Everyone in that house had been taught that the father had the power. Violence was part of the life they knew. No institution was arriving to protect them, and no adult with more authority was going to explain that they deserved better. Still, something in him wasn't satisfied. He wouldn't accept the beatings, or his mother being hurt, or the idea that the life around them was the only one available.</p>

    <p>When he was around the age of my oldest children now, he took responsibility for his disabled mother and younger siblings and carried that responsibility across an ocean. He eventually became a police detective in Chicago.</p>


    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="A boy stands protectively in front of his mother and younger siblings in a dark cottage." loading="lazy" decoding="async" />
    </figure>

    <p>We compress these stories afterward. Teenage widow moves to Chicago. Poor kid becomes a developer. Abused boy crosses the ocean. Hungry girl escapes to Manila. Compression makes each decision look almost inevitable.</p>

    <p>It wasn't.</p>

    <p>I don't know how many small pieces of luck made each one possible. How many conversations planted something, how many tiny favors arrived at exactly the right time, how many times someone almost quit and another person got them to the next morning. Family history remembers the big decision. It loses most of the web that made the decision possible.</p>

    <p>Maybe somebody said one sentence at the right moment, or offered a ride, a meal, a job, the name of a place that had only ever been a word. Maybe somebody saw another person living differently and realized for the first time that differently existed.</p>

    <p>Luck mattered. Other people mattered. Refusal didn't guarantee anything. It just kept the story from ending where the world had placed it.</p>

    <p>The numbers show how unusual real movement is. <a href="https://www.nber.org/papers/w22910" target="_blank" rel="noreferrer">Raj Chetty's team found that about 90 percent of American children born in 1940 eventually earned more than their parents.</a> For children born in the 1980s, that had fallen to about half. <a href="https://www.nber.org/papers/w19843" target="_blank" rel="noreferrer">Another of their studies, covering more than 40 million children, found that a poor child's chance of reaching the top fifth was 4.4 percent in Charlotte and 12.9 percent in San Jose.</a> Same country, very different odds depending on where the child started.</p>

    <p>The research can measure the forces that hold people still. It can show that geography, family income, schools, and luck all matter. It can't explain what makes one person look at a nearly hopeless situation and refuse to call it acceptable.</p>

    <p>I keep returning to famous people because the thing is easier to see at that scale.</p>

    <p>Malcolm X entered prison unable to express everything happening inside him. Another prisoner showed him what command of language looked like. Malcolm began copying the dictionary and reading everything he could reach. A dictionary is an ordinary object. Millions of people have opened one and remained exactly who they were. He saw a door.</p>

    <p>Muhammad Ali called himself the greatest before the world had enough evidence to agree. Some of that was performance and promotion. But when he refused the draft, they took his title, his boxing license, and three and a half years of his prime. He was facing prison, and he gave it all away rather than become somebody else's version of himself. <em>I don't have to be what you want me to be.</em> He knew who he was before the world confirmed it, and he wasn't going to trade who he was for what he had.</p>

    <p>How the fuck did they know? How did they look in a direction almost nobody around them was looking and see another way?</p>

    <p>But the thing didn't have to create Malcolm X or Muhammad Ali. Most people who carried it never became famous. They didn't lead movements or build empires. They refused to let one bad situation become the permanent shape of a family. That was enough.</p>

    <p>My grandmother didn't have to change the world. She had to get herself and her ten-month-old baby off the farm. My father didn't have to become one of the great developers of his generation. He had to decide that barely graduating high school and growing up damaged and poor didn't get to determine the rest of his life. My grandfather didn't have to stop violence everywhere. He had to stand in front of his brothers and sisters, protect his mother, and get the family out. Maylin didn't have to save every hungry child in the Philippines. She had to keep believing that hunger and horror weren't the life she'd been placed on Earth to accept.</p>

    <p>They weren't satisfied.</p>

    <p>That may be the closest I can get to naming the thing. Not ambition exactly, not intelligence or courage or some clean belief in themselves. They may have had all of those in different amounts, but none of it explains what happened. They weren't satisfied with hopelessness, even when hopelessness was reasonable.</p>

    <p>No, I'm not eating fish-head soup for the rest of my life.</p>

    <p>No, my brothers and sisters aren't taking this beating.</p>

    <p>No, I'm not dying poor and alone on this farm.</p>

    <p>No, the world does not get to end my story here.</p>

    <p>That dissatisfaction didn't guarantee them anything. People run and are caught. They resist and are killed. They make the brave choice at exactly the wrong time. It only kept possibility alive long enough for luck, help, and action to matter.</p>

    <p>We can't know which word, which favor, which hour of attention becomes part of another person's refusal. Malcolm needed the prisoner who showed him what language could do. Maylin needed whoever fed her, warned her, or hid her somewhere between the mountains and Manila. Somebody probably expected something from each of these people before they expected it from themselves. Somebody saw more and said it out loud. Who you know changes what becomes visible, and another person's ordinary life may be the first proof you have that another kind of life exists.</p>

    <p>That gives me another way to understand the slow-travel plan.</p>

    <p>I don't want to take Raven and Xander around the world so they can collect countries or grow up believing that movement automatically makes a person interesting. I don't need pictures of them posing in front of landmarks while we congratulate ourselves for raising worldly children.</p>

    <p>I want them to encounter more lives. To hear how people reached the places where they stand, to sit across from people whose starting points and available futures were nothing like theirs, and to notice the person behind the clean ending.</p>

    <p>Who helped you? Who told you that you could leave? What almost stopped you? What did somebody say that you still remember? What did you refuse to become satisfied with?</p>


    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="Children and adults listen as an older woman tells a story around a wooden table." loading="lazy" decoding="async" />
    </figure>

    <p>Those are the stories I want us searching for. Not to turn poor people and survivors into inspiration for comfortable Americans, and not to pretend a moving story makes injustice acceptable. The point is to understand how possibility moves.</p>

    <p>Maybe Raven and Xander will hear a sentence they need twenty years later, or see a life that gives shape to something they already felt. Maybe being around people who chose differently will keep their own world from closing too tightly around them.</p>

    <p>That's part of what frightens me about my older children. They have things in their lives they should be doing something about, conditions that should make them uncomfortable enough to move. But they're satisfied with too much of the shit around them.</p>

    <p>Not happy. Not thriving. Satisfied enough.</p>

    <p>A person can be miserable and still be satisfied enough not to act. The discomfort becomes the furniture. The cage doesn't feel good, but eventually it feels like the room where you live.</p>

    <p>I can't let that be the case with Raven and Xander. I know "can't let it" gives me more control than I really have. I can't install dissatisfaction in them, and I can't make them recognize the right moment or become the people I imagine they could be.</p>

    <p>I also don't want to raise children who are incapable of being content. There's a kind of dissatisfaction that destroys people too, where nothing is enough and every ordinary life looks like failure. That isn't what I mean. I want them satisfied with a meal but not with hunger being somebody's permanent place. Satisfied with who they are but unwilling to accept every condition around them. I want them to know when satisfaction becomes surrender.</p>

    <p>I don't have an answer for how to teach that, and I don't need to pretend that I do. None of the people in these stories had a complete answer before they acted. They had a crack, a voice, a favor, a little luck, and the refusal to let the story end where it was.</p>

    <p>I can give Raven and Xander breathing room and put them near more lives and more stories. I can say something when I see more in them than they're showing. And when we're sitting across from somebody on the other side of the world, I can teach them to ask the question: what did you refuse to become satisfied with?</p>

    <p>Their mother will be right there when they ask it, eating everything on her plate, bones and all.</p>
  `,
};

export default post;
