
// ─── Diet Plan Data: 4 Weeks × 7 Days (Day 7 = Cheat Day) ───────────────────
// Each meal item can have `alternatives` array with same-calorie swaps.

// ── Helpers ──────────────────────────────────────────────────────────────────
const meal = (name, cal, pro, fat, fib, carb, alts = []) => ({
  name, calories: cal, protein: pro, fat, fiber: fib, carbs: carb,
  alternatives: alts,
});
const alt = (name, cal, pro, fat, fib, carb) => ({ name, calories: cal, protein: pro, fat, fiber: fib, carbs: carb });

// ─────────────────────────────────────────────────────────────────────────────
// VEG PLANS
// ─────────────────────────────────────────────────────────────────────────────

const vegWeek1 = [
  // Day 1
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Oats with Banana & Honey', 320, 9, 5, 6, 58, [alt('Poha with Peas', 310, 8, 5, 5, 57)]),
      meal('Greek Yogurt (low-fat)', 100, 10, 1, 0, 14, [alt('Soy Milk (1 cup)', 100, 7, 4, 1, 10)]),
      meal('Green Tea', 5, 0, 0, 0, 1),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍎', items: [
      meal('Apple + Almonds (10)', 200, 5, 10, 5, 25, [alt('Pear + Walnuts (5)', 195, 4, 10, 5, 24)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Brown Rice (1 cup)', 215, 5, 2, 4, 45, [alt('Quinoa (1 cup)', 220, 8, 4, 5, 40)]),
      meal('Dal (Lentil Curry)', 150, 11, 4, 8, 20, [alt('Chole (Chickpea Curry)', 145, 9, 4, 9, 20)]),
      meal('Paneer Bhurji (100g)', 265, 18, 20, 1, 4, [alt('Tofu Scramble (120g)', 260, 18, 18, 2, 5)]),
      meal('Mixed Veg Salad', 60, 2, 1, 4, 12),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Roasted Chana (1 cup)', 160, 9, 3, 6, 27, [alt('Makhana (Fox Nuts, 30g)', 155, 5, 1, 0, 33)]),
      meal('Coconut Water', 45, 2, 0, 3, 9, [alt('Buttermilk (1 glass)', 45, 3, 1, 0, 6)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('2 Whole Wheat Rotis', 200, 7, 2, 5, 40, [alt('2 Bajra Rotis', 195, 6, 2, 5, 39)]),
      meal('Palak Tofu Curry', 180, 15, 10, 5, 10, [alt('Palak Paneer (same portion)', 185, 14, 12, 5, 9)]),
      meal('Raita (low-fat curd)', 70, 4, 2, 1, 8),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk (skim)', 80, 4, 1, 0, 12, [alt('Chamomile Tea + 5 Almonds', 80, 3, 7, 1, 4)]),
    ]},
  ],
  // Day 2
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Moong Dal Cheela (2)', 280, 14, 6, 4, 42, [alt('Besan Cheela (2)', 270, 13, 7, 3, 40)]),
      meal('Mint Chutney', 20, 1, 0, 1, 4),
      meal('Black Coffee / Green Tea', 5, 0, 0, 0, 1),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍎', items: [
      meal('Banana + Peanut Butter (1 tbsp)', 220, 6, 9, 3, 30, [alt('Dates (4) + Walnuts (5)', 215, 3, 7, 3, 35)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Vegetable Pulao (1.5 cups)', 310, 8, 7, 6, 56, [alt('Jeera Rice + Dal Fry', 310, 10, 6, 5, 55)]),
      meal('Raita', 70, 4, 2, 1, 8),
      meal('Papad (roasted)', 35, 2, 1, 1, 6),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Sprouts Salad (chaat style)', 170, 10, 2, 7, 28, [alt('Boiled Corn (1 cup)', 170, 5, 2, 4, 36)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Rajma (kidney beans) Curry', 230, 14, 4, 10, 38, [alt('Black Bean Curry', 225, 13, 4, 10, 37)]),
      meal('1 Wheat Roti + 1 cup Rice', 240, 8, 3, 5, 49),
      meal('Cucumber Raita', 60, 3, 1, 1, 7),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk', 80, 4, 1, 0, 12),
    ]},
  ],
  // Day 3
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Upma (1.5 cups)', 290, 8, 6, 4, 50, [alt('Dalia (broken wheat) Upma', 285, 9, 5, 5, 50)]),
      meal('Boiled Egg White (optional, veg skip)', 0, 0, 0, 0, 0, []),
      meal('Orange / Seasonal Fruit', 80, 1, 0, 3, 19),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍎', items: [
      meal('Mixed Nuts (30g)', 185, 5, 16, 2, 6, [alt('Trail Mix (seeds+nuts, 30g)', 180, 5, 14, 3, 10)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Sambar Rice (1.5 cups)', 330, 11, 4, 7, 62, [alt('Curd Rice (1.5 cups)', 310, 9, 5, 1, 55)]),
      meal('Stir-fry Cabbage Sabzi', 90, 3, 4, 4, 12),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Sweet Potato Chaat (medium)', 160, 3, 1, 4, 37, [alt('Baked Potato (medium)', 155, 4, 0, 3, 36)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('2 Multigrain Rotis', 210, 7, 3, 6, 40, [alt('2 Jowar Rotis', 200, 6, 2, 5, 40)]),
      meal('Mix Veg Curry (200g)', 180, 6, 8, 7, 24, [alt('Aloo Gobi Dry (200g)', 175, 5, 7, 6, 24)]),
      meal('Dal Tadka (1 bowl)', 150, 10, 4, 6, 20),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Ashwagandha Milk (skim)', 85, 4, 1, 0, 13, [alt('Hot Cacao (skim milk)', 90, 5, 1, 1, 14)]),
    ]},
  ],
  // Day 4
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Masala Dosa (1) + Sambar', 320, 9, 6, 5, 58, [alt('Rava Idli (2) + Chutney', 310, 8, 5, 3, 57)]),
      meal('Coconut Chutney', 60, 1, 5, 2, 4),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍎', items: [
      meal('Watermelon + Seeds (200g)', 80, 2, 1, 1, 18, [alt('Papaya (200g)', 78, 1, 0, 3, 20)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Quinoa Bowl (1 cup)', 220, 8, 4, 5, 40, [alt('Foxtail Millet (1 cup)', 215, 7, 2, 5, 42)]),
      meal('Paneer Tikka (100g)', 250, 17, 19, 1, 5, [alt('Tofu Tikka (120g)', 245, 16, 17, 2, 6)]),
      meal('Green Salad + Lemon Dressing', 55, 2, 2, 3, 7),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Hummus (3 tbsp) + Carrot Sticks', 165, 6, 8, 5, 19, [alt('Guacamole (3 tbsp) + Cucumber', 160, 2, 13, 5, 9)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('2 Rotis + Chana Masala', 350, 16, 7, 11, 58, [alt('2 Rotis + Mutter Paneer', 355, 17, 10, 7, 50)]),
      meal('Buttermilk (1 glass)', 45, 3, 1, 0, 6),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk', 80, 4, 1, 0, 12),
    ]},
  ],
  // Day 5
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Avocado Toast (2 slices WW bread)', 310, 9, 15, 8, 36, [alt('Peanut Butter Toast (2 slices)', 305, 11, 14, 5, 34)]),
      meal('Mixed Berries (½ cup)', 40, 1, 0, 3, 9),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍎', items: [
      meal('Chia Pudding (150g)', 180, 6, 9, 10, 18, [alt('Flaxseed Smoothie (small)', 175, 5, 8, 8, 20)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Matar Pulao (1.5 cups)', 300, 10, 5, 7, 54, [alt('Veg Fried Rice (1.5 cups)', 295, 7, 6, 4, 54)]),
      meal('Dahi (plain curd, 1 bowl)', 120, 8, 5, 0, 10, [alt('Chaas (spiced buttermilk)', 60, 3, 2, 0, 6)]),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Masala Corn (boiled, 1 cup)', 170, 5, 3, 4, 32, [alt('Baked Chickpeas (30g)', 165, 8, 3, 6, 27)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Soya Chunk Curry (150g)', 230, 22, 5, 5, 26, [alt('Egg Curry (3 eggs, veg-friendly skip)', 240, 18, 16, 1, 6)]),
      meal('2 Wheat Rotis', 200, 7, 2, 5, 40),
      meal('Sautéed Spinach', 70, 4, 3, 4, 7),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk', 80, 4, 1, 0, 12),
    ]},
  ],
  // Day 6
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Smoothie Bowl (banana+spinach+milk)', 300, 11, 6, 7, 52, [alt('Green Smoothie (large)', 295, 9, 5, 7, 52)]),
      meal('Granola (2 tbsp, topping)', 80, 2, 3, 1, 12),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍎', items: [
      meal('Handful of Cashews + 1 Kiwi', 200, 5, 13, 3, 19, [alt('Pistachios (20g) + Orange', 195, 5, 11, 4, 21)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Palak Dal (1 bowl) + Rice (1 cup)', 360, 17, 5, 10, 62, [alt('Methi Dal + Roti (2)', 355, 16, 5, 10, 60)]),
      meal('Kachumber Salad', 50, 2, 1, 3, 9),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Protein Ladoo (1, homemade, dates+nuts)', 165, 5, 8, 3, 23, [alt('Energy Bar (store-bought, 40g)', 160, 5, 7, 2, 22)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Stuffed Paratha (2, aloo/mooli)', 320, 8, 10, 5, 52, [alt('Thepla (2) + Dahi', 310, 9, 9, 5, 50)]),
      meal('Pickle (small)', 15, 0, 1, 0, 2),
      meal('Dahi (1 bowl)', 120, 8, 5, 0, 10),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk', 80, 4, 1, 0, 12),
    ]},
  ],
  // Day 7 – CHEAT DAY 🎉
  [
    { meal: 'Brunch', time: '10:00 – 11:30 AM', icon: '🎉', items: [
      meal('Chole Bhature (2 puri + sabzi)', 650, 20, 25, 12, 88),
      meal('Lassi (full-fat, 1 glass)', 230, 8, 9, 0, 30),
    ]},
    { meal: 'Afternoon Treat', time: '3:00 PM', icon: '🍕', items: [
      meal('Margherita Pizza (2 slices)', 450, 18, 16, 3, 60),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Paneer Butter Masala + Naan (2)', 600, 25, 28, 6, 65),
      meal('Gulab Jamun (2)', 200, 3, 6, 0, 34),
    ]},
  ],
];

// Weeks 2-4 veg — rotate with slight variations
const vegWeek2 = vegWeek1.map((day, di) => {
  if (di === 6) return day; // cheat day same
  return day.map(slot => ({
    ...slot,
    items: slot.items.map(item => ({
      ...item,
      // On week 2 we rotate: swap main item with its first alternative if exists
      ...(item.alternatives && item.alternatives.length > 0 ? {
        name: item.alternatives[0].name,
        calories: item.alternatives[0].calories,
        protein: item.alternatives[0].protein,
        fat: item.alternatives[0].fat,
        fiber: item.alternatives[0].fiber,
        carbs: item.alternatives[0].carbs,
        alternatives: [{ name: item.name, calories: item.calories, protein: item.protein, fat: item.fat, fiber: item.fiber, carbs: item.carbs }, ...item.alternatives.slice(1)],
      } : {}),
    })),
  }));
});

// Week 3 = same as week 1 (intentional repeat allowed per requirements)
const vegWeek3 = vegWeek1;

// Week 4 = same as week 2
const vegWeek4 = vegWeek2;

// ─────────────────────────────────────────────────────────────────────────────
// NON-VEG PLANS
// ─────────────────────────────────────────────────────────────────────────────

const nonVegWeek1 = [
  // Day 1
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Scrambled Eggs (3 whole)', 280, 21, 20, 0, 2, [alt('Omelette (3 eggs, cheese)', 285, 21, 21, 0, 2)]),
      meal('Whole Wheat Toast (2 slices)', 160, 6, 2, 4, 30, [alt('Multigrain Toast (2 slices)', 155, 6, 2, 4, 29)]),
      meal('Orange Juice (fresh)', 110, 2, 0, 1, 26),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍗', items: [
      meal('Chicken Salad (100g boiled)', 165, 31, 4, 2, 3, [alt('Tuna Salad (80g canned)', 160, 28, 4, 0, 2)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Grilled Chicken Breast (150g)', 250, 47, 5, 0, 0, [alt('Grilled Fish Fillet (150g)', 240, 40, 8, 0, 0)]),
      meal('Brown Rice (1 cup)', 215, 5, 2, 4, 45, [alt('Quinoa (1 cup)', 220, 8, 4, 5, 40)]),
      meal('Stir-fried Veg', 80, 3, 3, 5, 12),
      meal('Cucumber + Tomato Salad', 40, 1, 0, 2, 8),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Boiled Eggs (2)', 155, 13, 11, 0, 1, [alt('Egg Whites (4)', 70, 15, 0, 0, 1)]),
      meal('Black Coffee', 5, 0, 0, 0, 1),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Baked Salmon (150g)', 280, 40, 13, 0, 0, [alt('Grilled Prawn (150g)', 275, 36, 10, 0, 3)]),
      meal('Sweet Potato (medium)', 130, 2, 0, 4, 30, [alt('Baked Potato (medium)', 155, 4, 0, 3, 36)]),
      meal('Steamed Broccoli + Beans', 80, 5, 1, 7, 15),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Cottage Cheese (low-fat, 100g)', 100, 12, 3, 0, 4, [alt('Greek Yogurt (low-fat, 100g)', 100, 10, 1, 0, 14)]),
    ]},
  ],
  // Day 2
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Egg Bhurji (3 eggs) + 2 Toast', 380, 23, 20, 3, 30, [alt('Egg Sandwich (2 eggs, 2 bread)', 370, 20, 18, 3, 35)]),
      meal('Black Coffee', 5, 0, 0, 0, 1),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍗', items: [
      meal('Protein Shake + Banana', 280, 25, 3, 3, 40, [alt('Greek Yogurt + Fruit', 200, 15, 3, 3, 30)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Chicken Curry (150g)', 290, 35, 13, 2, 10, [alt('Mutton Keema (120g)', 295, 30, 18, 1, 5)]),
      meal('2 Wheat Rotis', 200, 7, 2, 5, 40),
      meal('Green Salad', 45, 2, 1, 3, 7),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Almonds (20) + Apple', 220, 6, 14, 5, 22, [alt('Cashews (15) + Pear', 215, 5, 13, 4, 24)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Grilled Chicken Thigh (120g)', 240, 32, 12, 0, 0, [alt('Grilled Turkey Breast (120g)', 230, 35, 8, 0, 0)]),
      meal('Roasted Veggies (200g)', 110, 3, 5, 6, 14),
      meal('Brown Rice (3/4 cup)', 160, 4, 1, 3, 34),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk (skim)', 80, 4, 1, 0, 12),
    ]},
  ],
  // Day 3
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Oats + Whey Protein (1 scoop)', 320, 30, 5, 5, 38, [alt('High-protein Overnight Oats', 315, 25, 7, 6, 38)]),
      meal('Black Coffee', 5, 0, 0, 0, 1),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍗', items: [
      meal('Hard-boiled Eggs (2) + Carrots', 180, 13, 11, 3, 8, [alt('Egg Muffin (2)', 175, 13, 11, 1, 5)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Tuna Sandwich (WW bread, 2 slices)', 350, 30, 8, 5, 40, [alt('Chicken Wrap (1 whole wheat)', 345, 32, 7, 4, 38)]),
      meal('Tomato Soup (1 bowl)', 90, 3, 2, 3, 15),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Mixed Nuts + Protein Bar (half)', 200, 10, 12, 3, 16, [alt('Roasted Chana + Cheese Cube', 195, 12, 10, 5, 16)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Egg Curry (3 eggs)', 310, 19, 20, 2, 14, [alt('Fish Curry (150g)', 305, 35, 14, 1, 8)]),
      meal('2 Wheat Rotis', 200, 7, 2, 5, 40),
      meal('Raita', 70, 4, 2, 1, 8),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Cottage Cheese (100g)', 100, 12, 3, 0, 4),
    ]},
  ],
  // Day 4
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Chicken Keema Paratha (2)', 420, 28, 16, 4, 46, [alt('Egg Paratha (2)', 400, 20, 17, 4, 45)]),
      meal('Dahi (1 bowl)', 120, 8, 5, 0, 10),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍗', items: [
      meal('Greek Yogurt (150g) + Almonds', 195, 14, 10, 2, 14, [alt('Kefir (200ml) + Walnuts', 190, 10, 12, 1, 14)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Grilled Prawn (200g)', 200, 38, 3, 0, 2, [alt('Grilled Squid (200g)', 195, 34, 3, 0, 5)]),
      meal('Brown Rice (1 cup)', 215, 5, 2, 4, 45),
      meal('Stir-fried Bok Choy', 55, 3, 2, 3, 6),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Boiled Egg + Hummus + Pita', 270, 16, 12, 5, 28, [alt('Deviled Eggs (2) + Carrot Sticks', 265, 14, 14, 3, 14)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Grilled Chicken Breast (180g)', 300, 56, 6, 0, 0, [alt('Baked Cod Fillet (180g)', 295, 50, 7, 0, 0)]),
      meal('Sweet Potato Mash (medium)', 130, 2, 0, 4, 30),
      meal('Garden Salad', 50, 2, 2, 3, 7),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk', 80, 4, 1, 0, 12),
    ]},
  ],
  // Day 5
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('French Toast (2 slices WW) + Eggs', 350, 18, 14, 3, 40, [alt('Pancakes (2) + Egg White Omelette', 340, 17, 12, 2, 44)]),
      meal('Mixed Fruit (small bowl)', 90, 1, 0, 3, 22),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍗', items: [
      meal('Chicken Soup (1 bowl)', 120, 15, 4, 1, 7, [alt('Bone Broth (1 cup)', 50, 10, 1, 0, 3)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Chicken Biryani (1 plate, 200g)', 420, 30, 12, 3, 54, [alt('Mutton Biryani (1 plate)', 435, 28, 16, 2, 54)]),
      meal('Raita (boondi)', 90, 4, 3, 1, 12),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Roasted Chana (30g) + Boiled Egg', 225, 18, 7, 6, 24, [alt('Protein Bar (branded, 40g)', 180, 15, 6, 2, 20)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Baked Salmon (120g)', 224, 32, 10, 0, 0, [alt('Pan-seared Tuna (120g)', 220, 33, 9, 0, 0)]),
      meal('Asparagus + Bell Pepper (roasted)', 80, 4, 3, 5, 10, [alt('Zucchini + Broccoli roasted', 75, 4, 3, 6, 9)]),
      meal('Quinoa (3/4 cup)', 165, 6, 3, 4, 30),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Cottage Cheese (100g) + Cinnamon', 102, 12, 3, 0, 4),
    ]},
  ],
  // Day 6
  [
    { meal: 'Breakfast', time: '7:00 – 8:00 AM', icon: '🌅', items: [
      meal('Smoked Salmon Bagel (half whole wheat)', 310, 22, 8, 2, 38, [alt('Egg & Avocado Toast (2 slices)', 305, 18, 15, 6, 28)]),
      meal('Orange Juice (fresh)', 110, 2, 0, 1, 26),
    ]},
    { meal: 'Mid-Morning Snack', time: '10:30 AM', icon: '🍗', items: [
      meal('Protein Shake (1 scoop water)', 120, 24, 1, 0, 5, [alt('Egg White Omelette (3 whites)', 100, 20, 1, 0, 2)]),
    ]},
    { meal: 'Lunch', time: '1:00 – 2:00 PM', icon: '☀️', items: [
      meal('Chicken Fried Rice (1.5 cup light oil)', 390, 28, 10, 3, 49, [alt('Egg Fried Rice (1.5 cup)', 380, 18, 12, 2, 54)]),
      meal('Chicken Manchurian (dry, 80g)', 150, 14, 7, 1, 10),
    ]},
    { meal: 'Evening Snack', time: '4:30 PM', icon: '🌤️', items: [
      meal('Boiled Peanuts (30g) + Coconut Water', 195, 8, 11, 3, 18, [alt('Mixed Nuts (30g) + Lime Water', 185, 5, 16, 2, 8)]),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Mutton Roghan Josh (100g)', 250, 20, 17, 1, 5, [alt('Chicken Rara (100g)', 240, 23, 14, 1, 6)]),
      meal('2 Roomali Rotis', 170, 5, 2, 2, 34),
      meal('Cucumber Raita', 60, 3, 1, 1, 7),
    ]},
    { meal: 'Pre-Sleep', time: '10:00 PM', icon: '🌛', items: [
      meal('Warm Turmeric Milk', 80, 4, 1, 0, 12),
    ]},
  ],
  // Day 7 - CHEAT DAY 🎉
  [
    { meal: 'Brunch', time: '10:00 – 11:30 AM', icon: '🎉', items: [
      meal('Butter Chicken + Naan (2)', 700, 40, 28, 3, 62),
      meal('Mango Lassi (1 glass)', 220, 6, 5, 2, 40),
    ]},
    { meal: 'Afternoon Treat', time: '3:00 PM', icon: '🍔', items: [
      meal('Loaded Burger (chicken/beef) + Fries', 650, 30, 28, 4, 70),
    ]},
    { meal: 'Dinner', time: '7:00 – 8:00 PM', icon: '🌙', items: [
      meal('Biryani (1.5 plates, non-veg)', 630, 35, 18, 4, 82),
      meal('Gulab Jamun (2)', 200, 3, 6, 0, 34),
    ]},
  ],
];

const nonVegWeek2 = nonVegWeek1.map((day, di) => {
  if (di === 6) return day;
  return day.map(slot => ({
    ...slot,
    items: slot.items.map(item => ({
      ...item,
      ...(item.alternatives && item.alternatives.length > 0 ? {
        name: item.alternatives[0].name,
        calories: item.alternatives[0].calories,
        protein: item.alternatives[0].protein,
        fat: item.alternatives[0].fat,
        fiber: item.alternatives[0].fiber,
        carbs: item.alternatives[0].carbs,
        alternatives: [{ name: item.name, calories: item.calories, protein: item.protein, fat: item.fat, fiber: item.fiber, carbs: item.carbs }, ...item.alternatives.slice(1)],
      } : {}),
    })),
  }));
});

const nonVegWeek3 = nonVegWeek1;
const nonVegWeek4 = nonVegWeek2;

// ─── Exports ──────────────────────────────────────────────────────────────────
export const DIET_PLANS = {
  veg: [vegWeek1, vegWeek2, vegWeek3, vegWeek4],
  nonveg: [nonVegWeek1, nonVegWeek2, nonVegWeek3, nonVegWeek4],
};

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Build a mixed "both" diet plan from veg and non-veg templates.
 * @param {number[]} vegDays    - Day indices (0–5) for vegetarian days
 * @param {number[]} nonVegDays - Day indices (0–5) for non-veg days
 * @returns 4-week plan array (same shape as DIET_PLANS.veg / DIET_PLANS.nonveg)
 */
export function buildBothPlan(vegDays = [], nonVegDays = []) {
  const vegPlan    = [vegWeek1, vegWeek2, vegWeek3, vegWeek4];
  const nonVegPlan = [nonVegWeek1, nonVegWeek2, nonVegWeek3, nonVegWeek4];
  const vegSet     = new Set(vegDays);
  const nonVegSet  = new Set(nonVegDays);

  return vegPlan.map((vegWeek, weekIdx) => {
    const nonVegWeek = nonVegPlan[weekIdx];
    return vegWeek.map((dayData, dayIdx) => {
      if (dayIdx === 6) return dayData; // Day 7 = Cheat Day — always same (veg cheat day template)
      if (nonVegSet.has(dayIdx)) return nonVegWeek[dayIdx]; // Non-veg day
      if (vegSet.has(dayIdx))    return dayData;             // Veg day
      return dayData; // fallback to veg if day not assigned (shouldn't happen with valid input)
    });
  });
}
