import { memo } from 'react';

/**
 * DemoContent is a React component used to render a demo content on the page.
 * It renders a image on the page followed by a heading, some text and a footer.
 * It also renders a quote and some content about a person being transformed into a vermin.
 */
function DemoContent() {
	return (
		<div>
			<img
				src="/assets/images/demo-content/morain-lake.jpg"
				alt="beach"
				style={{
					maxWidth: '640px',
					width: '100%'
				}}
				className="rounded-md"
			/>
			<h1 className="py-16 font-semibold">Early Sunrise</h1>
			<h4 className="pb-12 font-medium">Demo Content</h4>
			<p>
				One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a
				horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his
				brown belly, slightly domed and divided by arches into stiff sections.
			</p>
			<blockquote>
				<p>
					The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs,
					pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.
					"What's happened to me? " he thought. It wasn't a dream.
				</p>
				<footer>John Doe</footer>
			</blockquote>
			<p>
				His room, a proper human room although a little too small, lay peacefully between its four familiar
				walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman -
				and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in
				a nice, gilded frame.
			</p>
			<p>
				It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that
				covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the
				dull weather. Drops of rain could be heard hitting the pane, which made him feel quite sad.
			</p>
			<p>
				"How about if I sleep a little bit longer and forget all this nonsense", he thought, but that was
				something he was unable to do because he was used to sleeping on his right, and in his present state
				couldn't get into that position. However hard he threw himself onto his right, he always rolled back to
				where he was.
			</p>
			<p>
				He must have tried it a hundred times, shut his eyes so that he wouldn't have to look at the floundering
				legs, and only stopped when he began to feel a mild, dull pain there that he had never felt before. "Oh,
				God", he thought, "what a strenuous career it is that I've chosen!
			</p>
			<p>
				Travelling day in and day out. Doing business like this takes much more effort than doing your own
				business at home, and on top of that there's the curse of travelling, worries about making train
				connections, bad and irregular food, contact with different people all the time so that you can never
				get to know anyone or become friendly with them.
			</p>
			<p>
				"He felt a slight itch up on his belly; pushed himself slowly up on his back towards the headboard so
				that he could lift his head better; found where the itch was, and saw that it was covered with lots of
				little white spots which he didn't know what to make of; and when he tried to feel the place with one of
				his legs he drew it quickly back because as soon as he touched it he was overcome by a cold shudder. He
				slid back into his former position.
			</p>
			<p>
				"Getting up early all the time", he thought, "it makes you stupid. You've got to get enough sleep. Other
				travelling salesmen live a life of luxury. For instance, whenever I go back to the guest house during
				the morning to copy out the contract, these gentlemen are always still sitting there eating their
				breakfasts. I ought to just try that with my boss; I'd get kicked out on the spot. But who knows, maybe
				that would be the best thing for me...
			</p>
			<p>
				His room, a proper human room although a little too small, lay peacefully between its four familiar
				walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman -
				and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in
				a nice, gilded frame.
			</p>
			<p>
				It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that
				covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the
				dull weather. Drops of rain could be heard hitting the pane, which made him feel quite sad.
			</p>
			<p>
				"How about if I sleep a little bit longer and forget all this nonsense", he thought, but that was
				something he was unable to do because he was used to sleeping on his right, and in his present state
				couldn't get into that position. However hard he threw himself onto his right, he always rolled back to
				where he was.
			</p>
			<p>
				He must have tried it a hundred times, shut his eyes so that he wouldn't have to look at the floundering
				legs, and only stopped when he began to feel a mild, dull pain there that he had never felt before. "Oh,
				God", he thought, "what a strenuous career it is that I've chosen!
			</p>
			<p>
				Travelling day in and day out. Doing business like this takes much more effort than doing your own
				business at home, and on top of that there's the curse of travelling, worries about making train
				connections, bad and irregular food, contact with different people all the time so that you can never
				get to know anyone or become friendly with them.
			</p>
			<p>
				"He felt a slight itch up on his belly; pushed himself slowly up on his back towards the headboard so
				that he could lift his head better; found where the itch was, and saw that it was covered with lots of
				little white spots which he didn't know what to make of; and when he tried to feel the place with one of
				his legs he drew it quickly back because as soon as he touched it he was overcome by a cold shudder. He
				slid back into his former position.
			</p>
			<p>
				"Getting up early all the time", he thought, "it makes you stupid. You've got to get enough sleep. Other
				travelling salesmen live a life of luxury. For instance, whenever I go back to the guest house during
				the morning to copy out the contract, these gentlemen are always still sitting there eating their
				breakfasts. I ought to just try that with my boss; I'd get kicked out on the spot. But who knows, maybe
				that would be the best thing for me...
			</p>
		</div>
	);
}

export default memo(DemoContent);
