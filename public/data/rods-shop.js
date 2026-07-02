/** Удочки в магазине */
const CUSTOM_RODS = [
  {
    id: 'rod_0',
    name: 'Бамбуковая',
    iconKey: 'rod-bamboo',
    level: 1,
    price: 0,
    currency: 'silver',
    bonus: 0,
    rodTier: 1,
    tensionControl: 0,
    stability: 0,
    largeFishHelp: 0,
  },
  {
    id: 'rod_spark',
    name: 'Spark 2000',
    iconKey: 'rod-spark',
    level: 1,
    price: 200,
    currency: 'silver',
    bonus: 0.06,
    rodTier: 2,
    tensionControl: 0.14,
    stability: 0.12,
    largeFishHelp: 0.22,
  },
];

if (typeof SHOP !== 'undefined') {
  SHOP.rods = CUSTOM_RODS;
}
