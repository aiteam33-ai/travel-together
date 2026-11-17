// ============================================================
// MENU DATA — Trattoria del Sole
// Edit names, prices, descriptions, tags or images here only.
// veg: true = green dot, false = red dot.
// tags: any of "vegan", "gluten-free", "spicy" (vegetarian is shown via the dot).
// bestSeller / chefSpecial: badges. image: swap in your own photo path.
// ============================================================

export const RESTAURANT_NAME = "Trattoria del Sole";
export const RESTAURANT_TAGLINE = "Cucina Toscana — Tuscan cooking, golden-hour hospitality";

export const COUPON = {
  code: "BENVENUTO10",
  percent: 10,
  firstOrderOnly: true,
};

export const GST_PERCENT = 5;
export const SERVICE_CHARGE_PERCENT = 5;

export const MENU = [
  {
    group: "Colazione",
    groupEnglish: "Breakfast & Pastries",
    items: [
      { name: "Cornetto Semplice", english: "Plain Croissant", price: 120, veg: true, tags: [], image: "images/placeholder-pastry.svg", description: "Buttery, flaky, baked fresh each morning." },
      { name: "Cornetto alla Mandorla", english: "Almond Croissant", price: 150, veg: true, tags: [], image: "images/placeholder-pastry.svg", description: "Filled with almond cream, topped with flaked almonds." },
      { name: "Cornetto al Cioccolato", english: "Chocolate Croissant", price: 150, veg: true, tags: [], image: "images/placeholder-pastry.svg", description: "A rich dark chocolate core in a buttery shell.", bestSeller: true },
      { name: "Bomboloni", english: "Italian Doughnuts", price: 130, veg: true, tags: [], image: "images/placeholder-pastry.svg", description: "Sugar-dusted, filled with vanilla custard." },
      { name: "Sfogliatella", english: "Flaky Shell Pastry", price: 160, veg: true, tags: [], image: "images/placeholder-pastry.svg", description: "Crisp layered shell with sweet ricotta filling." },
      { name: "Brioche con Crema", english: "Cream-Filled Brioche", price: 140, veg: true, tags: [], image: "images/placeholder-pastry.svg", description: "Soft brioche piped with pastry cream." },
      { name: "Frittata", english: "Italian Omelette", price: 220, veg: true, tags: ["gluten-free"], image: "images/placeholder-pastry.svg", description: "Eggs baked with seasonal vegetables and herbs." },
    ],
  },
  {
    group: "Antipasti",
    groupEnglish: "Starters",
    items: [
      { name: "Bruschetta al Pomodoro", english: "Tomato Bruschetta", price: 220, veg: true, tags: ["vegan"], image: "images/placeholder-antipasti.svg", description: "Toasted bread, ripe tomato, basil, garlic, olive oil.", bestSeller: true },
      { name: "Insalata Caprese", english: "Caprese Salad", price: 260, veg: true, tags: ["gluten-free"], image: "images/placeholder-antipasti.svg", description: "Buffalo mozzarella, tomato, basil, balsamic glaze." },
      { name: "Arancini", english: "Fried Rice Balls", price: 240, veg: true, tags: [], image: "images/placeholder-antipasti.svg", description: "Crisp saffron risotto balls with a molten cheese core." },
      { name: "Calamari Fritti", english: "Fried Calamari", price: 320, veg: false, tags: ["spicy"], image: "images/placeholder-antipasti.svg", description: "Lightly fried squid, lemon, spiced marinara." },
      { name: "Carpaccio di Manzo", english: "Beef Carpaccio", price: 380, veg: false, tags: ["gluten-free"], image: "images/placeholder-antipasti.svg", description: "Thin-sliced raw beef, rocket, parmesan, capers." },
      { name: "Prosciutto e Melone", english: "Prosciutto & Melon", price: 340, veg: false, tags: ["gluten-free"], image: "images/placeholder-antipasti.svg", description: "Cured ham draped over sweet ripe melon." },
      { name: "Funghi Ripieni", english: "Stuffed Mushrooms", price: 260, veg: true, tags: [], image: "images/placeholder-antipasti.svg", description: "Mushroom caps filled with herbed breadcrumbs and cheese." },
      { name: "Bastoncini di Mozzarella", english: "Mozzarella Sticks", price: 230, veg: true, tags: [], image: "images/placeholder-antipasti.svg", description: "Golden fried mozzarella, marinara dip." },
    ],
  },
  {
    group: "Zuppe e Insalate",
    groupEnglish: "Soups & Salads",
    items: [
      { name: "Minestrone", english: "Vegetable Soup", price: 220, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-soup.svg", description: "Slow-simmered seasonal vegetables and beans." },
      { name: "Zuppa di Pomodoro e Basilico", english: "Tomato Basil Soup", price: 200, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-soup.svg", description: "Silky tomato soup finished with fresh basil oil." },
      { name: "Ribollita", english: "Tuscan Bread & Bean Soup", price: 240, veg: true, tags: ["vegan"], image: "images/placeholder-soup.svg", description: "A hearty Tuscan classic of bread, cannellini beans and kale." },
      { name: "Insalata Caesar", english: "Caesar Salad", price: 280, veg: true, tags: [], image: "images/placeholder-soup.svg", description: "Crisp romaine, parmesan, garlic croutons, Caesar dressing." },
      { name: "Panzanella", english: "Tuscan Bread Salad", price: 260, veg: true, tags: ["vegan"], image: "images/placeholder-soup.svg", description: "Stale bread, tomato, cucumber, red onion, olive oil." },
      { name: "Rucola e Parmigiano", english: "Rocket & Parmesan Salad", price: 250, veg: true, tags: ["gluten-free"], image: "images/placeholder-soup.svg", description: "Peppery rocket, shaved parmesan, lemon, olive oil." },
    ],
  },
  {
    group: "Pane",
    groupEnglish: "Breads",
    items: [
      { name: "Pane all'Aglio", english: "Garlic Bread", price: 150, veg: true, tags: [], image: "images/placeholder-bread.svg", description: "Toasted baguette, garlic butter, parsley.", bestSeller: true },
      { name: "Focaccia al Rosmarino", english: "Rosemary Focaccia", price: 180, veg: true, tags: ["vegan"], image: "images/placeholder-bread.svg", description: "Olive-oil-rich focaccia with fresh rosemary and sea salt." },
      { name: "Focaccia alle Olive", english: "Olive Focaccia", price: 190, veg: true, tags: ["vegan"], image: "images/placeholder-bread.svg", description: "Studded with Kalamata and green olives." },
      { name: "Focaccia al Pomodorino", english: "Cherry Tomato Focaccia", price: 190, veg: true, tags: ["vegan"], image: "images/placeholder-bread.svg", description: "Topped with sweet cherry tomatoes and basil." },
      { name: "Ciabatta", english: "Ciabatta", price: 140, veg: true, tags: ["vegan"], image: "images/placeholder-bread.svg", description: "Airy, crusty Italian classic, baked fresh." },
      { name: "Grissini", english: "Breadsticks", price: 110, veg: true, tags: ["vegan"], image: "images/placeholder-bread.svg", description: "Thin, crisp hand-rolled breadsticks." },
      { name: "Pane Toscano", english: "Tuscan Bread", price: 130, veg: true, tags: ["vegan"], image: "images/placeholder-bread.svg", description: "Traditional saltless Tuscan loaf." },
    ],
  },
  {
    group: "Pasta",
    items: [
      { name: "Spaghetti alla Carbonara", english: "Spaghetti Carbonara", price: 340, veg: false, tags: [], image: "images/placeholder-pasta.svg", description: "Egg, pecorino, guanciale, cracked black pepper.", bestSeller: true },
      { name: "Spaghetti Aglio e Olio", english: "Garlic & Oil Spaghetti", price: 280, veg: true, tags: ["vegan", "spicy"], image: "images/placeholder-pasta.svg", description: "Garlic, chilli flakes, olive oil, parsley." },
      { name: "Penne all'Arrabbiata", english: "Penne Arrabbiata", price: 300, veg: true, tags: ["vegan", "spicy"], image: "images/placeholder-pasta.svg", description: "Fiery tomato sauce, garlic, chilli." },
      { name: "Fettuccine Alfredo", english: "Fettuccine Alfredo", price: 340, veg: true, tags: [], image: "images/placeholder-pasta.svg", description: "Butter, parmesan, cream, fresh fettuccine." },
      { name: "Lasagna al Forno", english: "Baked Lasagna", price: 380, veg: false, tags: [], image: "images/placeholder-pasta.svg", description: "Layered pasta, ragù, béchamel, baked golden." },
      { name: "Ravioli Spinaci e Ricotta", english: "Spinach-Ricotta Ravioli", price: 360, veg: true, tags: [], image: "images/placeholder-pasta.svg", description: "Hand-filled ravioli, sage butter." },
      { name: "Tagliatelle al Ragù", english: "Tagliatelle with Ragù", price: 370, veg: false, tags: [], image: "images/placeholder-pasta.svg", description: "Slow-cooked beef ragù over fresh tagliatelle.", chefSpecial: true },
      { name: "Pesto alla Genovese", english: "Pesto Genovese", price: 310, veg: true, tags: [], image: "images/placeholder-pasta.svg", description: "Basil, pine nut and parmesan pesto, trofie pasta." },
      { name: "Gnocchi al Burro e Salvia", english: "Gnocchi", price: 320, veg: true, tags: [], image: "images/placeholder-pasta.svg", description: "Potato gnocchi, brown butter, crisp sage." },
      { name: "Cacio e Pepe", english: "Cacio e Pepe", price: 300, veg: true, tags: [], image: "images/placeholder-pasta.svg", description: "Pecorino romano and cracked black pepper, Roman style." },
      { name: "Linguine alle Vongole", english: "Linguine with Clams", price: 420, veg: false, tags: [], image: "images/placeholder-pasta.svg", description: "Fresh clams, white wine, garlic, parsley." },
      { name: "Penne al Forno", english: "Baked Penne", price: 310, veg: true, tags: [], image: "images/placeholder-pasta.svg", description: "Baked penne, tomato sauce, melted mozzarella." },
    ],
  },
  {
    group: "Risotto",
    items: [
      { name: "Risotto ai Funghi", english: "Mushroom Risotto", price: 360, veg: true, tags: ["gluten-free"], image: "images/placeholder-risotto.svg", description: "Creamy arborio rice, wild mushrooms, parmesan.", bestSeller: true },
      { name: "Risotto alla Milanese", english: "Saffron Risotto", price: 370, veg: true, tags: ["gluten-free"], image: "images/placeholder-risotto.svg", description: "Classic saffron-scented risotto, bone marrow butter." },
      { name: "Risotto ai Frutti di Mare", english: "Seafood Risotto", price: 440, veg: false, tags: ["gluten-free"], image: "images/placeholder-risotto.svg", description: "Prawns, mussels, squid, saffron-tomato risotto." },
      { name: "Risotto agli Asparagi", english: "Asparagus Risotto", price: 350, veg: true, tags: ["gluten-free"], image: "images/placeholder-risotto.svg", description: "Spring asparagus, parmesan, lemon zest." },
    ],
  },
  {
    group: "Pizza",
    groupEnglish: "Wood-Fired",
    items: [
      { name: "Margherita", english: "Margherita", price: 320, veg: true, tags: [], image: "images/placeholder-pizza.svg", description: "San Marzano tomato, mozzarella, fresh basil.", bestSeller: true },
      { name: "Marinara", english: "Marinara", price: 280, veg: true, tags: ["vegan"], image: "images/placeholder-pizza.svg", description: "Tomato, garlic, oregano, olive oil — no cheese." },
      { name: "Pepperoni", english: "Pepperoni", price: 400, veg: false, tags: ["spicy"], image: "images/placeholder-pizza.svg", description: "Spicy pepperoni, mozzarella, tomato." },
      { name: "Quattro Formaggi", english: "Four Cheese", price: 420, veg: true, tags: [], image: "images/placeholder-pizza.svg", description: "Mozzarella, gorgonzola, fontina, parmesan." },
      { name: "Quattro Stagioni", english: "Four Seasons", price: 440, veg: false, tags: [], image: "images/placeholder-pizza.svg", description: "Ham, mushroom, artichoke and olives, one quarter each." },
      { name: "Capricciosa", english: "Capricciosa", price: 440, veg: false, tags: [], image: "images/placeholder-pizza.svg", description: "Ham, mushroom, artichoke, olives, egg." },
      { name: "Diavola", english: "Diavola", price: 410, veg: false, tags: ["spicy"], image: "images/placeholder-pizza.svg", description: "Spicy salami, chilli oil, mozzarella." },
      { name: "Prosciutto e Funghi", english: "Ham & Mushroom", price: 400, veg: false, tags: [], image: "images/placeholder-pizza.svg", description: "Cooked ham, mushrooms, mozzarella." },
      { name: "Vegetariana", english: "Vegetarian", price: 370, veg: true, tags: [], image: "images/placeholder-pizza.svg", description: "Bell peppers, olives, onion, mushroom, zucchini." },
      { name: "Calzone", english: "Calzone", price: 390, veg: true, tags: [], image: "images/placeholder-pizza.svg", description: "Folded pizza, ricotta, mozzarella, ham optional." },
      { name: "Pizza Bianca", english: "White Pizza", price: 360, veg: true, tags: [], image: "images/placeholder-pizza.svg", description: "No tomato — mozzarella, ricotta, garlic oil, rosemary." },
      { name: "Crea la Tua", english: "Build Your Own", price: 350, veg: true, tags: [], image: "images/placeholder-pizza.svg", description: "Choose your own base and toppings." },
    ],
  },
  {
    group: "Secondi",
    groupEnglish: "Main Courses",
    items: [
      { name: "Pollo alla Parmigiana", english: "Chicken Parmigiana", price: 420, veg: false, tags: [], image: "images/placeholder-secondi.svg", description: "Breaded chicken, tomato, melted mozzarella." },
      { name: "Pollo al Limone", english: "Chicken Piccata", price: 410, veg: false, tags: ["gluten-free"], image: "images/placeholder-secondi.svg", description: "Pan-seared chicken, lemon-caper butter sauce." },
      { name: "Osso Buco", english: "Braised Veal Shank", price: 560, veg: false, tags: ["gluten-free"], image: "images/placeholder-secondi.svg", description: "Slow-braised veal shank, gremolata, saffron risotto.", chefSpecial: true },
      { name: "Saltimbocca alla Romana", english: "Saltimbocca", price: 480, veg: false, tags: ["gluten-free"], image: "images/placeholder-secondi.svg", description: "Veal, prosciutto, sage, white wine sauce." },
      { name: "Salmone alla Griglia", english: "Grilled Salmon", price: 520, veg: false, tags: ["gluten-free"], image: "images/placeholder-secondi.svg", description: "Grilled salmon, lemon butter, seasonal greens." },
      { name: "Melanzane alla Parmigiana", english: "Eggplant Parmigiana", price: 360, veg: true, tags: ["gluten-free"], image: "images/placeholder-secondi.svg", description: "Layered eggplant, tomato, mozzarella, parmesan." },
      { name: "Scaloppine di Vitello", english: "Veal Scaloppine", price: 500, veg: false, tags: ["gluten-free"], image: "images/placeholder-secondi.svg", description: "Thin veal cutlets, white wine and mushroom sauce." },
    ],
  },
  {
    group: "Contorni",
    groupEnglish: "Sides",
    items: [
      { name: "Patate Arrosto", english: "Roasted Potatoes", price: 180, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-contorni.svg", description: "Rosemary, garlic, olive oil, oven-roasted." },
      { name: "Verdure alla Griglia", english: "Grilled Vegetables", price: 210, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-contorni.svg", description: "Seasonal vegetables, char-grilled with olive oil." },
      { name: "Patatine al Tartufo", english: "Truffle Fries", price: 260, veg: true, tags: ["vegan"], image: "images/placeholder-contorni.svg", description: "Crisp fries, truffle oil, parmesan." },
      { name: "Spinaci Saltati", english: "Sauteed Spinach", price: 190, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-contorni.svg", description: "Spinach, garlic, olive oil, a squeeze of lemon." },
    ],
  },
  {
    group: "Dolci",
    groupEnglish: "Desserts",
    items: [
      { name: "Tiramisu", english: "Tiramisu", price: 260, veg: true, tags: [], image: "images/placeholder-dolci.svg", description: "Espresso-soaked ladyfingers, mascarpone, cocoa.", bestSeller: true },
      { name: "Panna Cotta", english: "Panna Cotta", price: 230, veg: true, tags: ["gluten-free"], image: "images/placeholder-dolci.svg", description: "Silky set cream, berry coulis." },
      { name: "Cannoli", english: "Cannoli (2 pcs)", price: 220, veg: true, tags: [], image: "images/placeholder-dolci.svg", description: "Crisp shells, sweet ricotta filling, pistachio." },
      { name: "Gelato al Pistacchio", english: "Pistachio Gelato", price: 190, veg: true, tags: ["gluten-free"], image: "images/placeholder-dolci.svg", description: "Two scoops, Sicilian pistachio." },
      { name: "Gelato Stracciatella", english: "Stracciatella Gelato", price: 190, veg: true, tags: ["gluten-free"], image: "images/placeholder-dolci.svg", description: "Two scoops, cream with dark chocolate shards." },
      { name: "Gelato alla Nocciola", english: "Hazelnut Gelato", price: 190, veg: true, tags: ["gluten-free"], image: "images/placeholder-dolci.svg", description: "Two scoops, roasted hazelnut." },
      { name: "Gelato al Limone", english: "Lemon Gelato", price: 180, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-dolci.svg", description: "Two scoops, bright Sicilian lemon." },
      { name: "Affogato", english: "Affogato", price: 210, veg: true, tags: ["gluten-free"], image: "images/placeholder-dolci.svg", description: "Vanilla gelato, drowned in hot espresso." },
      { name: "Cassata", english: "Cassata Siciliana", price: 240, veg: true, tags: [], image: "images/placeholder-dolci.svg", description: "Sponge cake, sweet ricotta, candied fruit." },
      { name: "Zabaglione", english: "Zabaglione", price: 220, veg: true, tags: ["gluten-free"], image: "images/placeholder-dolci.svg", description: "Whipped egg yolk, sugar, Marsala wine." },
      { name: "Biscotti", english: "Biscotti", price: 150, veg: true, tags: ["vegan"], image: "images/placeholder-dolci.svg", description: "Twice-baked almond biscuits, perfect with coffee." },
      { name: "Calzone alla Nutella", english: "Nutella Calzone", price: 230, veg: true, tags: [], image: "images/placeholder-dolci.svg", description: "Folded sweet dough, warm Nutella, powdered sugar." },
      { name: "Crostata al Limone", english: "Lemon Tart", price: 220, veg: true, tags: [], image: "images/placeholder-dolci.svg", description: "Buttery pastry shell, tangy lemon curd." },
    ],
  },
  {
    group: "Caffe",
    groupEnglish: "Coffee",
    items: [
      { name: "Espresso", english: "Espresso", price: 100, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-coffee.svg", description: "Short, strong, classic." },
      { name: "Cappuccino", english: "Cappuccino", price: 140, veg: true, tags: ["gluten-free"], image: "images/placeholder-coffee.svg", description: "Espresso, steamed milk, a cap of foam.", bestSeller: true },
      { name: "Latte Macchiato", english: "Latte Macchiato", price: 150, veg: true, tags: ["gluten-free"], image: "images/placeholder-coffee.svg", description: "Steamed milk marked with a shot of espresso." },
      { name: "Macchiato", english: "Macchiato", price: 110, veg: true, tags: ["gluten-free"], image: "images/placeholder-coffee.svg", description: "Espresso, a dash of foamed milk." },
      { name: "Mocha", english: "Mocha", price: 170, veg: true, tags: ["gluten-free"], image: "images/placeholder-coffee.svg", description: "Espresso, chocolate, steamed milk." },
      { name: "Ristretto", english: "Ristretto", price: 110, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-coffee.svg", description: "A short, concentrated shot of espresso." },
    ],
  },
  {
    group: "Bevande",
    groupEnglish: "Drinks",
    items: [
      { name: "Limonata", english: "Lemonade", price: 130, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Fresh-squeezed, lightly sparkling." },
      { name: "Aranciata", english: "Orange Soda", price: 130, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Classic Italian orange soda." },
      { name: "San Pellegrino", english: "Sparkling Water", price: 150, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Natural Italian sparkling mineral water." },
      { name: "Soda Italiana", english: "Italian Soda", price: 140, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Flavoured syrup, soda water, your choice of flavour." },
      { name: "Te Freddo", english: "Iced Tea", price: 130, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Chilled black tea, a hint of lemon." },
      { name: "Spritzer di Frutta", english: "Fruit Spritzer", price: 160, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Fresh fruit, sparkling water, mint." },
      { name: "Virgin Spritz", english: "Virgin Spritz", price: 180, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Orange, soda, bitters — all the colour, none of the alcohol." },
      { name: "Virgin Mojito", english: "Virgin Mojito", price: 170, veg: true, tags: ["vegan", "gluten-free"], image: "images/placeholder-drinks.svg", description: "Mint, lime, soda, muddled fresh." },
    ],
  },
];
