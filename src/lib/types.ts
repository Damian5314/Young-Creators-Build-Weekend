// Meal types for FoodSwipe feed
export type MealTag = 'pasta' | 'vegan' | 'soup' | 'stirfry' | 'quick' | 'cheap' | 'high-protein' | 'breakfast' | 'dessert' | 'healthy';

export interface Meal {
  id: string;
  name: string;
  imageUrl: string;
  videoUrl?: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  tags: MealTag[];
  durationMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Mock data for the FoodSwipe feed
export const mockMeals: Meal[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
    name: 'Spicy Ramen',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=_eSfYBT_S_M',
    description: 'A rich and flavorful Japanese noodle soup with a spicy kick. Perfect for cold days or when you need some comfort food.',
    ingredients: [
      '200g ramen noodles',
      '4 cups chicken or pork broth',
      '2 tbsp soy sauce',
      '1 tbsp miso paste',
      '1 tsp chili oil',
      '2 soft-boiled eggs',
      'Sliced green onions',
      'Nori sheets',
      'Sliced pork belly or chicken'
    ],
    steps: [
      'Bring broth to a boil in a large pot.',
      'Mix in soy sauce, miso paste, and chili oil.',
      'Cook ramen noodles according to package instructions.',
      'Divide noodles into bowls and pour hot broth over them.',
      'Top with soft-boiled eggs, sliced meat, green onions, and nori.'
    ],
    tags: ['soup', 'quick'],
    durationMinutes: 25,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
    name: 'Creamy Carbonara',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=3AAdKl1UYZs',
    description: 'Classic Italian pasta with a creamy egg-based sauce, crispy pancetta, and parmesan cheese.',
    ingredients: [
      '400g spaghetti',
      '200g pancetta or guanciale',
      '4 egg yolks',
      '100g pecorino romano',
      '50g parmesan',
      'Black pepper',
      'Salt'
    ],
    steps: [
      'Cook pasta in salted water until al dente.',
      'Fry pancetta until crispy.',
      'Mix egg yolks with grated cheeses and pepper.',
      'Toss hot pasta with pancetta, remove from heat.',
      'Quickly mix in egg mixture, stirring constantly.',
      'Serve immediately with extra cheese and pepper.'
    ],
    tags: ['pasta', 'quick'],
    durationMinutes: 20,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
    name: 'Thai Green Curry',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=LIbKVpBQKJI',
    description: 'Aromatic Thai curry with coconut milk, vegetables, and your choice of protein.',
    ingredients: [
      '400ml coconut milk',
      '3 tbsp green curry paste',
      '500g chicken or tofu',
      '1 eggplant, cubed',
      '1 bell pepper, sliced',
      'Thai basil leaves',
      'Fish sauce',
      'Palm sugar',
      'Jasmine rice'
    ],
    steps: [
      'Heat coconut cream in a wok until oil separates.',
      'Fry curry paste until fragrant.',
      'Add protein and cook until done.',
      'Pour in remaining coconut milk and vegetables.',
      'Season with fish sauce and sugar.',
      'Simmer until vegetables are tender.',
      'Garnish with Thai basil and serve with rice.'
    ],
    tags: ['stirfry', 'healthy'],
    durationMinutes: 35,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567804',
    name: 'Avocado Toast',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80',
    description: 'Simple yet delicious breakfast with creamy avocado on crispy toast, topped with eggs and seasonings.',
    ingredients: [
      '2 slices sourdough bread',
      '1 ripe avocado',
      '2 eggs',
      'Red pepper flakes',
      'Everything bagel seasoning',
      'Lemon juice',
      'Salt and pepper',
      'Microgreens (optional)'
    ],
    steps: [
      'Toast bread until golden and crispy.',
      'Mash avocado with lemon juice, salt, and pepper.',
      'Poach or fry eggs to your preference.',
      'Spread avocado on toast.',
      'Top with eggs and seasonings.',
      'Add microgreens if desired.'
    ],
    tags: ['breakfast', 'quick', 'healthy', 'vegan'],
    durationMinutes: 10,
    difficulty: 'easy'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567805',
    name: 'Beef Stir Fry',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=A0oe-uSVpJk',
    description: 'Quick and easy beef stir fry with crisp vegetables in a savory sauce.',
    ingredients: [
      '500g beef sirloin, sliced thin',
      '2 cups broccoli florets',
      '1 bell pepper, sliced',
      '3 cloves garlic',
      '3 tbsp soy sauce',
      '1 tbsp oyster sauce',
      '1 tsp sesame oil',
      'Vegetable oil',
      'Rice for serving'
    ],
    steps: [
      'Marinate beef in soy sauce for 15 minutes.',
      'Heat oil in wok over high heat.',
      'Stir fry beef until browned, set aside.',
      'Cook vegetables until crisp-tender.',
      'Return beef, add sauces.',
      'Toss everything together.',
      'Serve over steamed rice.'
    ],
    tags: ['stirfry', 'quick', 'high-protein'],
    durationMinutes: 25,
    difficulty: 'easy'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567806',
    name: 'Vegan Buddha Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    description: 'Nutritious and colorful bowl packed with grains, roasted vegetables, and tahini dressing.',
    ingredients: [
      '1 cup quinoa',
      '1 can chickpeas',
      '1 sweet potato, cubed',
      '2 cups kale',
      '1 avocado',
      'Cherry tomatoes',
      '3 tbsp tahini',
      'Lemon juice',
      'Garlic'
    ],
    steps: [
      'Cook quinoa according to package.',
      'Roast sweet potato and chickpeas at 400°F for 25 minutes.',
      'Massage kale with olive oil and salt.',
      'Make dressing: mix tahini, lemon, garlic, and water.',
      'Assemble bowls with all ingredients.',
      'Drizzle with tahini dressing.'
    ],
    tags: ['vegan', 'healthy', 'high-protein'],
    durationMinutes: 40,
    difficulty: 'easy'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567807',
    name: 'Chicken Tikka Masala',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=a03U45jFxOI',
    description: 'Tender chicken pieces in a rich, creamy tomato-based curry sauce with aromatic spices.',
    ingredients: [
      '600g chicken breast, cubed',
      '1 cup yogurt',
      '400g crushed tomatoes',
      '200ml heavy cream',
      '2 tbsp garam masala',
      '1 tbsp turmeric',
      '1 tbsp cumin',
      'Ginger and garlic',
      'Fresh cilantro',
      'Naan bread'
    ],
    steps: [
      'Marinate chicken in yogurt and spices for 2 hours.',
      'Grill or broil chicken until charred.',
      'Sauté onions, ginger, and garlic.',
      'Add tomatoes and spices, simmer 15 minutes.',
      'Stir in cream and grilled chicken.',
      'Simmer until sauce thickens.',
      'Garnish with cilantro, serve with naan.'
    ],
    tags: ['high-protein'],
    durationMinutes: 45,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567808',
    name: 'Margherita Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=1-SJGQ2HLp8',
    description: 'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil.',
    ingredients: [
      '500g pizza dough',
      '200g San Marzano tomatoes',
      '250g fresh mozzarella',
      'Fresh basil leaves',
      'Extra virgin olive oil',
      'Salt',
      '1 clove garlic'
    ],
    steps: [
      'Preheat oven to highest setting with pizza stone.',
      'Crush tomatoes with garlic and salt.',
      'Stretch dough into a 12-inch circle.',
      'Spread tomato sauce, leaving border.',
      'Tear mozzarella and distribute evenly.',
      'Bake 8-10 minutes until crust is charred.',
      'Top with fresh basil and olive oil.'
    ],
    tags: ['quick'],
    durationMinutes: 20,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567809',
    name: 'Chocolate Lava Cake',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=YdHYEFBpc_o',
    description: 'Decadent individual chocolate cakes with a molten center. The ultimate dessert.',
    ingredients: [
      '200g dark chocolate',
      '100g butter',
      '2 eggs',
      '2 egg yolks',
      '100g sugar',
      '50g flour',
      'Cocoa powder for dusting',
      'Vanilla ice cream'
    ],
    steps: [
      'Preheat oven to 425°F. Butter and cocoa-dust ramekins.',
      'Melt chocolate and butter together.',
      'Whisk eggs, yolks, and sugar until thick.',
      'Fold in chocolate mixture, then flour.',
      'Divide batter into ramekins.',
      'Bake 12-14 minutes until edges set but center jiggles.',
      'Invert onto plates, serve with ice cream.'
    ],
    tags: ['dessert', 'quick'],
    durationMinutes: 25,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567810',
    name: 'Greek Salad',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
    description: 'Fresh and vibrant Mediterranean salad with crisp vegetables, olives, and feta cheese.',
    ingredients: [
      '4 tomatoes, chunked',
      '1 cucumber, sliced',
      '1 red onion, sliced',
      '200g feta cheese',
      'Kalamata olives',
      'Extra virgin olive oil',
      'Red wine vinegar',
      'Dried oregano',
      'Salt and pepper'
    ],
    steps: [
      'Cut tomatoes and cucumber into chunks.',
      'Slice red onion thinly.',
      'Combine vegetables in a bowl.',
      'Add olives and large pieces of feta.',
      'Drizzle generously with olive oil.',
      'Add vinegar, oregano, salt, and pepper.',
      'Toss gently and serve immediately.'
    ],
    tags: ['healthy', 'quick', 'vegan'],
    durationMinutes: 10,
    difficulty: 'easy'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567811',
    name: 'Mushroom Risotto',
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=EBKO-QlOVt0',
    description: 'Creamy Italian rice dish with earthy mushrooms, white wine, and parmesan.',
    ingredients: [
      '300g arborio rice',
      '400g mixed mushrooms',
      '1L vegetable stock',
      '150ml white wine',
      '1 shallot, diced',
      '50g butter',
      '50g parmesan',
      'Fresh thyme',
      'Olive oil'
    ],
    steps: [
      'Keep stock warm on low heat.',
      'Sauté mushrooms until golden, set aside.',
      'Cook shallot in butter until soft.',
      'Add rice, toast for 2 minutes.',
      'Add wine, stir until absorbed.',
      'Add stock one ladle at a time, stirring constantly.',
      'Fold in mushrooms, parmesan, and butter.',
      'Rest 2 minutes before serving.'
    ],
    tags: ['pasta', 'vegan'],
    durationMinutes: 35,
    difficulty: 'hard'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567812',
    name: 'Fish Tacos',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    description: 'Crispy beer-battered fish in soft tortillas with fresh slaw and chipotle mayo.',
    ingredients: [
      '500g white fish fillets',
      '8 small tortillas',
      '1 cup flour',
      '1 cup beer',
      '2 cups shredded cabbage',
      'Chipotle mayo',
      'Lime wedges',
      'Fresh cilantro',
      'Pickled onions'
    ],
    steps: [
      'Make batter with flour, beer, and salt.',
      'Cut fish into strips.',
      'Heat oil for frying to 375°F.',
      'Dip fish in batter, fry until golden.',
      'Make slaw with cabbage, lime, and cilantro.',
      'Warm tortillas.',
      'Assemble tacos with fish, slaw, and toppings.'
    ],
    tags: ['quick', 'high-protein'],
    durationMinutes: 30,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567813',
    name: 'Overnight Oats',
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&q=80',
    description: 'No-cook breakfast prepared the night before. Creamy oats with endless topping possibilities.',
    ingredients: [
      '1 cup rolled oats',
      '1 cup milk of choice',
      '1/2 cup Greek yogurt',
      '2 tbsp maple syrup',
      '1 tbsp chia seeds',
      'Fresh berries',
      'Sliced banana',
      'Nut butter',
      'Granola'
    ],
    steps: [
      'Combine oats, milk, yogurt, and maple syrup in a jar.',
      'Add chia seeds and stir well.',
      'Cover and refrigerate overnight.',
      'In the morning, stir and add more milk if needed.',
      'Top with berries, banana, nut butter, and granola.',
      'Enjoy cold or microwave if preferred warm.'
    ],
    tags: ['breakfast', 'healthy', 'cheap'],
    durationMinutes: 5,
    difficulty: 'easy'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567814',
    name: 'Pad Thai',
    imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=c_jM7jRqmYo',
    description: 'Classic Thai stir-fried noodles with a perfect balance of sweet, sour, and savory flavors.',
    ingredients: [
      '250g rice noodles',
      '200g shrimp or tofu',
      '2 eggs',
      '3 tbsp tamarind paste',
      '2 tbsp fish sauce',
      '2 tbsp palm sugar',
      'Bean sprouts',
      'Crushed peanuts',
      'Lime wedges',
      'Green onions'
    ],
    steps: [
      'Soak rice noodles in warm water until pliable.',
      'Make sauce: mix tamarind, fish sauce, and sugar.',
      'Stir fry protein until cooked, set aside.',
      'Scramble eggs in wok, add noodles.',
      'Add sauce, toss until noodles are coated.',
      'Add protein and bean sprouts.',
      'Serve with peanuts, lime, and green onions.'
    ],
    tags: ['stirfry', 'quick'],
    durationMinutes: 25,
    difficulty: 'medium'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567815',
    name: 'Tomato Soup',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    description: 'Comforting homemade tomato soup, perfect with a grilled cheese sandwich.',
    ingredients: [
      '2 cans whole tomatoes',
      '1 onion, diced',
      '4 cloves garlic',
      '2 cups vegetable broth',
      '1/2 cup heavy cream',
      'Fresh basil',
      'Olive oil',
      'Salt and pepper',
      'Crusty bread'
    ],
    steps: [
      'Sauté onion and garlic until soft.',
      'Add tomatoes with their juice.',
      'Pour in broth, bring to simmer.',
      'Cook 20 minutes until flavors meld.',
      'Blend until smooth.',
      'Stir in cream and basil.',
      'Season and serve with crusty bread.'
    ],
    tags: ['soup', 'cheap', 'vegan'],
    durationMinutes: 35,
    difficulty: 'easy'
  }
];
