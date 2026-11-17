// MENU DATA — edit prices, names or dishes only in this file.
// veg: true = green dot, false = red dot.

export const RESTAURANT_NAME = "Masala Lane";

export const MENU = [
  {
    group: "Starters",
    items: [
      {
        name: "Paneer Tikka",
        price: 220,
        veg: true,
        description: "Smoky grilled paneer marinated in spiced yogurt.",
      },
      {
        name: "Veg Samosa (2 pcs)",
        price: 60,
        veg: true,
        description: "Crisp pastry parcels filled with spiced potatoes and peas.",
      },
      {
        name: "Hara Bhara Kebab",
        price: 200,
        veg: true,
        description: "Pan-seared spinach and pea patties with a hint of ginger.",
      },
      {
        name: "Crispy Corn",
        price: 180,
        veg: true,
        description: "Golden fried corn tossed in a tangy chilli-garlic seasoning.",
      },
      {
        name: "Dahi Ke Kebab",
        price: 210,
        veg: true,
        description: "Creamy hung-curd kebabs, lightly spiced and fried to a crisp shell.",
      },
    ],
  },
  {
    group: "Mains",
    items: [
      {
        name: "Paneer Butter Masala",
        price: 260,
        veg: true,
        description: "Soft paneer cubes in a rich, buttery tomato gravy.",
      },
      {
        name: "Dal Tadka",
        price: 180,
        veg: true,
        description: "Yellow lentils simmered and finished with a sizzling ghee tempering.",
      },
      {
        name: "Veg Biryani",
        price: 240,
        veg: true,
        description: "Fragrant basmati rice layered with spiced mixed vegetables.",
      },
      {
        name: "Palak Paneer",
        price: 270,
        veg: true,
        description: "Paneer simmered in a silky, mildly spiced spinach gravy.",
      },
      {
        name: "Chole Masala",
        price: 200,
        veg: true,
        description: "Chickpeas slow-cooked in a tangy, deeply spiced onion-tomato sauce.",
      },
      {
        name: "Kadai Paneer",
        price: 280,
        veg: true,
        description: "Paneer and peppers tossed in a bold, freshly ground kadai masala.",
      },
      {
        name: "Malai Kofta",
        price: 270,
        veg: true,
        description: "Delicate paneer-potato dumplings in a creamy, mildly sweet gravy.",
      },
      {
        name: "Dal Makhani",
        price: 230,
        veg: true,
        description: "Black lentils slow-simmered overnight with butter and cream.",
      },
    ],
  },
  {
    group: "Breads",
    items: [
      {
        name: "Butter Naan",
        price: 50,
        veg: true,
        description: "Soft tandoor-baked bread brushed with melted butter.",
      },
      {
        name: "Tandoori Roti",
        price: 30,
        veg: true,
        description: "Whole-wheat flatbread baked fresh in the tandoor.",
      },
      {
        name: "Garlic Naan",
        price: 70,
        veg: true,
        description: "Pillowy naan topped with roasted garlic and coriander.",
      },
      {
        name: "Laccha Paratha",
        price: 60,
        veg: true,
        description: "Flaky, layered flatbread griddled until golden.",
      },
    ],
  },
  {
    group: "Drinks",
    items: [
      {
        name: "Masala Chai",
        price: 30,
        veg: true,
        description: "Strong spiced tea brewed with milk and warming spices.",
      },
      {
        name: "Sweet Lassi",
        price: 80,
        veg: true,
        description: "Thick, chilled yogurt drink lightly sweetened.",
      },
      {
        name: "Mango Lassi",
        price: 90,
        veg: true,
        description: "Creamy yogurt blended with ripe mango pulp.",
      },
      {
        name: "Jaljeera",
        price: 50,
        veg: true,
        description: "A zesty, cooling cumin-mint cooler.",
      },
    ],
  },
  {
    group: "Desserts",
    items: [
      {
        name: "Gulab Jamun (2 pcs)",
        price: 70,
        veg: true,
        description: "Warm milk dumplings soaked in rose-scented sugar syrup.",
      },
      {
        name: "Rasmalai (2 pcs)",
        price: 90,
        veg: true,
        description: "Soft paneer discs served chilled in sweetened, cardamom milk.",
      },
      {
        name: "Gajar Halwa",
        price: 100,
        veg: true,
        description: "Slow-cooked grated carrots simmered in sweetened milk and ghee.",
      },
      {
        name: "Kulfi",
        price: 80,
        veg: true,
        description: "Dense, creamy frozen dessert with a hint of cardamom.",
      },
      {
        name: "Rasgulla (2 pcs)",
        price: 60,
        veg: true,
        description: "Spongy cottage-cheese balls in light sugar syrup.",
      },
      {
        name: "Moong Dal Halwa",
        price: 110,
        veg: true,
        description: "Rich, slow-roasted lentil halwa finished with nuts and ghee.",
      },
      {
        name: "Shahi Tukda",
        price: 120,
        veg: true,
        description: "Fried bread soaked in saffron milk and topped with nuts.",
      },
    ],
  },
];

export function findDish(name) {
  for (const section of MENU) {
    const dish = section.items.find((d) => d.name === name);
    if (dish) return dish;
  }
  return null;
}
