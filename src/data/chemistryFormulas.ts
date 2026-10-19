export type FormulaGroup = 'A' | 'B' | 'both';

export interface ChemistryCompound {
  id: string;
  group: 'A' | 'B'; // Group A: User Provided Commercial Names & Formulas from 2 images; Group B: Others
  commonName: string; // প্রচলিত নাম / বাণিজ্যিক নাম
  chemicalName: string; // রাসায়নিক নাম
  formula: string; // সঠিক রাসায়নিক সংকেত
  duetRef?: string; // বিগত ডুয়েট ভর্তি পরীক্ষার রেফারেন্স
  category?: 'এসিড' | 'ক্ষার' | 'লবণ' | 'গ্যাস' | 'জৈব যৌগ' | 'খনিজ' | 'মিশ্রণ' | 'অন্যান্য';
}

export interface ChemistryQuizQuestion {
  id: string;
  compoundId: string;
  group: 'A' | 'B';
  commonName: string;
  chemicalName: string;
  correctFormula: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  duetRef?: string;
  explanation: string;
}

export type RecallDirection = 'name_to_formula' | 'formula_to_name' | 'mixed';

export interface ChemistryRecallQuestion {
  id: string;
  compoundId: string;
  group: 'A' | 'B';
  direction: 'name_to_formula' | 'formula_to_name';
  questionTitle: string;
  questionSubtitle: string;
  questionPrompt: string;
  commonName: string;
  chemicalName: string;
  formula: string;
  duetRef?: string;
  category?: string;
  explanation: string;
}

// Complete verified dataset:
// GROUP A: 59 commercial names & formulas from the 2 user-uploaded images
// GROUP B: All other chemical formulas & DUET admission compounds
export const chemistryFormulas: ChemistryCompound[] = [
  // =========================================================================
  // GROUP A: ছবি ১ ও ছবি ২ এর বাণিজ্যিক নাম ও রাসায়নিক সংকেত (User Uploaded)
  // =========================================================================
  // --- ছবি ১ (Image 1) ---
  {
    id: 'washing_soda_crystal',
    group: 'A',
    commonName: 'কাপড় কাচার সোডা / সোডা স্ফটিক',
    chemicalName: 'ডেকাহাইড্রেট সোডিয়াম কার্বনেট',
    formula: 'Na₂CO₃·10H₂O',
    duetRef: 'DUET: 04-05; 08-09',
    category: 'লবণ',
  },
  {
    id: 'sodium_hypochlorite',
    group: 'A',
    commonName: 'সোডিয়াম হাইপোক্লোরাইট',
    chemicalName: 'সোডিয়াম হাইপোক্লোরাইট (ব্লিচ সলিউশন)',
    formula: 'NaClO',
    category: 'লবণ',
  },
  {
    id: 'sodium_aluminate',
    group: 'A',
    commonName: 'সোডিয়াম অ্যালুমিনেট',
    chemicalName: 'সোডিয়াম মেটাঅ্যালুমিনেট',
    formula: 'NaAlO₂',
    category: 'লবণ',
  },
  {
    id: 'permutit_zeolite',
    group: 'A',
    commonName: 'পারমুটিট',
    chemicalName: 'সোডিয়াম জিওলাইট / অ্যালুমিনোসিলিকেট',
    formula: 'Na₂Al₂Si₂O₈·xH₂O',
    category: 'খনিজ',
  },
  {
    id: 'testing_salt',
    group: 'A',
    commonName: 'টেস্টিং সল্ট',
    chemicalName: 'মনোসোডিয়াম গ্লুটামেট (MSG)',
    formula: 'HOOC-(CH₂)₂-CH(NH₂)COONa',
    duetRef: 'DUET: 15-16',
    category: 'লবণ',
  },
  {
    id: 'milk_of_magnesia',
    group: 'A',
    commonName: 'মিল্ক অব ম্যাগনেসিয়াম',
    chemicalName: 'ম্যাগনেসিয়াম হাইড্রোক্সাইড সাসপেনশন',
    formula: 'Mg(OH)₂',
    duetRef: 'DUET: 06-07; 22-23',
    category: 'ক্ষার',
  },
  {
    id: 'white_vitriol',
    group: 'A',
    commonName: 'সাদা ভিট্রিওল',
    chemicalName: 'হেপ্টাহাইড্রেট জিংক সালফেট',
    formula: 'ZnSO₄·7H₂O',
    duetRef: 'DUET: 12-13',
    category: 'লবণ',
  },
  {
    id: 'green_vitriol',
    group: 'A',
    commonName: 'সবুজ ভিট্রিওল',
    chemicalName: 'হেপ্টাহাইড্রেট ফেরাস সালফেট',
    formula: 'FeSO₄·7H₂O',
    duetRef: 'DUET: 07-08; 09-10; 22-23',
    category: 'লবণ',
  },
  {
    id: 'blue_vitriol',
    group: 'A',
    commonName: 'ব্লু-ভিট্রিওল (তুঁতে)',
    chemicalName: 'পেন্টাহাইড্রেট কপার সালফেট',
    formula: 'CuSO₄·5H₂O',
    category: 'লবণ',
  },
  {
    id: 'oil_of_vitriol',
    group: 'A',
    commonName: 'অয়েল অফ ভিট্রিওল',
    chemicalName: 'গাঢ় সালফিউরিক এসিড',
    formula: 'H₂SO₄',
    category: 'এসিড',
  },
  {
    id: 'epsom_salt',
    group: 'A',
    commonName: 'ইপসম লবণ / জোলাপ',
    chemicalName: 'হেপ্টাহাইড্রেট ম্যাগনেসিয়াম সালফেট',
    formula: 'MgSO₄·7H₂O',
    duetRef: 'DUET: 07-08',
    category: 'লবণ',
  },
  {
    id: 'mohrs_salt',
    group: 'A',
    commonName: 'মেহের লবণ / মোহের লবণ',
    chemicalName: 'ফেরাস অ্যামোনিয়াম সালফেট হেক্সাহাইড্রেট',
    formula: 'FeSO₄·(NH₄)₂SO₄·6H₂O',
    duetRef: 'DUET: 06-07; 10-11',
    category: 'লবণ',
  },
  {
    id: 'potash_alum',
    group: 'A',
    commonName: 'ফিটকিরি (পটাশ অ্যালাম)',
    chemicalName: 'পটাশিয়াম অ্যালুমিনিয়াম সালফেট',
    formula: 'K₂SO₄·Al₂(SO₄)₃·24H₂O',
    category: 'লবণ',
  },
  {
    id: 'chrome_alum',
    group: 'A',
    commonName: 'ক্রোমলোম (ক্রোম অ্যালাম)',
    chemicalName: 'পটাশিয়াম ক্রোমিয়াম সালফেট',
    formula: 'K₂SO₄·Cr₂(SO₄)₃·24H₂O',
    category: 'লবণ',
  },
  {
    id: 'ferric_alum',
    group: 'A',
    commonName: 'ফেরিক অ্যালাম',
    chemicalName: 'পটাশিয়াম/অ্যামোনিয়াম ফেরিক সালফেট',
    formula: 'K₂SO₄·Fe₂(SO₄)₃·24H₂O',
    category: 'লবণ',
  },
  {
    id: 'muriate_of_potash',
    group: 'A',
    commonName: 'মিউরিয়েট অব পটাশ / স্পিরিট অব সল্ট',
    chemicalName: 'পটাশিয়াম ক্লোরাইড / হাইড্রোক্লোরিক এসিড',
    formula: 'KCl',
    category: 'লবণ',
  },
  {
    id: 'niter_saltpeter',
    group: 'A',
    commonName: 'নাইটার / সোরা',
    chemicalName: 'পটাশিয়াম নাইট্রেট',
    formula: 'KNO₃',
    duetRef: 'DUET: 13-14',
    category: 'লবণ',
  },
  {
    id: 'carnallite',
    group: 'A',
    commonName: 'কার্নালাইট',
    chemicalName: 'পটাশিয়াম ম্যাগনেসিয়াম ক্লোরাইড হেক্সাহাইড্রেট',
    formula: 'KCl·MgCl₂·6H₂O',
    category: 'খনিজ',
  },
  {
    id: 'bleaching_powder',
    group: 'A',
    commonName: 'ব্লিচিং পাউডার',
    chemicalName: 'ক্যালসিয়াম ক্লোরোহাইপোক্লোরাইট',
    formula: 'Ca(OCl)Cl',
    category: 'লবণ',
  },
  {
    id: 'tsp_fertilizer',
    group: 'A',
    commonName: 'টি.এস.পি (T.S.P)',
    chemicalName: 'ট্রিপল সুপার ফসফেট',
    formula: 'Ca(H₂PO₄)₂·H₂O',
    category: 'লবণ',
  },
  {
    id: 'slaked_lime',
    group: 'A',
    commonName: 'কলিচুন',
    chemicalName: 'ক্যালসিয়াম হাইড্রোক্সাইড',
    formula: 'Ca(OH)₂',
    category: 'ক্ষার',
  },
  {
    id: 'sapphire_blue',
    group: 'A',
    commonName: 'নীলকান্ত মণি (স্যাফায়ার)',
    chemicalName: 'অ্যালুমিনিয়াম অক্সাইড রত্নপাথর',
    formula: 'Al₂O₃',
    category: 'খনিজ',
  },
  {
    id: 'ruby_stone',
    group: 'A',
    commonName: 'রুবি পাথর',
    chemicalName: 'অ্যালুমিনিয়াম অক্সাইড (ক্রোমিয়ামযুক্ত রত্ন)',
    formula: 'Al₂O₃',
    category: 'খনিজ',
  },
  {
    id: 'iron_pyrite',
    group: 'A',
    commonName: 'আয়রন পাইরাইট (বোকার সোনা)',
    chemicalName: 'আয়রন ডাইসালফাইড',
    formula: 'FeS₂',
    category: 'খনিজ',
  },
  {
    id: 'heera_kosh',
    group: 'A',
    commonName: 'হীরাকস',
    chemicalName: 'হেপ্টাহাইড্রেট ফেরাস সালফেট',
    formula: 'FeSO₄·7H₂O',
    category: 'লবণ',
  },
  {
    id: 'jewelers_rouge',
    group: 'A',
    commonName: 'জুয়েলার বর্জ্য (রুজ)',
    chemicalName: 'ফেরিক অক্সাইড পলিশ পাউডার',
    formula: 'Fe₂O₃',
    category: 'খনিজ',
  },
  {
    id: 'rat_poison',
    group: 'A',
    commonName: 'ইঁদুর মারার বিষ',
    chemicalName: 'জিঙ্ক ফসফাইড',
    formula: 'Zn₃P₂',
    category: 'লবণ',
  },

  // --- ছবি ২ (Image 2) ---
  {
    id: 'rinmanns_green',
    group: 'A',
    commonName: 'রিনম্যান গ্রিন',
    chemicalName: 'কোবাল্ট জিঙ্ক অক্সাইড',
    formula: 'CoO·ZnO',
    category: 'খনিজ',
  },
  {
    id: 'galena',
    group: 'A',
    commonName: 'গ্যালেনা',
    chemicalName: 'লেড সালফাইড',
    formula: 'PbS',
    category: 'খনিজ',
  },
  {
    id: 'massicot_yellow_lead',
    group: 'A',
    commonName: 'ম্যাসিকোট / হলুদ লেড / লেড ওকার',
    chemicalName: 'লেড মনোক্সাইড',
    formula: 'PbO',
    category: 'খনিজ',
  },
  {
    id: 'red_lead_sindoor',
    group: 'A',
    commonName: 'সিঁদুর / সীসা সিঁদুর / রেড লেড',
    chemicalName: 'লেড টেট্রক্সাইড (মিনিয়াম)',
    formula: 'Pb₃O₄',
    category: 'খনিজ',
  },
  {
    id: 'glaubers_salt',
    group: 'A',
    commonName: 'গ্লোবার লবণ',
    chemicalName: 'ডেকাহাইড্রেট সোডিয়াম সালফেট',
    formula: 'Na₂SO₄·10H₂O',
    category: 'লবণ',
  },
  {
    id: 'aqua_fortis',
    group: 'A',
    commonName: 'অ্যাকোয়ারিয়া ফর্টিস / শক্তিশালী পানি',
    chemicalName: 'নাইট্রিক এসিড',
    formula: 'HNO₃',
    category: 'এসিড',
  },
  {
    id: 'glaubers_acid',
    group: 'A',
    commonName: 'গ্লোবার এসিড',
    chemicalName: 'চেম্বার এসিড (সালফিউরিক এসিড দ্রবণ)',
    formula: '৭৮% H₂SO₄',
    category: 'এসিড',
  },
  {
    id: 'cinnabar',
    group: 'A',
    commonName: 'সিনাবার',
    chemicalName: 'মারকিউরিক সালফাইড',
    formula: 'HgS',
    duetRef: 'DUET: 11-12',
    category: 'খনিজ',
  },
  {
    id: 'per_sulfuric_acid',
    group: 'A',
    commonName: 'পার সালফিউরিক এসিড (মার্শাল এসিড)',
    chemicalName: 'পারঅক্সোডাইসালফিউরিক এসিড',
    formula: 'H₂S₂O₈',
    category: 'এসিড',
  },
  {
    id: 'thio_sulfuric_acid',
    group: 'A',
    commonName: 'থায়ো সালফিউরিক এসিড',
    chemicalName: 'থায়োসালফিউরিক এসিড',
    formula: 'H₂S₂O₃',
    category: 'এসিড',
  },
  {
    id: 'hydro_sulfuric_acid',
    group: 'A',
    commonName: 'হাইড্রো সালফিউরিক এসিড',
    chemicalName: 'হাইড্রোজেন সালফাইড জলীয় দ্রবণ',
    formula: 'H₂S',
    category: 'এসিড',
  },
  {
    id: 'hypochlorous_acid',
    group: 'A',
    commonName: 'হাইপো ক্লোরাস এসিড',
    chemicalName: 'হাইপোক্লোরাস এসিড',
    formula: 'HClO',
    category: 'এসিড',
  },
  {
    id: 'sulfan',
    group: 'A',
    commonName: 'সালফান',
    chemicalName: 'তরল সালফার ট্রাইঅক্সাইড',
    formula: '৯৮% H₂SO₄ + SO₃',
    category: 'এসিড',
  },
  {
    id: 'alkaline_air',
    group: 'A',
    commonName: 'অ্যালকালীয় বায়ু',
    chemicalName: 'অ্যামোনিয়া গ্যাস',
    formula: 'NH₃',
    category: 'গ্যাস',
  },
  {
    id: 'nishadal',
    group: 'A',
    commonName: 'নিশাদল',
    chemicalName: 'অ্যামোনিয়াম ক্লোরাইড',
    formula: 'NH₄Cl',
    category: 'লবণ',
  },
  {
    id: 'laughing_gas',
    group: 'A',
    commonName: 'লাফিং গ্যাস',
    chemicalName: 'ডাইনাইট্রোজেন অক্সাইড (নাইট্রাস অক্সাইড)',
    formula: 'N₂O',
    duetRef: 'DUET: 15-16',
    category: 'গ্যাস',
  },
  {
    id: 'phosphine',
    group: 'A',
    commonName: 'ফসফিন',
    chemicalName: 'ফসফরাস ট্রাইহাইড্রাইড',
    formula: 'PH₃',
    category: 'গ্যাস',
  },
  {
    id: 'philosophers_wool',
    group: 'A',
    commonName: 'দার্শনিকের পশম / দার্শনিকের লবণ',
    chemicalName: 'জিংক অক্সাইড',
    formula: 'ZnO',
    category: 'খনিজ',
  },
  {
    id: 'camphor',
    group: 'A',
    commonName: 'কর্পূর',
    chemicalName: 'ক্যাম্ফর (টের্পিনয়েড কিটোন)',
    formula: 'C₁₀H₁₆O',
    category: 'জৈব যৌগ',
  },
  {
    id: 'tear_gas_picrin',
    group: 'A',
    commonName: 'কাঁদুনে গ্যাস / টিয়ার গ্যাস',
    chemicalName: 'ক্লোরোপিকরিন (ট্রাইক্লোরো নাইট্রোমিথেন)',
    formula: 'CCl₃NO₂',
    category: 'গ্যাস',
  },
  {
    id: 'sugar_cane',
    group: 'A',
    commonName: 'চিনি',
    chemicalName: 'সুক্রোজ',
    formula: 'C₁₂H₂₂O₁₁',
    category: 'জৈব যৌগ',
  },
  {
    id: 'glucose',
    group: 'A',
    commonName: 'গ্লুকোজ',
    chemicalName: 'ডেক্সট্রোজ / অ্যালডোহেক্সোজ',
    formula: 'C₆H₁₂O₆',
    category: 'জৈব যৌগ',
  },
  {
    id: 'gammaxene',
    group: 'A',
    commonName: 'গ্যামাক্সিন',
    chemicalName: 'বেনজিন হেক্সাক্লোরাইড (লিনডেন)',
    formula: 'C₆H₆Cl₆',
    duetRef: 'DUET: 02-03; 04-05; 15-16; 22-23',
    category: 'জৈব যৌগ',
  },
  {
    id: 'urea',
    group: 'A',
    commonName: 'ইউরিয়া',
    chemicalName: 'কার্বামাইড',
    formula: 'H₂N-CO-NH₂',
    category: 'জৈব যৌগ',
  },
  {
    id: 'wood_naphtha_spirit',
    group: 'A',
    commonName: 'উড-স্পিরিট / উড ন্যাপথা',
    chemicalName: 'মিথাইল অ্যালকোহল (মিথানল)',
    formula: 'CH₃OH',
    duetRef: 'DUET: 21-22',
    category: 'জৈব যৌগ',
  },
  {
    id: 'chloroform',
    group: 'A',
    commonName: 'ক্লোরোফর্ম',
    chemicalName: 'ট্রাইক্লোরোমিথেন',
    formula: 'CHCl₃',
    category: 'জৈব যৌগ',
  },
  {
    id: 'pigment_white',
    group: 'A',
    commonName: 'পিগমেন্ট (সাদা রঞ্জক)',
    chemicalName: 'টাইটানিয়াম ডাই অক্সাইড / জিঙ্ক অক্সাইড',
    formula: 'TiO₂',
    category: 'খনিজ',
  },
  {
    id: 'water_glass',
    group: 'A',
    commonName: 'পানি কাঁচ (ওয়াটার গ্লাস)',
    chemicalName: 'সোডিয়াম সিলিকেট দ্রবণ',
    formula: 'Na₂SiO₃',
    category: 'লবণ',
  },
  {
    id: 'dry_ice',
    group: 'A',
    commonName: 'শুষ্ক বরফ',
    chemicalName: 'কঠিন কার্বন ডাই অক্সাইড',
    formula: 'CO₂',
    duetRef: 'DUET: 16-17',
    category: 'অন্যান্য',
  },
  {
    id: 'silent_killer',
    group: 'A',
    commonName: 'নীরব ঘাতক',
    chemicalName: 'কার্বন মনোক্সাইড গ্যাস',
    formula: 'CO',
    category: 'গ্যাস',
  },
  {
    id: 'heavy_water',
    group: 'A',
    commonName: 'ভারী পানি',
    chemicalName: 'ডিউটেরিয়াম অক্সাইড',
    formula: 'D₂O',
    category: 'অন্যান্য',
  },
  {
    id: 'stearic_acid',
    group: 'A',
    commonName: 'স্টিয়ারিক এসিড',
    chemicalName: 'অক্টাডেকানয়িক এসিড',
    formula: 'C₁₇H₃₅COOH',
    category: 'জৈব যৌগ',
  },

  // =========================================================================
  // GROUP B: অন্যান্য গুরুত্বপূর্ণ যৌগ ও বিগত ডুয়েট ভর্তি পরীক্ষার সংকেত
  // =========================================================================
  {
    id: 'oleic_acid',
    group: 'B',
    commonName: 'অলিক এসিড',
    chemicalName: 'সিস-৯-অক্টাডেসিনয়িক এসিড',
    formula: 'C₁₇H₃₃COOH',
    category: 'এসিড',
  },
  {
    id: 'oleum',
    group: 'B',
    commonName: 'অলিয়াম (ধূমায়মান সালফিউরিক এসিড)',
    chemicalName: 'পাইরোসালফিউরিক এসিড',
    formula: 'H₂S₂O₇',
    category: 'এসিড',
  },
  {
    id: 'anhydrite',
    group: 'B',
    commonName: 'অ্যানাহাইড্রেট',
    chemicalName: 'অনাব্র ক্যালসিয়াম সালফেট',
    formula: 'CaSO₄',
    category: 'লবণ',
  },
  {
    id: 'acetic_acid',
    group: 'B',
    commonName: 'অ্যাসিটিক এসিড / ভিনেগার',
    chemicalName: 'ইথানয়িক এসিড',
    formula: 'CH₃COOH',
    duetRef: 'DUET: 15-16; 17-18',
    category: 'জৈব যৌগ',
  },
  {
    id: 'ethylene_glycol',
    group: 'B',
    commonName: 'ইথিলিন গ্লাইকল',
    chemicalName: 'ইথেন-১,২-ডাইঅল',
    formula: 'HO-CH₂-CH₂-OH',
    category: 'জৈব যৌগ',
  },
  {
    id: 'water_gas',
    group: 'B',
    commonName: 'ওয়াটার গ্যাস',
    chemicalName: 'কার্বন মনোক্সাইড ও হাইড্রোজেনের মিশ্রণ',
    formula: '[CO + H₂]',
    duetRef: 'DUET: 11-12; 21-22',
    category: 'মিশ্রণ',
  },
  {
    id: 'caustic_soda',
    group: 'B',
    commonName: 'কস্টিক সোডা',
    chemicalName: 'সোডিয়াম হাইড্রোক্সাইড',
    formula: 'NaOH',
    category: 'ক্ষার',
  },
  {
    id: 'kieselguhr',
    group: 'B',
    commonName: 'কাইজেল গুড়',
    chemicalName: 'সিলিকন ডাই অক্সাইড (ডায়াটমাইট)',
    formula: 'SiO₂',
    category: 'খনিজ',
  },
  {
    id: 'corundum',
    group: 'B',
    commonName: 'কোরান্ডাম',
    chemicalName: 'অ্যালুমিনিয়াম অক্সাইড খনিজ',
    formula: 'Al₂O₃',
    category: 'খনিজ',
  },
  {
    id: 'cryolite',
    group: 'B',
    commonName: 'ক্রায়োলাইট',
    chemicalName: 'সোডিয়াম অ্যালুমিনিয়াম ফ্লোরাইড',
    formula: 'AlF₃·3NaF',
    category: 'খনিজ',
  },
  {
    id: 'baking_soda',
    group: 'B',
    commonName: 'খাবার সোডা / বেকিং সোডা',
    chemicalName: 'সোডিয়াম বাইকার্বনেট',
    formula: 'NaHCO₃',
    duetRef: 'DUET: 2000-01',
    category: 'লবণ',
  },
  {
    id: 'dolomite',
    group: 'B',
    commonName: 'ডলোমাইট',
    chemicalName: 'ক্যালসিয়াম ম্যাগনেসিয়াম কার্বনেট',
    formula: 'CaCO₃·MgCO₃',
    category: 'খনিজ',
  },
  {
    id: 'diaspore',
    group: 'B',
    commonName: 'ডায়াস্পোর',
    chemicalName: 'মনোহাইড্রেট অ্যালুমিনিয়াম অক্সাইড',
    formula: 'Al₂O₃·H₂O',
    category: 'খনিজ',
  },
  {
    id: 'natron',
    group: 'B',
    commonName: 'ন্যাট্রোন',
    chemicalName: 'মনোহাইড্রেট সোডিয়াম কার্বনেট',
    formula: 'Na₂CO₃·H₂O',
    category: 'লবণ',
  },
  {
    id: 'pyrene',
    group: 'B',
    commonName: 'পাইরিন',
    chemicalName: 'কার্বন টেট্রাক্লোরাইড (অগ্নি নির্বাপক)',
    formula: 'CCl₄',
    category: 'জৈব যৌগ',
  },
  {
    id: 'producer_gas',
    group: 'B',
    commonName: 'প্রডিউসার গ্যাস',
    chemicalName: 'কার্বন মনোক্সাইড ও নাইট্রোজেনের মিশ্রণ',
    formula: '[CO + N₂]',
    category: 'মিশ্রণ',
  },
  {
    id: 'plaster_of_paris',
    group: 'B',
    commonName: 'প্লাস্টার অব প্যারিস',
    chemicalName: 'হেমিহাইড্রেট ক্যালসিয়াম সালফেট',
    formula: '(CaSO₄)₂·H₂O',
    category: 'লবণ',
  },
  {
    id: 'phosgene_gas',
    group: 'B',
    commonName: 'ফসজিন গ্যাস',
    chemicalName: 'কার্বনিল ক্লোরাইড বিষাক্ত গ্যাস',
    formula: 'COCl₂',
    category: 'গ্যাস',
  },
  {
    id: 'borax',
    group: 'B',
    commonName: 'বোরাক্স সোহাগা',
    chemicalName: 'ডেকাহাইড্রেট সোডিয়াম পাইরোবোরেট',
    formula: 'Na₂B₄O₇·10H₂O',
    duetRef: 'DUET: 02-03; 04-05',
    category: 'লবণ',
  },
  {
    id: 'rust',
    group: 'B',
    commonName: 'মরিচা',
    chemicalName: 'হাইড্রেটেড ফেরিক অক্সাইড',
    formula: '2Fe₂O₃·3H₂O',
    category: 'খনিজ',
  },
  {
    id: 'mustard_gas',
    group: 'B',
    commonName: 'মাস্টার্ড গ্যাস',
    chemicalName: 'ডাই-ক্লোরো ডাই-ইথাইল সালফাইড',
    formula: 'Cl-CH₂-CH₂-S-CH₂-CH₂-Cl',
    duetRef: 'DUET: 06-07',
    category: 'গ্যাস',
  },
  {
    id: 'magnetite',
    group: 'B',
    commonName: 'ম্যাগনেটাইট',
    chemicalName: 'ফেরোসোফেরিক অক্সাইড (চুম্বক পাথর)',
    formula: 'Fe₃O₄',
    category: 'খনিজ',
  },
  {
    id: 'magnesite',
    group: 'B',
    commonName: 'ম্যাগনেসাইট',
    chemicalName: 'ম্যাগনেসিয়াম কার্বনেট',
    formula: 'MgCO₃',
    category: 'খনিজ',
  },
  {
    id: 'malachite',
    group: 'B',
    commonName: 'ম্যালাকাইট (ম্যালাকল)',
    chemicalName: 'ক্ষারীয় কপার কার্বনেট',
    formula: 'CuCO₃·Cu(OH)₂',
    category: 'খনিজ',
  },
  {
    id: 'aqua_regia',
    group: 'B',
    commonName: 'রাজ অম্ল (অ্যাকুয়া রেজিয়া)',
    chemicalName: 'গাঢ় HCl ও গাঢ় HNO₃ এর ৩:১ মিশ্রণ',
    formula: '[3HCl + HNO₃]',
    category: 'মিশ্রণ',
  },
  {
    id: 'starch',
    group: 'B',
    commonName: 'শ্বেতসার (স্টার্চ)',
    chemicalName: 'পলিস্যাকারাইড শ্বেতসার',
    formula: '(C₆H₁₀O₅)n',
    duetRef: 'DUET: 22-23',
    category: 'জৈব যৌগ',
  },
  {
    id: 'washing_soap',
    group: 'B',
    commonName: 'কাপড় কাচার সাবান',
    chemicalName: 'সোডিয়াম স্টিয়ারেট',
    formula: 'C₁₇H₃₅COONa',
    duetRef: 'DUET: 02-03; 04-05',
    category: 'জৈব যৌগ',
  },
  {
    id: 'sylvine',
    group: 'B',
    commonName: 'সিলভাইন',
    chemicalName: 'পটাশিয়াম ক্লোরাইড খনিজ',
    formula: 'KCl',
    category: 'খনিজ',
  },
  {
    id: 'quick_lime',
    group: 'B',
    commonName: 'পোড়াচুন (কুইক লাইম)',
    chemicalName: 'ক্যালসিয়াম অক্সাইড',
    formula: 'CaO',
    category: 'ক্ষার',
  },
  {
    id: 'limestone',
    group: 'B',
    commonName: 'চুনাপাথর / মার্বেল পাথর',
    chemicalName: 'ক্যালসিয়াম কার্বনেট',
    formula: 'CaCO₃',
    category: 'খনিজ',
  },
  {
    id: 'chile_saltpeter',
    group: 'B',
    commonName: 'চিলি সল্টপিটার',
    chemicalName: 'সোডিয়াম নাইট্রেট',
    formula: 'NaNO₃',
    category: 'লবণ',
  },
];

export const formulaGroupStats = {
  total: chemistryFormulas.length,
  groupA: chemistryFormulas.filter((f) => f.group === 'A').length,
  groupB: chemistryFormulas.filter((f) => f.group === 'B').length,
};

/**
 * Filter formulas by group
 */
export function filterFormulasByGroup(group: FormulaGroup): ChemistryCompound[] {
  if (group === 'A') return chemistryFormulas.filter((f) => f.group === 'A');
  if (group === 'B') return chemistryFormulas.filter((f) => f.group === 'B');
  return chemistryFormulas;
}

/**
 * Fisher-Yates shuffle algorithm
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
 * Generates an MCQ quiz set of chemical formulas filtered by group
 * @param count Number of questions
 * @param group Group filter ('A', 'B', or 'both')
 */
export function generateChemistryQuiz(
  count: number = 10,
  group: FormulaGroup = 'both'
): ChemistryQuizQuestion[] {
  const pool = filterFormulasByGroup(group);
  const maxPossible = pool.length;
  const validCount = Math.max(1, Math.min(maxPossible, count));
  const shuffledCompounds = shuffleArray(pool);
  const selectedCompounds = shuffledCompounds.slice(0, validCount);

  // Pool of all formulas for realistic distractors
  const allFormulas = chemistryFormulas.map((c) => c.formula);

  return selectedCompounds.map((compound, index) => {
    // Pick 3 unique distractors different from compound.formula
    const otherFormulas = Array.from(new Set(allFormulas.filter((f) => f !== compound.formula)));
    const shuffledOthers = shuffleArray(otherFormulas);
    const distractors = shuffledOthers.slice(0, 3);

    // Combine correct formula + 3 distractors and shuffle
    const optionsWithTarget = [compound.formula, ...distractors];
    const shuffledOptions = shuffleArray(optionsWithTarget) as [string, string, string, string];

    const correctIndex = shuffledOptions.indexOf(compound.formula);

    const questionVariations = [
      `‘${compound.commonName}’ এর সঠিক রাসায়নিক সংকেত কোনটি?`,
      `নিচের কোনটি ‘${compound.commonName}’ এর রাসায়নিক সংকেত?`,
      `‘${compound.commonName}’ (${compound.chemicalName}) এর সংকেত কী?`,
    ];
    const questionText = questionVariations[index % questionVariations.length];

    const duetSuffix = compound.duetRef ? ` [${compound.duetRef}]` : '';
    const explanation = `সঠিক উত্তর: ${compound.formula}। এর প্রচলিত নাম ‘${compound.commonName}’ এবং রাসায়নিক নাম ‘${compound.chemicalName}’${duetSuffix} (গ্রুপ ${compound.group})।`;

    return {
      id: `chem_q_${compound.id}_${index}`,
      compoundId: compound.id,
      group: compound.group,
      commonName: compound.commonName,
      chemicalName: compound.chemicalName,
      correctFormula: compound.formula,
      questionText,
      options: shuffledOptions,
      correctAnswerIndex: correctIndex,
      duetRef: compound.duetRef,
      explanation,
    };
  });
}

/**
 * Generates Self-Recall questions without MCQ options filtered by group.
 */
export function generateRecallQuestions(
  count: number = 15,
  direction: RecallDirection = 'name_to_formula',
  group: FormulaGroup = 'both'
): ChemistryRecallQuestion[] {
  const pool = filterFormulasByGroup(group);
  const maxPossible = pool.length;
  const validCount = Math.max(1, Math.min(maxPossible, count));
  const shuffledCompounds = shuffleArray(pool);
  const selectedCompounds = shuffledCompounds.slice(0, validCount);

  return selectedCompounds.map((compound, index) => {
    let chosenDirection: 'name_to_formula' | 'formula_to_name';
    if (direction === 'mixed') {
      chosenDirection = index % 2 === 0 ? 'name_to_formula' : 'formula_to_name';
    } else {
      chosenDirection = direction;
    }

    const duetSuffix = compound.duetRef ? ` [${compound.duetRef}]` : '';

    if (chosenDirection === 'name_to_formula') {
      return {
        id: `recall_n2f_${compound.id}_${index}`,
        compoundId: compound.id,
        group: compound.group,
        direction: 'name_to_formula',
        questionTitle: compound.commonName,
        questionSubtitle: `বাণিজ্যিক নাম • গ্রুপ ${compound.group}`,
        questionPrompt: `‘${compound.commonName}’ এর সঠিক রাসায়নিক সংকেত মনে করুন:`,
        commonName: compound.commonName,
        chemicalName: compound.chemicalName,
        formula: compound.formula,
        duetRef: compound.duetRef,
        category: compound.category,
        explanation: `‘${compound.commonName}’ এর রাসায়নিক নাম হলো ‘${compound.chemicalName}’ এবং সংকেত হলো ‘${compound.formula}’${duetSuffix}।`,
      };
    } else {
      return {
        id: `recall_f2n_${compound.id}_${index}`,
        compoundId: compound.id,
        group: compound.group,
        direction: 'formula_to_name',
        questionTitle: compound.formula,
        questionSubtitle: `রাসায়নিক সংকেত • গ্রুপ ${compound.group}`,
        questionPrompt: `সংকেতটির (${compound.formula}) বাণিজ্যিক ও রাসায়নিক নাম মনে করুন:`,
        commonName: compound.commonName,
        chemicalName: compound.chemicalName,
        formula: compound.formula,
        duetRef: compound.duetRef,
        category: compound.category,
        explanation: `সংকেত ${compound.formula} এর রাসায়নিক নাম ‘${compound.chemicalName}’ এবং বাণিজ্যিক নাম ‘${compound.commonName}’${duetSuffix}।`,
      };
    }
  });
}
