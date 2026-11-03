export interface ShapeInfo {
  id: string;
  name: string;
  image: string;
  description: string;
  areaFormula: string;
  perimeterFormula: string;
  properties: string[];
  exampleData: {
    labelA: string;
    labelB: string;
    labelC?: string;
    defaultA: number;
    defaultB: number;
    defaultC?: number;
    calcArea: (a: number, b: number, c?: number) => number;
  };
}

export const GEOMETRY_SHAPES: ShapeInfo[] = [
  {
    id: 'right_triangle',
    name: 'Segitiga Siku-Siku',
    image: '/assets/geometry/shape_right_triangle.png',
    description: 'Segitiga yang salah satu sudutnya tepat 90° (siku-siku). Merupakan fondasi mutlak Teorema Pythagoras di mana c² = a² + b².',
    areaFormula: 'L = ½ × alas × tinggi',
    perimeterFormula: 'K = a + b + c',
    properties: [
      'Memiliki satu sudut 90° tepat di antara sisi alas dan sisi tegak.',
      'Sisi terpanjang disebut hipotenusa (sisi miring) yang selalu menghadap sudut 90°.',
      'Memenuhi tripel Pythagoras seperti (3, 4, 5), (5, 12, 13), (6, 8, 10).',
    ],
    exampleData: {
      labelA: 'Alas (a) cm',
      labelB: 'Tinggi (b) cm',
      labelC: 'Hipotenusa (c)',
      defaultA: 3,
      defaultB: 4,
      defaultC: 5,
      calcArea: (a, b) => 0.5 * a * b,
    },
  },
  {
    id: 'square',
    name: 'Persegi (Bujur Sangkar)',
    image: '/assets/geometry/shape_square.png',
    description: 'Bentuk segi empat beraturan dengan empat sisi sama panjang dan empat sudut siku-siku 90°. Mewakili luas kuadrat a², b², dan c² dalam Pythagoras.',
    areaFormula: 'L = sisi × sisi = s²',
    perimeterFormula: 'K = 4 × sisi',
    properties: [
      'Keempat sisinya memiliki panjang yang sama (kongruen).',
      'Keempat sudutnya bernilai 90°.',
      'Dua diagonalnya saling berpotongan tegak lurus dan sama panjang.',
    ],
    exampleData: {
      labelA: 'Sisi (s) cm',
      labelB: 'Pengali Kuadrat',
      defaultA: 3,
      defaultB: 1,
      calcArea: (s) => s * s,
    },
  },
  {
    id: 'rectangle',
    name: 'Persegi Panjang',
    image: '/assets/geometry/shape_rectangle.png',
    description: 'Bangun datar segi empat yang dibentuk oleh dua pasang sisi yang masing-masing sama panjang dan sejajar dengan sudut 90°.',
    areaFormula: 'L = panjang × lebar',
    perimeterFormula: 'K = 2 × (panjang + lebar)',
    properties: [
      'Sisi-sisi yang berhadapan sama panjang dan sejajar.',
      'Memiliki 4 sudut siku-siku bernilai 90°.',
      'Diagonalnya membagi persegi panjang menjadi dua segitiga siku-siku kongruen.',
    ],
    exampleData: {
      labelA: 'Panjang (p) cm',
      labelB: 'Lebar (l) cm',
      defaultA: 4,
      defaultB: 3,
      calcArea: (p, l) => p * l,
    },
  },
  {
    id: 'isosceles_triangle',
    name: 'Segitiga Sama Kaki',
    image: '/assets/geometry/shape_isosceles_triangle.png',
    description: 'Segitiga yang memiliki dua sisi sama panjang dan dua sudut alas yang besarnya sama. Sering dibagi menjadi dua segitiga siku-siku simetris.',
    areaFormula: 'L = ½ × alas × tinggi',
    perimeterFormula: 'K = alas + 2 × sisi kaki',
    properties: [
      'Memiliki 2 sisi kaki yang sama panjang.',
      'Garis tinggi dari puncak membagi alas menjadi 2 bagian sama panjang secara tegak lurus.',
      'Dapat dihitung tingginya menggunakan Pythagoras: t² = kaki² - (½alas)².',
    ],
    exampleData: {
      labelA: 'Alas (a) cm',
      labelB: 'Tinggi (t) cm',
      defaultA: 6,
      defaultB: 4,
      calcArea: (a, t) => 0.5 * a * t,
    },
  },
  {
    id: 'trapezoid',
    name: 'Trapesium',
    image: '/assets/geometry/shape_trapezoid.png',
    description: 'Bangun datar segi empat yang memiliki tepat sepasang sisi yang sejajar. Dipakai oleh Presiden James A. Garfield (1876) dalam pembuktian elegan Pythagoras.',
    areaFormula: 'L = ½ × (sisi sejajar a + sisi sejajar b) × tinggi',
    perimeterFormula: 'K = jumlah seluruh sisi',
    properties: [
      'Memiliki sepasang sisi berhadapan yang sejajar namun tidak sama panjang.',
      'Trapesium siku-siku memiliki dua sudut 90° berurutan.',
      'Bisa didekomposisi menjadi dua segitiga siku-siku dan satu persegi panjang.',
    ],
    exampleData: {
      labelA: 'Sisi Atas (a) cm',
      labelB: 'Sisi Bawah (b) cm',
      labelC: 'Tinggi (t) cm',
      defaultA: 4,
      defaultB: 8,
      defaultC: 3,
      calcArea: (a, b, t = 3) => 0.5 * (a + b) * t,
    },
  },
  {
    id: 'parallelogram',
    name: 'Jajargenjang',
    image: '/assets/geometry/shape_parallelogram.png',
    description: 'Segi empat yang dibentuk oleh dua pasang rusuk yang masing-masing sama panjang dan sejajar. Kunci pembuktian kincir angin Euclid melalui prinsip geser Cavalieri.',
    areaFormula: 'L = alas × tinggi',
    perimeterFormula: 'K = 2 × (sisi a + sisi b)',
    properties: [
      'Sisi-sisi berhadapan sejajar dan sama panjang.',
      'Sudut-sudut yang berhadapan sama besar.',
      'Luasnya tetap sama dengan persegi panjang yang memiliki alas dan tinggi yang identik.',
    ],
    exampleData: {
      labelA: 'Alas (a) cm',
      labelB: 'Tinggi (t) cm',
      defaultA: 5,
      defaultB: 3,
      calcArea: (a, t) => a * t,
    },
  },
];
