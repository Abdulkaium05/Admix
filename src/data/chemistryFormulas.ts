export interface ChemistryCompound {
  id: string;
  commonName: string; // প্রচলিত নাম / বাণিজ্যিক নাম
  chemicalName: string; // রাসায়নিক নাম
  formula: string; // সঠিক রাসায়নিক সংকেত
  duetRef?: string; // বিগত ডুয়েট ভর্তি পরীক্ষার রেফারেন্স
  category?: 'এসিড' | 'ক্ষার' | 'লবণ' | 'গ্যাস' | 'জৈব যৌগ' | 'খনিজ' | 'মিশ্রণ' | 'অন্যান্য';
}

export interface ChemistryQuizQuestion {
  id: string;
  compoundId: string;
  commonName: string;
  chemicalName: string;
  correctFormula: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  duetRef?: string;
  explanation: string;
}

// Complete verified dataset based on DUET Admission Care sheet and user provided reference
export const chemistryFormulas: ChemistryCompound[] = [
  {
    id: 'oil_of_vitriol',
    commonName: 'অয়েল অব ভিট্রিওল',
    chemicalName: 'সালফিউরিক এসিড',
    formula: 'H₂SO₄',
    category: 'এসিড',
  },
  {
    id: 'oleic_acid',
    commonName: 'অলিক এসিড',
    chemicalName: 'অলিক এসিড',
    formula: 'C₁₇H₃₃COOH',
    category: 'এসিড',
  },
  {
    id: 'oleum',
    commonName: 'অলিয়াম',
    chemicalName: 'পাইরোসালফিউরিক এসিড',
    formula: 'H₂S₂O₇',
    category: 'এসিড',
  },
  {
    id: 'aqua_fortis',
    commonName: 'অ্যাকুয়া ফর্টিস বা তীব্র পানি',
    chemicalName: 'নাইট্রিক এসিড',
    formula: 'HNO₃',
    category: 'এসিড',
  },
  {
    id: 'anhydrite',
    commonName: 'অ্যানাহাইড্রেট',
    chemicalName: 'ক্যালসিয়াম সালফেট',
    formula: 'CaSO₄',
    category: 'লবণ',
  },
  {
    id: 'acetic_acid',
    commonName: 'অ্যাসিটিক এসিড / ইথানয়িক এসিড',
    chemicalName: 'ইথানয়িক এসিড',
    formula: 'CH₃COOH',
    duetRef: 'DUET: 15-16; 17-18',
    category: 'জৈব যৌগ',
  },
  {
    id: 'urea',
    commonName: 'ইউরিয়া',
    chemicalName: 'ইউরিয়া (কার্বামাইড)',
    formula: 'NH₂-CO-NH₂',
    category: 'জৈব যৌগ',
  },
  {
    id: 'ethylene_glycol',
    commonName: 'ইথিলিন গ্লাইকল',
    chemicalName: 'ইথেন-১,২-ডাইঅল',
    formula: 'HO-CH₂-CH₂-OH',
    category: 'জৈব যৌগ',
  },
  {
    id: 'epsom_salt',
    commonName: 'ইপসম সল্ট / জোলাপ',
    chemicalName: 'হেপ্টাহাইড্রেট ম্যাগনেসিয়াম সালফেট',
    formula: 'MgSO₄·7H₂O',
    duetRef: 'DUET: 07-08',
    category: 'লবণ',
  },
  {
    id: 'wood_naphtha',
    commonName: 'উড ন্যাপথা / উড স্পিরিট',
    chemicalName: 'মিথাইল অ্যালকোহল (মিথানল)',
    formula: 'CH₃-OH',
    duetRef: 'DUET: 21-22',
    category: 'জৈব যৌগ',
  },
  {
    id: 'water_gas',
    commonName: 'ওয়াটার গ্যাস',
    chemicalName: 'কার্বন মনোক্সাইড ও হাইড্রোজেনের মিশ্রণ',
    formula: '[CO + H₂]',
    duetRef: 'DUET: 11-12; 21-22',
    category: 'মিশ্রণ',
  },
  {
    id: 'camphor',
    commonName: 'কর্পূর / ন্যাপথালিন',
    chemicalName: 'ন্যাপথালিন',
    formula: 'C₁₀H₈',
    category: 'জৈব যৌগ',
  },
  {
    id: 'slaked_lime',
    commonName: 'কলিচুন',
    chemicalName: 'ক্যালসিয়াম হাইড্রোক্সাইড',
    formula: 'Ca(OH)₂',
    category: 'ক্ষার',
  },
  {
    id: 'caustic_soda',
    commonName: 'কস্টিক সোডা',
    chemicalName: 'সোডিয়াম হাইড্রোক্সাইড',
    formula: 'NaOH',
    category: 'ক্ষার',
  },
  {
    id: 'kieselguhr',
    commonName: 'কাইজেল গুড়',
    chemicalName: 'সিলিকন ডাই অক্সাইড',
    formula: 'SiO₂',
    category: 'খনিজ',
  },
  {
    id: 'milk_of_magnesia',
    commonName: 'মিল্ক অব ম্যাগনেসিয়া',
    chemicalName: 'ম্যাগনেসিয়াম হাইড্রোক্সাইড',
    formula: 'Mg(OH)₂',
    duetRef: 'DUET: 06-07; 22-23',
    category: 'ক্ষার',
  },
  {
    id: 'corundum',
    commonName: 'কোরান্ডাম',
    chemicalName: 'অ্যালুমিনিয়াম অক্সাইড',
    formula: 'Al₂O₃',
    category: 'খনিজ',
  },
  {
    id: 'cryolite',
    commonName: 'ক্রায়োলাইট',
    chemicalName: 'সোডিয়াম অ্যালুমিনিয়াম ফ্লোরাইড',
    formula: 'AlF₃·3NaF',
    category: 'খনিজ',
  },
  {
    id: 'chloroform',
    commonName: 'ক্লোরোফর্ম',
    chemicalName: 'ট্রাইক্লোরোমিথেন',
    formula: 'CHCl₃',
    category: 'জৈব যৌগ',
  },
  {
    id: 'baking_soda',
    commonName: 'খাবার সোডা / বেকিং সোডা',
    chemicalName: 'সোডিয়াম বাইকার্বনেট',
    formula: 'NaHCO₃',
    duetRef: 'DUET: 2000-01',
    category: 'লবণ',
  },
  {
    id: 'gammaxene',
    commonName: 'গ্যামাক্সিন',
    chemicalName: 'বেনজিন হেক্সাক্লোরাইড (BHC)',
    formula: 'C₆H₆Cl₆',
    duetRef: 'DUET: 02-03; 04-05; 15-16; 22-23',
    category: 'জৈব যৌগ',
  },
  {
    id: 'galena',
    commonName: 'গ্যালেনা',
    chemicalName: 'লেড সালফাইড',
    formula: 'PbS',
    category: 'খনিজ',
  },
  {
    id: 'testing_salt',
    commonName: 'টেস্টিং সল্ট',
    chemicalName: 'মনোসোডিয়াম গ্লুটামেট (MSG)',
    formula: 'HOOC-(CH₂)₂-CH(NH₂)-COONa',
    duetRef: 'DUET: 15-16',
    category: 'লবণ',
  },
  {
    id: 'dolomite',
    commonName: 'ডলোমাইট',
    chemicalName: 'ক্যালসিয়াম ম্যাগনেসিয়াম কার্বনেট',
    formula: 'CaCO₃·MgCO₃',
    category: 'খনিজ',
  },
  {
    id: 'diaspore',
    commonName: 'ডায়াস্পোর',
    chemicalName: 'মনোহাইড্রেট অ্যালুমিনিয়াম অক্সাইড',
    formula: 'Al₂O₃·H₂O',
    category: 'খনিজ',
  },
  {
    id: 'philosophers_wool',
    commonName: 'দার্শনিকের পশম (কম্বল)',
    chemicalName: 'জিংক অক্সাইড',
    formula: 'ZnO',
    category: 'খনিজ',
  },
  {
    id: 'philosophers_salt',
    commonName: 'দার্শনিকের লবণ',
    chemicalName: 'সালফার ট্রাই অক্সাইড',
    formula: 'SO₃',
    category: 'অন্যান্য',
  },
  {
    id: 'natron',
    commonName: 'ন্যাট্রোন',
    chemicalName: 'মনোহাইড্রেট সোডিয়াম কার্বনেট',
    formula: 'Na₂CO₃·H₂O',
    category: 'লবণ',
  },
  {
    id: 'nishadal',
    commonName: 'নিশাদল',
    chemicalName: 'অ্যামোনিয়াম ক্লোরাইড',
    formula: 'NH₄Cl',
    category: 'লবণ',
  },
  {
    id: 'silent_killer',
    commonName: 'নীরব ঘাতক',
    chemicalName: 'কার্বন মনোঅক্সাইড',
    formula: 'CO',
    category: 'গ্যাস',
  },
  {
    id: 'potash_alum',
    commonName: 'পটাশ অ্যালাম / ফিটকিরি',
    chemicalName: 'পটাশিয়াম অ্যালুমিনিয়াম সালফেট',
    formula: 'K₂SO₄·Al₂(SO₄)₃·24H₂O',
    category: 'লবণ',
  },
  {
    id: 'pyrene',
    commonName: 'পাইরিন',
    chemicalName: 'কার্বন টেট্রাক্লোরাইড',
    formula: 'CCl₄',
    category: 'জৈব যৌগ',
  },
  {
    id: 'permutit',
    commonName: 'পরম্যুটিট',
    chemicalName: 'সোডিয়াম অ্যালুমিনিয়াম অর্থোসিলিকেট',
    formula: 'NaAlSiO₄·3H₂O',
    category: 'খনিজ',
  },
  {
    id: 'producer_gas',
    commonName: 'প্রডিউসার গ্যাস',
    chemicalName: 'কার্বন মনোক্সাইড ও নাইট্রোজেনের মিশ্রণ',
    formula: '[CO + N₂]',
    category: 'মিশ্রণ',
  },
  {
    id: 'plaster_of_paris',
    commonName: 'প্লাস্টার অব প্যারিস',
    chemicalName: 'মনোহাইড্রেট ডাই ক্যালসিয়াম সালফেট',
    formula: '(CaSO₄)₂·H₂O',
    category: 'লবণ',
  },
  {
    id: 'phosgene_gas',
    commonName: 'ফসজিন গ্যাস',
    chemicalName: 'কার্বনিল ক্লোরাইড',
    formula: 'COCl₂',
    category: 'গ্যাস',
  },
  {
    id: 'borax',
    commonName: 'বোরাক্স সোহাগা',
    chemicalName: 'ডেকাহাইড্রেট সোডিয়াম পাইরোবোরেট',
    formula: 'Na₂B₄O₇·10H₂O',
    duetRef: 'DUET: 02-03; 04-05',
    category: 'লবণ',
  },
  {
    id: 'bleaching_powder',
    commonName: 'ব্লিচিং পাউডার',
    chemicalName: 'ক্যালসিয়াম ক্লোরোহাইপোক্লোরাইট',
    formula: 'Ca(OCl)Cl',
    category: 'লবণ',
  },
  {
    id: 'blue_vitriol',
    commonName: 'ব্লু-ভিট্রিওল (তুঁতে)',
    chemicalName: 'পেন্টাহাইড্রেট কপার সালফেট',
    formula: 'CuSO₄·5H₂O',
    category: 'লবণ',
  },
  {
    id: 'rust',
    commonName: 'মরিচা',
    chemicalName: 'হাইড্রেটেড ফেরিক অক্সাইড',
    formula: '2Fe₂O₃·3H₂O',
    category: 'খনিজ',
  },
  {
    id: 'mustard_gas',
    commonName: 'মাস্টার্ড গ্যাস',
    chemicalName: 'ডাই-ক্লোরো ডাই-ইথাইল সালফাইড',
    formula: 'Cl-CH₂-CH₂-S-CH₂-CH₂-Cl',
    duetRef: 'DUET: 06-07',
    category: 'গ্যাস',
  },
  {
    id: 'magnetite',
    commonName: 'ম্যাগনেটাইট',
    chemicalName: 'ফেরোসোফেরিক অক্সাইড',
    formula: 'Fe₃O₄',
    category: 'খনিজ',
  },
  {
    id: 'magnesite',
    commonName: 'ম্যাগনেসাইট',
    chemicalName: 'ম্যাগনেসিয়াম কার্বনেট',
    formula: 'MgCO₃',
    category: 'খনিজ',
  },
  {
    id: 'malachite',
    commonName: 'ম্যালাকাইট (ম্যালাকল)',
    chemicalName: 'ক্ষারীয় কপার কার্বনেট',
    formula: 'CuCO₃·Cu(OH)₂',
    category: 'খনিজ',
  },
  {
    id: 'muriate_of_potash',
    commonName: 'মিউরেট অব পটাশ',
    chemicalName: 'পটাশিয়াম ক্লোরাইড',
    formula: 'KCl',
    category: 'লবণ',
  },
  {
    id: 'minium',
    commonName: 'মিনিয়াম / সিঁদুর (রেড লেড)',
    chemicalName: 'প্লাম্বোসো প্লাম্বিক অক্সাইড',
    formula: 'Pb₃O₄',
    category: 'খনিজ',
  },
  {
    id: 'mohrs_salt',
    commonName: 'মোরের লবণ',
    chemicalName: 'ফেরাস অ্যামোনিয়াম সালফেট হেক্সাহাইড্রেট',
    formula: 'FeSO₄·(NH₄)₂SO₄·6H₂O',
    duetRef: 'DUET: 06-07; 10-11',
    category: 'লবণ',
  },
  {
    id: 'aqua_regia',
    commonName: 'রাজ অম্ল (অ্যাকুয়া রেজিয়া)',
    chemicalName: 'গাঢ় HCl ও গাঢ় HNO₃ এর ৩:১ মিশ্রণ',
    formula: '[3HCl + HNO₃]',
    category: 'মিশ্রণ',
  },
  {
    id: 'laughing_gas',
    commonName: 'লাফিং গ্যাস',
    chemicalName: 'নাইট্রাস অক্সাইড (ডাইনাইট্রোজেন অক্সাইড)',
    formula: 'N₂O',
    duetRef: 'DUET: 15-16',
    category: 'গ্যাস',
  },
  {
    id: 'dry_ice',
    commonName: 'শুষ্ক বরফ',
    chemicalName: 'কঠিন কার্বন ডাই অক্সাইড',
    formula: 'CO₂',
    duetRef: 'DUET: 16-17',
    category: 'অন্যান্য',
  },
  {
    id: 'starch',
    commonName: 'শ্বেতসার (স্টার্চ)',
    chemicalName: 'শ্বেতসার / পলিস্যাকারাইড',
    formula: '(C₆H₁₀O₅)n',
    duetRef: 'DUET: 22-23',
    category: 'জৈব যৌগ',
  },
  {
    id: 'green_vitriol',
    commonName: 'সবুজ ভিট্রিওল (হীরাকস)',
    chemicalName: 'হেপ্টাহাইড্রেট ফেরাস সালফেট',
    formula: 'FeSO₄·7H₂O',
    duetRef: 'DUET: 07-08; 09-10; 13-14; 22-23',
    category: 'লবণ',
  },
  {
    id: 'niter',
    commonName: 'নাইটার / সোরা',
    chemicalName: 'পটাশিয়াম নাইট্রেট',
    formula: 'KNO₃',
    duetRef: 'DUET: 13-14',
    category: 'লবণ',
  },
  {
    id: 'white_vitriol',
    commonName: 'সাদা ভিট্রিওল',
    chemicalName: 'হেপ্টাহাইড্রেট জিংক সালফেট',
    formula: 'ZnSO₄·7H₂O',
    duetRef: 'DUET: 12-13',
    category: 'লবণ',
  },
  {
    id: 'washing_soap',
    commonName: 'কাপড় কাচার সাবান',
    chemicalName: 'সোডিয়াম বা পটাশিয়াম স্টিয়ারেট',
    formula: 'C₁₇H₃₅COONa',
    duetRef: 'DUET: 02-03; 04-05',
    category: 'জৈব যৌগ',
  },
  {
    id: 'cinnabar',
    commonName: 'সিনাবার',
    chemicalName: 'মারকিউরিক সালফাইড',
    formula: 'HgS',
    duetRef: 'DUET: 11-12',
    category: 'খনিজ',
  },
  {
    id: 'sylvine',
    commonName: 'সিলভাইন',
    chemicalName: 'পটাশিয়াম ক্লোরাইড',
    formula: 'KCl',
    category: 'খনিজ',
  },
  {
    id: 'sucrose',
    commonName: 'সুক্রোজ (ইক্ষুর চিনি)',
    chemicalName: 'সুক্রোজ',
    formula: 'C₁₂H₂₂O₁₁',
    category: 'জৈব যৌগ',
  },
  {
    id: 'washing_soda',
    commonName: 'সোডা স্ফটিক / কাপড় কাঁচা সোডা',
    chemicalName: 'ডেকাহাইড্রেট সোডিয়াম কার্বনেট',
    formula: 'Na₂CO₃·10H₂O',
    duetRef: 'DUET: 04-05; 08-09',
    category: 'লবণ',
  },
  {
    id: 'heavy_water',
    commonName: 'ভারী পানি',
    chemicalName: 'ডিউটেরিয়াম অক্সাইড',
    formula: 'D₂O',
    category: 'অন্যান্য',
  },
  {
    id: 'tear_gas',
    commonName: 'কাঁদুনে গ্যাস',
    chemicalName: 'ক্লোরোপিকরিন',
    formula: 'CCl₃-NO₂',
    category: 'গ্যাস',
  },
];

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
 * Generates an MCQ quiz set of chemical formulas
 * @param count Number of questions (10 to 30)
 */
export function generateChemistryQuiz(count: number = 10): ChemistryQuizQuestion[] {
  const validCount = Math.max(10, Math.min(30, count));
  const shuffledCompounds = shuffleArray(chemistryFormulas);
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
    const explanation = `সঠিক উত্তর: ${compound.formula}। এর প্রচলিত নাম ‘${compound.commonName}’ এবং রাসায়নিক নাম ‘${compound.chemicalName}’${duetSuffix}।`;

    return {
      id: `chem_q_${compound.id}_${index}`,
      compoundId: compound.id,
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
