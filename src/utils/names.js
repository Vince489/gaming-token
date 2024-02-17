const User = require('../domains/user/model');

async function generateUsername() {
  // Arrays of first names and last names
  const fnames = [
    'Amnesia', 'Apple', 'Atomic', 'Afghan', 'Alien', 'Blueberry', 'Bubba', 'Black', 'Banana', 'Bubblegum', 'Berry', 'Blitz', 'Biscuit', 'Blaze', 'Bliss', 'Blue', 'Badger', 'Cake', 'Chemgirl', 'Cookie', 'Cotton Candy', 'Cherry', 'Critical', 'California', 'Citrus', 'Chronic', 'Cheese', 'Cinderella', 'Crack', 'Diesel','Durban', 'Dutch', 'Death', 'Dank', 'Daddy', 'Dynamite', 'Dream', 'Dragon', 'Drool', 'Elegant', 'Elusive', 'Emerald', 'Euphoria', 'Evergreen', 'Elderberry', 'Espresso', 'Enchanting', 'Fruity', 'Foggy', 'Floral', 'Fire', 'Frost', 'Funky', 'Fudge', 'Frostbite', 'Fruit', 'Fruity', 'Fiesta', 'Frosty', 'Green', 'Grape', 'Gorilla', 'Gold', 'Golden', 'Galactic', 'Gummy', 'Ganja', 'Goblin', 'Giggly', 'Goofy', 'Haze', 'Hash', 'Heavenly', 'Honey', 'Hippie', 'Hercules',  'Hypnotic', 'Huckleberry', 'Indica', 'Island', 'Ice', 'Inferno', 'Infinity', 'Illusion', 'Ivory', 'Insomnia', 'Jack','Java', 'Jungle', 'Juicy', 'Jupiter', 'Jazzy', 'Jasmine', 'Jalapeño', 'Jolly', 'Kush', 'Kryptonite', 'Kaleidoscope', 'Killer', 'Karma', 'Kangaroo', 'Krypton', 'Kaboom', 'Lemon', 'Lime', 'Lavender', 'Lunar', 'Lagoon', 'Lively', 'Lava', 'Lullaby', 'Lava', 'Mango', 'Melon', 'Mystic', 'Mars', 'Mercury', 'Magic', 'Mocha', 'Midnight', 'Muffin', 'Northern', 'Nectar', 'Napalm', 'Ninja', 'Nebula', 'Nougat', 'Nightfall', 'Nectarine', 'OG', 'Ocean', 'Orbit', 'Outlaw', 'Onyx', 'Opulent', 'Oasis', 'Oatmeal', 'Purple', 'Pineapple', 'Platinum', 'Peach', 'Puff', 'Pine', 'Potion', 'Pancake', 'Pebbles', 'Puddle', 'Quantum', 'Quasar', 'Quake', 'Quartz', 'Quick', 'Quiver',, 'Quack', 'Quest', 'Rainbow', 'Rocket', 'Rogue', 'Radiant', 'Raspberry', 'Rush', 'Rumble', 'Rustic', 'Royal', 'Razor', 'Sour', 'Strawberry', 'Skywalker', 'Sativa', 'Silver', 'Sunrise', 'Sorbet', 'Sugar', 'Space', 'Stratosphere', 'Tangerine', 'Tropical', 'Thunder', 'Turbo', 'Twilight', 'Trance', 'Tango', 'Tequila', 'Trippy', 'Twist', 'Utopia', 'Ultimate', 'Uplift', 'Ultra', 'Violet', 'Viper', 'Vortex', 'Vanilla', 'Voodoo', 'Vista', 'Velvet', 'Vortex', 'White', 'Widow', 'Wonder', 'Wave', 'Warp', 'Waffle', 'Wizard', 'Waltz', 'Whirlwind', 'Wish','Yellow', 'Yogurt', 'Yucca', 'Yoga', 'Yoga','Zephyrhills', 'Zesty', 'Zigzag', 'Zombie', 'Zodiac', 'Zippy'
  ];
  const lnames = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet", "Purple", "Pink", "Brown", "Black", "White", "Gray", "Silver", "Gold", "Copper", "Bronze", "Platinum", "Titanium", "Steel", "Iron", "Aluminum", "Nickel", "Cobalt", "Copper", "Zinc", "Tin", "Lead", "Mercury", "Magnesium", "Potassium", "Sodium", "Calcium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon", "Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc", "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirconium", "Niobium", "Molybdenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin", "Antimony", "Tellurium", "Iodine", "Xenon", "Cesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium", "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium", "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Mercury", "Thallium", "Lead", "Bismuth", "Polonium"];

  let codeName;
  let isUnique = false;

  while (!isUnique) {
    // Select random first name and last name from arrays
    const randomFirstName = fnames[Math.floor(Math.random() * fnames.length)];
    const randomLastName = lnames[Math.floor(Math.random() * lnames.length)];

  // Generate random 4-digit number
  const randomDigits = Math.floor(1000 + Math.random() * 9000);

      // Concatenate first name, last name, and random digits with underscores
      codeName = `${randomFirstName.toLowerCase()}_${randomLastName.toLowerCase()}_${randomDigits}`;

      // Check if codeName is unique
      const existingUser = await User.findOne({ codeName });
      if (!existingUser) {
          isUnique = true;
      }
  }

  return codeName;
}


module.exports = generateUsername;


