// MENU DATA — edit prices, names or dishes only in this file.
// veg: true = green dot, false = red dot.

export const RESTAURANT_NAME = "Masala Lane";

export const MENU = [
  {
    group: "Starters",
    items: [
      { name: "Paneer Tikka", price: 220, veg: true },
      { name: "Veg Samosa (2 pcs)", price: 60, veg: true },
      { name: "Hara Bhara Kebab", price: 200, veg: true },
      { name: "Crispy Corn", price: 180, veg: true },
      { name: "Dahi Ke Kebab", price: 210, veg: true },
    ],
  },
  {
    group: "Mains",
    items: [
      { name: "Paneer Butter Masala", price: 260, veg: true },
      { name: "Dal Tadka", price: 180, veg: true },
      { name: "Veg Biryani", price: 240, veg: true },
      { name: "Palak Paneer", price: 270, veg: true },
      { name: "Chole Masala", price: 200, veg: true },
      { name: "Kadai Paneer", price: 280, veg: true },
      { name: "Malai Kofta", price: 270, veg: true },
      { name: "Dal Makhani", price: 230, veg: true },
    ],
  },
  {
    group: "Breads",
    items: [
      { name: "Butter Naan", price: 50, veg: true },
      { name: "Tandoori Roti", price: 30, veg: true },
      { name: "Garlic Naan", price: 70, veg: true },
      { name: "Laccha Paratha", price: 60, veg: true },
    ],
  },
  {
    group: "Drinks",
    items: [
      { name: "Masala Chai", price: 30, veg: true },
      { name: "Sweet Lassi", price: 80, veg: true },
      { name: "Mango Lassi", price: 90, veg: true },
      { name: "Jaljeera", price: 50, veg: true },
    ],
  },
  {
    group: "Desserts",
    items: [
      { name: "Gulab Jamun (2 pcs)", price: 70, veg: true },
      { name: "Rasmalai (2 pcs)", price: 90, veg: true },
      { name: "Gajar Halwa", price: 100, veg: true },
      { name: "Kulfi", price: 80, veg: true },
      { name: "Rasgulla (2 pcs)", price: 60, veg: true },
      { name: "Moong Dal Halwa", price: 110, veg: true },
      { name: "Shahi Tukda", price: 120, veg: true },
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
