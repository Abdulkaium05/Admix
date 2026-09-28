export type RadicalGroup = 'A' | 'B' | 'both';

export interface RadicalItem {
  id: string;
  nameBn: string;
  nameEn?: string;
  formula: string; // e.g., 'NH₄⁺', 'CO₃²⁻'
  valency: number; // 1, 2, 3, 4
  charge: string; // '+1', '-1', '-2', '-3', '-4', '+2', '+3'
  category: 'একযোজী (যোজনী ১)' | 'দ্বিযোজী (যোজনী ২)' | 'ত্রিযোজী (যোজনী ৩)' | 'চতুর্থযোজী (যোজনী ৪)' | 'জটিল আয়ন' | 'বিশেষ অ্যানায়ন';
  group: 'A' | 'B';
  note?: string;
}

export interface RadicalQuizQuestion {
  id: string;
  radicalId: string;
  questionText: string;
  radicalName: string;
  correctFormula: string;
  correctValency: number;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation: string;
  group: 'A' | 'B';
}

export type RadicalRecallDirection = 'name_to_formula' | 'formula_to_name' | 'mixed';

export interface RadicalRecallQuestion {
  id: string;
  radicalId: string;
  direction: 'name_to_formula' | 'formula_to_name';
  promptTitle: string;
  promptSubtitle: string;
  radicalName: string;
  formula: string;
  valency: number;
  charge: string;
  category: string;
  explanation: string;
  group: 'A' | 'B';
}

/**
 * All 49 Radicals and Ions transcribed directly from DUET Admission Preparation Sheet
 */
export const radicalsData: RadicalItem[] = [
  // =================== যোজনী ১ (একযোজী মূলক) ===================
  {
    id: "ammonium",
    group: "A",
    nameBn: 'অ্যামোনিয়াম',
    nameEn: 'Ammonium',
    formula: 'NH₄⁺',
    valency: 1,
    charge: '+1',
    category: 'একযোজী (যোজনী ১)',
    note: 'একমাত্র পরিচিত বহুল ব্যবহৃত ধনাত্মক যৌগমূলক (ক্যাটায়ন)',
  },
  {
    id: "phosphonium",
    group: "A",
    nameBn: 'ফসফোনিয়াম',
    nameEn: 'Phosphonium',
    formula: 'PH₄⁺',
    valency: 1,
    charge: '+1',
    category: 'একযোজী (যোজনী ১)',
    note: 'ধনাত্মক আয়ন (+১), যোজনী ১',
  },
  {
    id: "hydroxide",
    group: "A",
    nameBn: 'হাইড্রোক্সাইড',
    nameEn: 'Hydroxide',
    formula: 'OH⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'ক্ষারীয় যৌগের মূল ভিত্তি মূলক',
  },
  {
    id: "bicarbonate",
    group: "B",
    nameBn: 'বাই কার্বনেট',
    nameEn: 'Bicarbonate / Hydrogen Carbonate',
    formula: 'HCO₃⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'হাইড্রোজেন কার্বনেট নামেও পরিচিত',
  },
  {
    id: "bisulfite",
    group: "B",
    nameBn: 'বাই সালফাইট',
    nameEn: 'Bisulfite / Hydrogen Sulfite',
    formula: 'HSO₃⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'হাইড্রোজেন সালফাইট মূলক',
  },
  {
    id: "bisulfate",
    group: "B",
    nameBn: 'বাই সালফেট',
    nameEn: 'Bisulfate / Hydrogen Sulfate',
    formula: 'HSO₄⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'হাইড্রোজেন সালফেট মূলক',
  },
  {
    id: "cyanide",
    group: "A",
    nameBn: 'সায়ানাইড',
    nameEn: 'Cyanide',
    formula: 'CN⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'তীব্র বিষাক্ত যৌগের মূলক, যোজনী ১',
  },
  {
    id: "cyanate",
    group: "A",
    nameBn: 'সায়ানেট',
    nameEn: 'Cyanate',
    formula: 'CNO⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'সায়ানেট আয়ন, যোজনী ১',
  },
  {
    id: "thiocyanate",
    group: "A",
    nameBn: 'থায়োসায়ানেট',
    nameEn: 'Thiocyanate',
    formula: 'CNS⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'SCN⁻ বা CNS⁻ প্রতীক ব্যবহৃত হয়',
  },
  {
    id: "nitrite",
    group: "A",
    nameBn: 'নাইট্রাইট',
    nameEn: 'Nitrite',
    formula: 'NO₂⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'নাইট্রাইট মূলকে অক্সিজেনের পরমাণু ২টি',
  },
  {
    id: "nitrate",
    group: "A",
    nameBn: 'নাইট্রেট',
    nameEn: 'Nitrate',
    formula: 'NO₃⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'নাইট্রেট মূলকে অক্সিজেনের পরমাণু ৩টি',
  },
  {
    id: "hypochlorite",
    group: "A",
    nameBn: 'হাইপো-ক্লোরাইট',
    nameEn: 'Hypochlorite',
    formula: 'ClO⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'ব্লিচিং পাউডারের সক্রিয় অংশ',
  },
  {
    id: "chlorite",
    group: "A",
    nameBn: 'ক্লোরাইট',
    nameEn: 'Chlorite',
    formula: 'ClO₂⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'ক্লোরাইট মূলক (ClO₂⁻)',
  },
  {
    id: "chlorate",
    group: "A",
    nameBn: 'ক্লোরেট',
    nameEn: 'Chlorate',
    formula: 'ClO₃⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'পটাশিয়াম ক্লোরেট (KClO₃) এর মূলক',
  },
  {
    id: "perchlorate",
    group: "A",
    nameBn: 'পার-ক্লোরেট',
    nameEn: 'Perchlorate',
    formula: 'ClO₄⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'ক্লোরিনের সর্বোচ্চ জারণ অবস্থার অ্যানায়ন',
  },
  {
    id: "bromate",
    group: "A",
    nameBn: 'ব্রোমেট',
    nameEn: 'Bromate',
    formula: 'BrO₃⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'ব্রোমেট মূলক (BrO₃⁻)',
  },
  {
    id: "permanganate",
    group: "A",
    nameBn: 'পার-ম্যাঙ্গানেট',
    nameEn: 'Permanganate',
    formula: 'MnO₄⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'KMnO₄ যৌগে যোজনী ১ এবং গাঢ় বেগুনি বর্ণ',
  },
  {
    id: "iodate",
    group: "B",
    nameBn: 'আয়োডেট',
    nameEn: 'Iodate',
    formula: 'IO₃⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'আয়োডেট মূলক (IO₃⁻)',
  },
  {
    id: "aluminate",
    group: "A",
    nameBn: 'অ্যালুমিনেট',
    nameEn: 'Aluminate',
    formula: 'AlO₂⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'মেটাঅ্যালুমিনেট আয়ন (AlO₂⁻)',
  },
  {
    id: "acetate",
    group: "B",
    nameBn: 'অ্যাসিটেট',
    nameEn: 'Acetate',
    formula: 'CH₃COO⁻',
    valency: 1,
    charge: '-1',
    category: 'একযোজী (যোজনী ১)',
    note: 'ভিনেগার বা অ্যাসিটিক এসিডের মূলক',
  },
  {
    id: "hydronium",
    group: "B",
    nameBn: 'হাইড্রোনিয়াম',
    nameEn: 'Hydronium',
    formula: 'H₃O⁺',
    valency: 1,
    charge: '+1',
    category: 'একযোজী (যোজনী ১)',
    note: 'পানিতে অ্যাসিড দ্রবীভূত হলে উৎপন্ন ক্যাটায়ন',
  },

  // =================== যোজনী ২ (দ্বিযোজী মূলক) ===================
  {
    id: "carbonate",
    group: "A",
    nameBn: 'কার্বনেট',
    nameEn: 'Carbonate',
    formula: 'CO₃²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'দ্বিযোজী মূলক, চুনাপাথর ও সোডায় বিদ্যমান',
  },
  {
    id: "sulfite",
    group: "B",
    nameBn: 'সালফাইট',
    nameEn: 'Sulfite',
    formula: 'SO₃²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'সালফাইট মূলকে অক্সিজেনের পরমাণু ৩টি',
  },
  {
    id: "sulfate",
    group: "A",
    nameBn: 'সালফেট',
    nameEn: 'Sulfate',
    formula: 'SO₄²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'সালফেট মূলকে অক্সিজেনের পরমাণু ৪টি',
  },
  {
    id: "thiosulfate",
    group: "A",
    nameBn: 'থায়োসালফেট',
    nameEn: 'Thiosulfate',
    formula: 'S₂O₃²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'হাইপো বা ফটোগ্রাফিক ফিক্সার (Na₂S₂O₃)',
  },
  {
    id: "chromate",
    group: "A",
    nameBn: 'ক্রোমেট',
    nameEn: 'Chromate',
    formula: 'CrO₄²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'হলুদ বর্ণের ক্রোমেট মূলক',
  },
  {
    id: "dichromate",
    group: "A",
    nameBn: 'ডাই-ক্রোমেট',
    nameEn: 'Dichromate',
    formula: 'Cr₂O₇²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'কমলা বর্ণের তীব্র জারক মূলক (K₂Cr₂O₇)',
  },
  {
    id: "silicate",
    group: "A",
    nameBn: 'সিলিকেট',
    nameEn: 'Silicate',
    formula: 'SiO₃²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'মেটাসিলিকেট মূলক, গ্লাস ও সিরামিকের ভিত্তি',
  },
  {
    id: "manganate",
    group: "A",
    nameBn: 'ম্যাঙ্গানেট',
    nameEn: 'Manganate',
    formula: 'MnO₄²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'সবুজ বর্ণের ম্যাঙ্গানেট মূলক (যোজনী ২)',
  },
  {
    id: "stannite",
    group: "B",
    nameBn: 'স্টেনাইট',
    nameEn: 'Stannite',
    formula: 'SnO₂²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'টিনের (+২) জারণ অবস্থার অ্যানায়ন',
  },
  {
    id: "stannate",
    group: "B",
    nameBn: 'স্টেনেট',
    nameEn: 'Stannate',
    formula: 'SnO₃²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'টিনের (+৪) জারণ অবস্থার অ্যানায়ন',
  },
  {
    id: "zincate",
    group: "B",
    nameBn: 'জিংকেট',
    nameEn: 'Zincate',
    formula: 'ZnO₂²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'সোডিয়াম জিংকেট (Na₂ZnO₂)',
  },
  {
    id: "plumbite",
    group: "B",
    nameBn: 'প্লাম্বাইট',
    nameEn: 'Plumbite',
    formula: 'PbO₂²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'লেডের অ্যানায়ন মূলক',
  },
  {
    id: "biphosphate",
    group: "B",
    nameBn: 'বাই ফসফেট',
    nameEn: 'Biphosphate / Hydrogen Phosphate',
    formula: 'H₂PO₄²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'শীট অনুযায়ী সংকেত H₂PO₄²⁻, যোজনী ২',
  },
  {
    id: "oxalate",
    group: "B",
    nameBn: 'অক্সালেট',
    nameEn: 'Oxalate',
    formula: 'C₂O₄²⁻',
    valency: 2,
    charge: '-2',
    category: 'দ্বিযোজী (যোজনী ২)',
    note: 'অক্সালিক এসিডের মূলক (H₂C₂O₄)',
  },

  // =================== যোজনী ৩ (ত্রিযোজী মূলক) ===================
  {
    id: "phosphite",
    group: "B",
    nameBn: 'ফসফাইট',
    nameEn: 'Phosphite',
    formula: 'PO₃³⁻',
    valency: 3,
    charge: '-3',
    category: 'ত্রিযোজী (যোজনী ৩)',
    note: 'ফসফাইট মূলকে অক্সিজেনের পরমাণু ৩টি',
  },
  {
    id: "phosphate",
    group: "A",
    nameBn: 'ফসফেট',
    nameEn: 'Phosphate',
    formula: 'PO₄³⁻',
    valency: 3,
    charge: '-3',
    category: 'ত্রিযোজী (যোজনী ৩)',
    note: 'ফসফেট মূলকে অক্সিজেনের পরমাণু ৪টি',
  },
  {
    id: "arsenite",
    group: "B",
    nameBn: 'আর্সেনাইট',
    nameEn: 'Arsenite',
    formula: 'AsO₃³⁻',
    valency: 3,
    charge: '-3',
    category: 'ত্রিযোজী (যোজনী ৩)',
    note: 'আর্সেনাইট মূলক (AsO₃³⁻)',
  },
  {
    id: "arsenate",
    group: "B",
    nameBn: 'আর্সেনেট',
    nameEn: 'Arsenate',
    formula: 'AsO₄³⁻',
    valency: 3,
    charge: '-3',
    category: 'ত্রিযোজী (যোজনী ৩)',
    note: 'আর্সেনেট মূলক (AsO₄³⁻)',
  },
  {
    id: "borate",
    group: "A",
    nameBn: 'বোরেট',
    nameEn: 'Borate',
    formula: 'BO₃³⁻',
    valency: 3,
    charge: '-3',
    category: 'ত্রিযোজী (যোজনী ৩)',
    note: 'বোরিক এসিড ও বোরাক্সের ভিত্তি',
  },
  {
    id: "ferricyanide",
    group: "A",
    nameBn: 'ফেরিসায়ানাইড',
    nameEn: 'Ferricyanide / Hexacyanoferrate(III)',
    formula: '[Fe(CN)₆]³⁻',
    valency: 3,
    charge: '-3',
    category: 'ত্রিযোজী (যোজনী ৩)',
    note: 'আয়রনের (+৩) জারণ অবস্থার জটিল অ্যানায়ন',
  },

  // =================== যোজনী ৪ (চতুর্থযোজী মূলক) ===================
  {
    id: "ferrocyanide",
    group: "A",
    nameBn: 'ফেরোসায়ানাইড',
    nameEn: 'Ferrocyanide / Hexacyanoferrate(II)',
    formula: '[Fe(CN)₆]⁴⁻',
    valency: 4,
    charge: '-4',
    category: 'চতুর্থযোজী (যোজনী ৪)',
    note: 'আয়রনের (+২) জারণ অবস্থার জটিল অ্যানায়ন, যোজনী ৪',
  },

  // =================== জটিল আয়ন/মূলক ===================
  {
    id: "argenta_cyanide",
    group: "B",
    nameBn: 'আর্জেন্টা সায়ানাইড',
    nameEn: 'Dicyanoargentate',
    formula: '[Ag(CN)₂]⁻',
    valency: 1,
    charge: '-1',
    category: 'জটিল আয়ন',
    note: 'সিলভারের জটিল অ্যানায়ন, যোজনী ১',
  },
  {
    id: "tetraamine_cupric",
    group: "B",
    nameBn: 'টেট্রা অ্যামিন কিউপ্রিক',
    nameEn: 'Tetraamminecopper(II)',
    formula: '[Cu(NH₃)₄]²⁺',
    valency: 2,
    charge: '+2',
    category: 'জটিল আয়ন',
    note: 'গাঢ় নীল বর্ণের জটিল ক্যাটায়ন, যোজনী ২',
  },
  {
    id: "hexaamine_cobalt",
    group: "B",
    nameBn: 'হেক্সা অ্যামিন কোবাল্ট',
    nameEn: 'Hexaamminecobalt(III)',
    formula: '[Co(NH₃)₆]³⁺',
    valency: 3,
    charge: '+3',
    category: 'জটিল আয়ন',
    note: 'কোবাল্টের জটিল ক্যাটায়ন, যোজনী ৩',
  },

  // =================== বিশেষ অ্যানায়ন ===================
  {
    id: "carbide",
    group: "B",
    nameBn: 'কার্বাইড',
    nameEn: 'Carbide',
    formula: 'C',
    valency: 4,
    charge: '-4',
    category: 'বিশেষ অ্যানায়ন',
    note: 'কার্বাইডের যোজনী ৪',
  },
  {
    id: "nitride",
    group: "B",
    nameBn: 'নাইট্রাইড',
    nameEn: 'Nitride',
    formula: 'N',
    valency: 3,
    charge: '-3',
    category: 'বিশেষ অ্যানায়ন',
    note: 'নাইট্রাইডের যোজনী ৩',
  },
  {
    id: "phosphide",
    group: "A",
    nameBn: 'ফসফাইড',
    nameEn: 'Phosphide',
    formula: 'P',
    valency: 3,
    charge: '-3',
    category: 'বিশেষ অ্যানায়ন',
    note: 'ফসফাইডের যোজনী ৩',
  },
  {
    id: "sulfide",
    group: "A",
    nameBn: 'সালফাইড',
    nameEn: 'Sulfide',
    formula: 'S',
    valency: 2,
    charge: '-2',
    category: 'বিশেষ অ্যানায়ন',
    note: 'সালফাইডের যোজনী ২',
  },
];

/**
 * Theoretical Concepts from DUET Sheet
 */
export const radicalConcepts = {
  definition:
    'অনেক সময় দুই বা ততোধিক মৌলের একাধিক পরমাণু একত্রে সংযুক্ত হয়ে একটি গ্রুপ গঠন করে যা বিভিন্ন রাসায়নিক বিক্রিয়ায় অংশগ্রহণের সময় অপরিবর্তিত থেকে একটি মাত্র পরমাণুর ন্যায় আচরণ করে। সেসব গ্রুপকে যৌগমূলক (Radical) বলে।',
  chormoYojyota: {
    title: 'চরম যোজ্যতা (Maximum Valency)',
    rule: 'কোন মৌলের সর্বোচ্চ যোজনীকে উক্ত মৌলের চরম যোজনী বলে।',
    examples: [
      { element: 'নাইট্রোজেন (N)', maxValency: 5 },
      { element: 'সালফার (S)', maxValency: 6 },
      { element: 'কার্বন (C)', maxValency: 4 },
    ],
  },
  poromYojyota: {
    title: 'পরম বা বিষম যোজ্যতা (Fixed Valency)',
    rule: 'যে সব মৌলের একটি নির্দিষ্ট যোজনী আছে বা যাদের যোজনী পরিবর্তন করা যায় না তাদের যোজনীকে পরম বা বিষম যোজনী বলে।',
    examples: [
      { element: 'সোডিয়াম (Na)', valency: 1 },
      { element: 'পটাশিয়াম (K)', valency: 1 },
      { element: 'ক্যালসিয়াম (Ca)', valency: 2 },
      { element: 'জিংক (Zn)', valency: 2 },
    ],
  },
};

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Helper statistics for groups
 */
export const radicalsGroupStats = {
  total: radicalsData.length,
  groupA: radicalsData.filter((r) => r.group === 'A').length,
  groupB: radicalsData.filter((r) => r.group === 'B').length,
};

/**
 * Generates an MCQ Quiz for Radicals
 * Asks for formula & valency from Radical Name
 */
export function generateRadicalsQuiz(
  count: number = 15,
  filterCategory?: string,
  groupFilter: RadicalGroup = 'both'
): RadicalQuizQuestion[] {
  let source = radicalsData;
  if (groupFilter && groupFilter !== 'both') {
    source = source.filter((r) => r.group === groupFilter);
  }
  if (filterCategory && filterCategory !== 'সবগুলো') {
    source = source.filter((r) => r.category === filterCategory);
  }
  const validCount = Math.max(1, Math.min(source.length, count));
  const shuffled = shuffleArray(source);
  const selected = shuffled.slice(0, validCount);

  const allFormulas = radicalsData.map((r) => r.formula);

  return selected.map((item, index) => {
    // Pick 3 distractors
    const otherFormulas = Array.from(new Set(allFormulas.filter((f) => f !== item.formula)));
    const shuffledOthers = shuffleArray(otherFormulas);
    const distractors = shuffledOthers.slice(0, 3);

    const optionsWithTarget = [item.formula, ...distractors];
    const shuffledOptions = shuffleArray(optionsWithTarget) as [string, string, string, string];
    const correctIndex = shuffledOptions.indexOf(item.formula);

    const questionVariations = [
      `‘${item.nameBn}’ যৌগমূলকের সঠিক সংকেত কোনটি?`,
      `নিচের কোনটি ‘${item.nameBn}’ মূলকের সঠিক সংকেত?`,
      `‘${item.nameBn}’ (${item.category} • গ্রুপ ${item.group}) এর সংকেত ও চার্জ কী?`,
    ];
    const questionText = questionVariations[index % questionVariations.length];

    const noteText = item.note ? ` (${item.note})` : '';
    const explanation = `সঠিক উত্তর: ${item.formula}। ‘${item.nameBn}’ (গ্রুপ ${item.group}) এর যোজনী ${item.valency} এবং চার্জ ${item.charge}${noteText}।`;

    return {
      id: `rad_quiz_${item.id}_${index}`,
      radicalId: item.id,
      questionText,
      radicalName: item.nameBn,
      correctFormula: item.formula,
      correctValency: item.valency,
      options: shuffledOptions,
      correctAnswerIndex: correctIndex,
      explanation,
      group: item.group,
    };
  });
}

/**
 * Generates Self-Recall (Reveal Answer) questions for Radicals
 * Direction 1 ('name_to_formula'): Prompts radical name, user mentally thinks formula + valency, then reveals.
 * Direction 2 ('formula_to_name'): Prompts formula/ion, user mentally thinks name + valency, then reveals.
 * Direction 3 ('mixed'): Both directions mixed.
 */
export function generateRadicalsRecall(
  count: number = 15,
  direction: RadicalRecallDirection = 'name_to_formula',
  filterCategory?: string,
  groupFilter: RadicalGroup = 'both'
): RadicalRecallQuestion[] {
  let source = radicalsData;
  if (groupFilter && groupFilter !== 'both') {
    source = source.filter((r) => r.group === groupFilter);
  }
  if (filterCategory && filterCategory !== 'সবগুলো') {
    source = source.filter((r) => r.category === filterCategory);
  }
  const validCount = Math.max(1, Math.min(source.length, count));
  const shuffled = shuffleArray(source);
  const selected = shuffled.slice(0, validCount);

  return selected.map((item, index) => {
    let chosenDirection: 'name_to_formula' | 'formula_to_name';
    if (direction === 'mixed') {
      chosenDirection = index % 2 === 0 ? 'name_to_formula' : 'formula_to_name';
    } else {
      chosenDirection = direction;
    }

    const noteText = item.note ? ` [${item.note}]` : '';

    if (chosenDirection === 'name_to_formula') {
      return {
        id: `rad_rec_n2f_${item.id}_${index}`,
        radicalId: item.id,
        direction: 'name_to_formula',
        promptTitle: item.nameBn,
        promptSubtitle: `গ্রুপ ${item.group} • ${item.category}`,
        radicalName: item.nameBn,
        formula: item.formula,
        valency: item.valency,
        charge: item.charge,
        category: item.category,
        group: item.group,
        explanation: `‘${item.nameBn}’ (গ্রুপ ${item.group}) এর সঠিক সংকেত হলো ${item.formula}। এর যোজনী ${item.valency} এবং চার্জ ${item.charge}${noteText}।`,
      };
    } else {
      return {
        id: `rad_rec_f2n_${item.id}_${index}`,
        radicalId: item.id,
        direction: 'formula_to_name',
        promptTitle: item.formula,
        promptSubtitle: `গ্রুপ ${item.group} • চার্জ: ${item.charge} • ${item.category}`,
        radicalName: item.nameBn,
        formula: item.formula,
        valency: item.valency,
        charge: item.charge,
        category: item.category,
        group: item.group,
        explanation: `সংকেত ${item.formula} হলো ‘${item.nameBn}’ (গ্রুপ ${item.group}) যৌগমূলক। এর যোজনী ${item.valency} এবং চার্জ ${item.charge}${noteText}।`,
      };
    }
  });
}
