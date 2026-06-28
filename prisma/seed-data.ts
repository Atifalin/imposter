// =============================================================================
// EzyImposter — Word Database (Seed Data)
// =============================================================================

export interface WordEntry {
  category: string;
  word: string;
  easyHint: string;
  mediumHint: string;
  hardHint: string;
}

const rawData: [string, string, string, string, string][] = [
  // Bollywood Movies
  ['Bollywood Movies', 'Sholay', 'Jai and Veeru', 'A coin with the same faces', 'Thakur\'s missing limbs'],
  ['Bollywood Movies', 'Dangal', 'Wrestling sisters', 'Haanikaarak Bapu', 'Diet of no spicy food'],
  ['Bollywood Movies', '3 Idiots', 'All is well', 'A vacuum cleaner delivery', 'Saltwater conductor'],
  ['Bollywood Movies', 'DDLJ', 'Train chase romance', 'Palat, palat, palat', 'Pigeon feeding father'],
  ['Bollywood Movies', 'Lagaan', 'Cricket against the British', 'Three years tax free', 'Spin bowling untouchable'],
  ['Bollywood Movies', 'Gangs of Wasseypur', 'Generational mafia', 'Permission to shoot?', 'Defective handmade guns'],
  ['Bollywood Movies', 'Zindagi Na Milegi Dobara', 'Bachelor road trip', 'Deep sea diving fear', 'Throwing a phone out of a car'],
  ['Bollywood Movies', 'Gully Boy', 'Dharavi rapper', 'Apna time aayega', 'Measuring the distance to a dream'],
  ['Bollywood Movies', 'Andhadhun', 'Fake blind pianist', 'A very perceptive rabbit', 'Selling organs in Pune'],
  ['Bollywood Movies', 'Queen', 'Solo honeymoon trip', 'Getting drunk in Paris', 'A stolen bag in Amsterdam'],

  // Bollywood Actors
  ['Bollywood Actors', 'Shah Rukh Khan', 'The King of Romance', 'Dimpled open-arms pose', 'Running Kolkata\'s knights'],
  ['Bollywood Actors', 'Aamir Khan', 'Mr. Perfectionist', 'Naked with a radio', 'Eating a lot of samosas as an alien'],
  ['Bollywood Actors', 'Amitabh Bachchan', 'The Angry Young Man', 'Hosting a quiz show for decades', 'Wearing a lightbulb suit'],
  ['Bollywood Actors', 'Deepika Padukone', 'Waving in Om Shanti Om', 'Finding love in Piku', 'A badminton star\'s lineage'],
  ['Bollywood Actors', 'Salman Khan', 'Bhai of Bollywood', 'Dancing with a towel', 'Driving a very controversial SUV'],
  ['Bollywood Actors', 'Ranveer Singh', 'Quirky fashion icon', 'Rapping in the gullies', 'Dipping a biscuit in a teacup energetically'],
  ['Bollywood Actors', 'Alia Bhatt', 'Student of the Year debut', 'A spy named Sehmat', 'Talking to a wall in a highway'],
  ['Bollywood Actors', 'Hrithik Roshan', 'Dancing Greek God', 'An extra thumb', 'Stealing artifacts in Dhoom 2'],
  ['Bollywood Actors', 'Akshay Kumar', 'Khiladi of martial arts', 'Waking up at 4 AM daily', 'Making money double in 25 days'],
  ['Bollywood Actors', 'Priyanka Chopra', 'Desi Girl gone global', 'Winning Miss World', 'Quantico recruit'],

  // Bollywood Songs
  ['Bollywood Songs', 'Chaiyya Chaiyya', 'Dancing on a moving train', 'Malaika Arora\'s breakthrough', 'Shah Rukh wearing a red jacket'],
  ['Bollywood Songs', 'Kal Ho Naa Ho', 'Title track about living today', 'Singing to an empty street', 'Heartbeat slowing down visually'],
  ['Bollywood Songs', 'Munni Badnaam', 'Zandu Balm mention', 'Malaika in a green outfit', 'Robin Hood Pandey\'s dance'],
  ['Bollywood Songs', 'Tum Hi Ho', 'Aashiqui 2 romantic anthem', 'Sharing a jacket in the rain', 'Arijit Singh\'s sad vocal break'],
  ['Bollywood Songs', 'Lungi Dance', 'Tribute to Rajinikanth', 'Honey Singh\'s upbeat rap', 'Wearing traditional southern garb over pants'],
  ['Bollywood Songs', 'Jai Ho', 'Slumdog Millionaire hit', 'Pussycat Dolls remix', 'AR Rahman\'s Oscar moment'],
  ['Bollywood Songs', 'Choli Ke Peeche', 'Khalnayak controversy', 'Madhuri\'s iconic folk steps', 'What is behind the veil?'],
  ['Bollywood Songs', 'Bole Chudiyan', 'K3G family celebration', 'Bangles making a sound', 'Amitabh and Jaya joining the dance'],
  ['Bollywood Songs', 'Naatu Naatu', 'RRR high-energy sync', 'Beating the British in a dance-off', 'Suspender pulling moves'],
  ['Bollywood Songs', 'Apna Time Aayega', 'Murad\'s rap anthem', 'Beating the odds in the slum', 'Wearing a hoodie on stage'],

  // Indian Food
  ['Indian Food', 'Biryani', 'Spiced rice with meat', 'Cooked in a sealed handi', 'Contains a hidden boiled egg and potato'],
  ['Indian Food', 'Butter Chicken', 'Creamy orange gravy', 'Invented in Moti Mahal', 'Leftover tandoori chicken\'s second life'],
  ['Indian Food', 'Samosa', 'Triangular fried snack', 'Filled with spiced potatoes', 'Best served with mint chutney'],
  ['Indian Food', 'Pani Puri', 'Crispy spheres with spicy water', 'Also known as Golgappa', 'Eating the whole thing in one bite'],
  ['Indian Food', 'Dosa', 'Crispy South Indian crepe', 'Fermented rice and lentil batter', 'Rolled up like a massive paper scroll'],
  ['Indian Food', 'Chole Bhature', 'Spicy chickpeas with fried bread', 'A heavy Delhi breakfast', 'A nap is required after eating'],
  ['Indian Food', 'Gulab Jamun', 'Deep-fried milk solids', 'Soaked in sugar syrup', 'Cardamom and rose water hints'],
  ['Indian Food', 'Vada Pav', 'Mumbai\'s favorite street burger', 'Potato dumpling inside a bun', 'Accompanied by red garlic chutney'],
  ['Indian Food', 'Jalebi', 'Orange sticky spirals', 'Deep fried and syrup soaked', 'A popular morning pairing with fafda'],
  ['Indian Food', 'Masala Chai', 'India\'s favorite hot drink', 'Boiled with ginger and cardamom', 'Served in small earthen cups'],

  // Cricket
  ['Cricket', 'Virat Kohli', 'Aggressive Indian batter', 'Chasing master', 'Once strictly followed a vegan diet'],
  ['Cricket', 'Sachin Tendulkar', 'The Master Blaster', 'Scored 100 international centuries', 'Used a very heavy bat'],
  ['Cricket', 'MS Dhoni', 'Captain Cool', 'The Helicopter Shot', 'Finishing with a six in 2011'],
  ['Cricket', 'LBW', 'Leg Before Wicket', 'Hitting the pads instead of the bat', 'Umpire reviewing the pitch map'],
  ['Cricket', 'Jasprit Bumrah', 'Indian fast bowler', 'Lethal yorkers', 'A very short run-up'],
  ['Cricket', 'Rohit Sharma', 'The Hitman', 'Three double centuries in ODIs', 'Forgets his passport frequently'],
  ['Cricket', 'Googly', 'A spinner\'s trick delivery', 'Spins the opposite way', 'Disguised out of the back of the hand'],
  ['Cricket', 'Duckworth Lewis', 'Rain rule calculation', 'A confusing mathematical formula', 'Tying a match by par score'],
  ['Cricket', 'Bouncer', 'Bowling short to the head', 'Making the batsman duck', 'Aiming for the helmet badge'],
  ['Cricket', 'Stumped', 'Out while out of the crease', 'Wicketkeeper knocking the bails', 'Dragging the foot back too late'],

  // Football
  ['Football', 'Lionel Messi', 'Argentine legend', 'Eighth Ballon d\'Or winner', 'Left-footed magic from Rosario'],
  ['Football', 'Cristiano Ronaldo', 'Portuguese superstar', 'SIUUU celebration', 'Jumping absurdly high for a header'],
  ['Football', 'Neymar', 'Brazilian trickster', 'Rainbow flicks', 'Rolling on the ground dramatically'],
  ['Football', 'World Cup', 'Global tournament every 4 years', 'A golden trophy of two humans', 'The Jules Rimet was stolen'],
  ['Football', 'Offside', 'Attacking behind the last defender', 'The flag goes up', 'VAR drawing tiny lines'],
  ['Football', 'Yellow Card', 'A warning from the ref', 'Two of these equal a red', 'Taking your shirt off to celebrate'],
  ['Football', 'Penalty Shootout', 'Tiebreaker from 12 yards', 'Guessing the right way', 'Panenka chip down the middle'],
  ['Football', 'Goalkeeper', 'The only player using hands', 'Wearing a different colored shirt', 'Punching the ball at corners'],
  ['Football', 'Kylian Mbappe', 'French speedster', 'Winning the World Cup as a teen', 'Ninja Turtle resemblance'],
  ['Football', 'Premier League', 'Top English division', 'No winter break historically', 'The Boxing Day fixtures'],

  // Marvel/Superheroes
  ['Marvel/Superheroes', 'Iron Man', 'Genius, billionaire, playboy', 'A glowing arc reactor', 'Snapping his fingers in Endgame'],
  ['Marvel/Superheroes', 'Spider-Man', 'Web-slinging teen', 'With great power comes great responsibility', 'Does whatever a spider can'],
  ['Marvel/Superheroes', 'Captain America', 'The first avenger', 'A vibranium shield', 'I can do this all day'],
  ['Marvel/Superheroes', 'Thor', 'God of Thunder', 'A magical hammer', 'Going for the head'],
  ['Marvel/Superheroes', 'Hulk', 'A big green rage monster', 'Always angry', 'Smashing a puny god'],
  ['Marvel/Superheroes', 'Black Widow', 'Russian spy Avenger', 'Red hair and stealth', 'A sacrifice on Vormir'],
  ['Marvel/Superheroes', 'Batman', 'The Dark Knight', 'A billionaire orphan', 'Refusing to use guns or kill'],
  ['Marvel/Superheroes', 'Superman', 'The Man of Steel', 'An alien from Krypton', 'Weak against a green rock'],
  ['Marvel/Superheroes', 'Deadpool', 'The merc with a mouth', 'Breaking the fourth wall', 'Regenerating limbs slowly'],
  ['Marvel/Superheroes', 'Thanos', 'The purple titan', 'Collecting six infinity stones', 'Perfectly balanced, as all things should be'],

  // Hollywood Movies
  ['Hollywood Movies', 'Inception', 'A dream within a dream', 'A spinning top totem', 'Folding a city block in half'],
  ['Hollywood Movies', 'Titanic', 'A doomed ocean liner', 'Jack and Rose', 'There was room on that door'],
  ['Hollywood Movies', 'Avatar', 'Blue aliens on Pandora', 'Connecting hair to flying beasts', 'Unobtainium mining'],
  ['Hollywood Movies', 'The Matrix', 'Red pill or blue pill', 'Dodging bullets in slow motion', 'Realizing there is no spoon'],
  ['Hollywood Movies', 'Jurassic Park', 'Cloned dinosaurs in a zoo', 'A T-Rex chasing a jeep', 'Mosquito trapped in amber'],
  ['Hollywood Movies', 'Harry Potter', 'The boy who lived', 'A wizarding school', 'A lightning bolt scar'],
  ['Hollywood Movies', 'Star Wars', 'Jedi and Sith', 'A galaxy far, far away', 'I am your father'],
  ['Hollywood Movies', 'The Godfather', 'A mafia family epic', 'An offer you can\'t refuse', 'A severed horse head in a bed'],
  ['Hollywood Movies', 'Fight Club', 'Underground boxing matches', 'The first rule is don\'t talk about it', 'Project Mayhem soap'],
  ['Hollywood Movies', 'Interstellar', 'Searching for a new habitable planet', 'Time dilation on a water world', 'Communicating through a bookshelf'],

  // Animals
  ['Animals', 'Elephant', 'Large mammal with a trunk', 'Giant flapping ears', 'Never forgets a face'],
  ['Animals', 'Lion', 'King of the jungle', 'A majestic mane', 'Hakuna Matata royalty'],
  ['Animals', 'Penguin', 'Flightless bird in the snow', 'Waddling in a tuxedo', 'Keeping an egg warm on their feet'],
  ['Animals', 'Kangaroo', 'Hopping Australian marsupial', 'Carrying a baby in a pouch', 'Boxing with their strong legs'],
  ['Animals', 'Dolphin', 'Intelligent marine mammal', 'Communicating with clicks', 'Swimming in a pod'],
  ['Animals', 'Cheetah', 'The fastest land animal', 'Spotted coat', 'Tiring out after a short sprint'],
  ['Animals', 'Chameleon', 'A lizard that changes color', 'Independently moving eyes', 'Catching bugs with a long sticky tongue'],
  ['Animals', 'Bat', 'The only flying mammal', 'Echolocation in the dark', 'Hanging upside down to sleep'],
  ['Animals', 'Octopus', 'Eight-legged sea creature', 'Shooting ink to escape', 'Three hearts and blue blood'],
  ['Animals', 'Sloth', 'A very slow moving mammal', 'Hanging from tree branches', 'Growing algae on their fur'],

  // Countries
  ['Countries', 'Japan', 'The Land of the Rising Sun', 'Sushi and samurai', 'Vending machines on every corner'],
  ['Countries', 'Brazil', 'Famous for the Amazon rainforest', 'Samba and Carnival', 'Five football World Cups'],
  ['Countries', 'Italy', 'The boot-shaped nation', 'Pizza and pasta', 'A leaning tower'],
  ['Countries', 'Australia', 'A country and a continent', 'The Great Barrier Reef', 'Everything there wants to bite you'],
  ['Countries', 'Egypt', 'The land of the Pharaohs', 'Pyramids and the Sphinx', 'The longest river in the world'],
  ['Countries', 'Canada', 'Known for maple syrup', 'Very polite people', 'Mounties in red uniforms'],
  ['Countries', 'France', 'The country of romance', 'The Eiffel Tower', 'Eating snails and baguettes'],
  ['Countries', 'India', 'The second most populous nation', 'The Taj Mahal', 'Bollywood and cricket obsession'],
  ['Countries', 'Mexico', 'Tacos and tequila', 'Chichen Itza ruins', 'Day of the Dead celebrations'],
  ['Countries', 'Russia', 'The largest country by area', 'Vodka and cold winters', 'Matryoshka nesting dolls'],

  // Indian Cities
  ['Indian Cities', 'Mumbai', 'The city of dreams', 'Gateway of India', 'Local trains and Vada Pav'],
  ['Indian Cities', 'Delhi', 'The capital of India', 'Red Fort and India Gate', 'Extreme winters and pollution'],
  ['Indian Cities', 'Bangalore', 'The Silicon Valley of India', 'Pleasant weather year round', 'Terrible traffic jams'],
  ['Indian Cities', 'Kolkata', 'The city of joy', 'Victoria Memorial', 'Yellow taxis and rosogolla'],
  ['Indian Cities', 'Chennai', 'The Detroit of India', 'Marina Beach', 'Filter coffee and Rajinikanth'],
  ['Indian Cities', 'Hyderabad', 'The city of pearls', 'Charminar', 'The best Biryani'],
  ['Indian Cities', 'Jaipur', 'The Pink City', 'Hawa Mahal', 'Rajput forts and palaces'],
  ['Indian Cities', 'Pune', 'The Oxford of the East', 'Osho Ashram', 'A two-hour afternoon nap culture'],
  ['Indian Cities', 'Varanasi', 'The spiritual capital', 'Ghats on the Ganges', 'A famous evening Aarti'],
  ['Indian Cities', 'Goa', 'The party capital', 'Beautiful beaches', 'Cheap alcohol and Portuguese architecture'],

  // Technology
  ['Technology', 'Smartphone', 'A pocket-sized computer', 'Making calls and taking photos', 'Swiping left or right'],
  ['Technology', 'Internet', 'The world wide web', 'Connecting computers globally', 'A series of tubes'],
  ['Technology', 'Artificial Intelligence', 'Machines that can think', 'ChatGPT and self-driving cars', 'Taking over the world someday'],
  ['Technology', 'Blockchain', 'The technology behind Bitcoin', 'A decentralized ledger', 'Bored apes and smart contracts'],
  ['Technology', 'Virtual Reality', 'A headset for immersive worlds', 'The Metaverse', 'Getting motion sickness in your living room'],
  ['Technology', 'Cloud Computing', 'Storing data on remote servers', 'AWS and Google Drive', 'It is just someone else\'s computer'],
  ['Technology', 'Bluetooth', 'Short-range wireless connection', 'Pairing your headphones', 'Named after a Viking king'],
  ['Technology', 'Wi-Fi', 'Wireless internet access', 'Asking for the password at a cafe', 'A weak signal in the bedroom'],
  ['Technology', 'Drone', 'An unmanned aerial vehicle', 'Taking aerial wedding shots', 'Amazon delivering packages from the sky'],
  ['Technology', '3D Printing', 'Creating solid objects from digital files', 'Extruding melted plastic', 'Printing a gun or a house'],

  // Famous People
  ['Famous People', 'Albert Einstein', 'A genius physicist', 'E=mc2', 'Sticking his tongue out in a photo'],
  ['Famous People', 'Elon Musk', 'The CEO of Tesla and SpaceX', 'Buying a social media bird', 'Naming his kid a math equation'],
  ['Famous People', 'Mahatma Gandhi', 'The father of the nation', 'Non-violent freedom struggle', 'A march for salt'],
  ['Famous People', 'Nelson Mandela', 'Anti-apartheid revolutionary', '27 years in prison', 'The first black president of South Africa'],
  ['Famous People', 'Steve Jobs', 'The co-founder of Apple', 'A black turtleneck', 'Introducing a phone, an ipod, and an internet communicator'],
  ['Famous People', 'Mother Teresa', 'A Nobel Peace Prize nun', 'Charity work in Kolkata', 'A white and blue sari'],
  ['Famous People', 'Michael Jackson', 'The King of Pop', 'The Moonwalk', 'A single white glove'],
  ['Famous People', 'Marilyn Monroe', 'A 1950s blonde bombshell', 'A white dress blowing over a grate', 'Singing Happy Birthday Mr. President'],
  ['Famous People', 'William Shakespeare', 'A famous English playwright', 'Romeo and Juliet', 'To be or not to be'],
  ['Famous People', 'Leonardo da Vinci', 'A Renaissance polymath', 'The Mona Lisa', 'Writing in a mirror script'],

  // TV Shows
  ['TV Shows', 'Friends', 'Six pals in New York', 'Central Perk cafe', 'We were on a break!'],
  ['TV Shows', 'Game of Thrones', 'Dragons and ice zombies', 'The Iron Throne', 'A very disappointing final season'],
  ['TV Shows', 'Breaking Bad', 'A chemistry teacher cooks meth', 'Heisenberg', 'Throwing a pizza on the roof'],
  ['TV Shows', 'The Office', 'A mockumentary at Dunder Mifflin', 'Michael Scott', 'Identity theft is not a joke, Jim!'],
  ['TV Shows', 'Stranger Things', 'Kids fighting monsters in the 80s', 'The Upside Down', 'Loving Eggo waffles'],
  ['TV Shows', 'Money Heist', 'A Spanish bank robbery', 'Wearing Salvador Dali masks', 'Singing Bella Ciao'],
  ['TV Shows', 'Squid Game', 'Deadly Korean playground games', 'Red light, green light', 'A honeycomb carving challenge'],
  ['TV Shows', 'The Simpsons', 'A yellow cartoon family', 'Homer and Bart', 'Predicting the future constantly'],
  ['TV Shows', 'Peaky Blinders', 'A Birmingham street gang', 'Tommy Shelby', 'Razors hidden in flat caps'],
  ['TV Shows', 'Black Mirror', 'A dark sci-fi anthology', 'Technology gone wrong', 'A prime minister and a pig'],

  // Brands
  ['Brands', 'Apple', 'A tech giant with a bitten fruit logo', 'iPhones and MacBooks', 'Taking away the headphone jack'],
  ['Brands', 'Nike', 'A sports apparel company', 'Just Do It', 'A simple swoosh logo'],
  ['Brands', 'Coca-Cola', 'A red and white soda brand', 'A secret recipe in a vault', 'Inventing the modern Santa Claus'],
  ['Brands', 'McDonald\'s', 'A fast food empire', 'The Golden Arches', 'The ice cream machine is always broken'],
  ['Brands', 'Amazon', 'The everything store', 'Prime delivery', 'A smile from A to Z'],
  ['Brands', 'Google', 'The most popular search engine', 'Don\'t be evil', 'A colorful G logo'],
  ['Brands', 'Tesla', 'An electric car company', 'Autopilot features', 'Launching a car into space'],
  ['Brands', 'Disney', 'A magical entertainment company', 'Mickey Mouse', 'Buying Marvel and Star Wars'],
  ['Brands', 'Lego', 'Interlocking plastic bricks', 'Stepping on one hurts', 'Danish for play well'],
  ['Brands', 'Rolex', 'A luxury watchmaker', 'A golden crown logo', 'Waiting years to buy one at retail'],

  // Sports
  ['Sports', 'Basketball', 'Throwing a ball through a hoop', 'Dribbling and dunking', 'A shot clock violation'],
  ['Sports', 'Tennis', 'Hitting a fuzzy ball over a net', 'Wimbledon and Grand Slams', 'Scoring goes 15, 30, 40'],
  ['Sports', 'Golf', 'Hitting a small ball into a hole', 'Tiger Woods', 'Yelling fore when slicing'],
  ['Sports', 'Boxing', 'Fighting with padded gloves', 'A knockout blow', 'Biting an ear off'],
  ['Sports', 'Swimming', 'Racing in a pool', 'The butterfly stroke', 'Shaving your entire body for speed'],
  ['Sports', 'Formula 1', 'Open-wheel auto racing', 'Lewis Hamilton and Max Verstappen', 'A two-second pit stop'],
  ['Sports', 'Baseball', 'Hitting a ball with a wooden bat', 'A home run', 'Three strikes and you are out'],
  ['Sports', 'Rugby', 'An oval ball contact sport', 'The New Zealand Haka', 'No forward passes allowed'],
  ['Sports', 'Volleyball', 'Spiking a ball over a high net', 'Beach and indoor versions', 'A libero wearing a different color'],
  ['Sports', 'Badminton', 'Hitting a shuttlecock', 'Smash and drop shots', 'A very fast moving feather'],

  // Common Objects
  ['Common Objects', 'Umbrella', 'Keeps you dry in the rain', 'Opening it indoors is bad luck', 'Mary Poppins\' flying tool'],
  ['Common Objects', 'Mirror', 'A reflective glass surface', 'Checking your appearance', 'Breaking it causes 7 years bad luck'],
  ['Common Objects', 'Toothbrush', 'Used to clean your mouth', 'Applying paste twice a day', 'Dentists recommend soft bristles'],
  ['Common Objects', 'Pillow', 'A soft cushion for the head', 'Used for sleeping', 'Always cooler on the other side'],
  ['Common Objects', 'Keys', 'Used to open doors or start cars', 'Often lost in the couch', 'Jingling in your pocket'],
  ['Common Objects', 'Scissors', 'A tool for cutting paper', 'Two blades pivoted in the middle', 'Running with them is dangerous'],
  ['Common Objects', 'Clock', 'A device for telling time', 'Ticks and tocks', 'A broken one is right twice a day'],
  ['Common Objects', 'Chair', 'A piece of furniture to sit on', 'Four legs and a back', 'Musical version at parties'],
  ['Common Objects', 'Wallet', 'A pocket case for money', 'Holding cards and cash', 'Faking pulling it out when the bill arrives'],
  ['Common Objects', 'Pen', 'A tool for writing with ink', 'Clicking it nervously', 'The ink is mightier than the sword']
];

export const wordDatabase: WordEntry[] = rawData.map(([category, word, easyHint, mediumHint, hardHint]) => ({
  category,
  word,
  easyHint,
  mediumHint,
  hardHint
}));
