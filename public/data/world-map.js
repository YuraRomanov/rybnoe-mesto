/** Карта мира — точки перехода на локации */
const WORLD_MAP = {
  id: 'main',
  title: 'Большая Вода',
  image: 'assets/locations/world-map.png?v=1',
};

const MAP_LOCATIONS = [
  {
    id: '0',
    name: 'Левый берег',
    description: 'Тихий берег у соснового леса. Плотва, карась, окунь и другая местная рыба.',
    region: WORLD_MAP.title,
    level: 1,
    x: 23,
    y: 52,
    sceneBg: 'assets/locations/lake.png',
    fishIds: FOREST_LAKE.fishIds,
    fishVer: FOREST_LAKE.fishVer,
    initEnabled: true,
  },
  {
    id: '1',
    name: 'Камыши',
    description: 'Мелководье с густыми камышами и чистой водой у каменистого берега.',
    region: WORLD_MAP.title,
    level: 1,
    x: 40,
    y: 14,
    sceneBg: 'assets/locations/kamyshi.png',
    fishIds: FOREST_LAKE.fishIds,
    fishVer: FOREST_LAKE.fishVer,
  },
  {
    id: '2',
    name: 'На камнях',
    description: 'Каменистый берег с прозрачной водой и видом на хвойный лес напротив.',
    region: WORLD_MAP.title,
    level: 1,
    x: 72,
    y: 68,
    sceneBg: 'assets/locations/na-kamnyakh.png',
    fishIds: FOREST_LAKE.fishIds,
    fishVer: FOREST_LAKE.fishVer,
  },
];
