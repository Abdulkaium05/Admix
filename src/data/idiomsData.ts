export interface IdiomItem {
  id: number; // 1 to 142
  phrase: string;
  meaningEn: string;
  meaningBn: string;
  example: string;
}

export type IdiomMcqStyle = 'both' | 'en_only' | 'bn_only';
export type IdiomRecallDirection = 'phrase_to_meaning' | 'meaning_to_phrase' | 'mixed';
export type IdiomRangeFilter = 'all' | '1-35' | '36-70' | '71-105' | '106-142';

export interface IdiomQuizQuestion {
  id: string;
  idiomId: number;
  phrase: string;
  meaningEn: string;
  meaningBn: string;
  example: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation: string;
}

export interface IdiomRecallQuestion {
  id: string;
  idiomId: number;
  direction: 'phrase_to_meaning' | 'meaning_to_phrase';
  promptTitle: string;
  promptSubtitle: string;
  phrase: string;
  meaningEn: string;
  meaningBn: string;
  example: string;
}

export const idiomsData: IdiomItem[] = [
  {
    id: 1,
    phrase: 'ABC',
    meaningEn: 'Primary Knowledge',
    meaningBn: 'প্রাথমিক জ্ঞান',
    example: 'He has no ABC in English.',
  },
  {
    id: 2,
    phrase: 'At a low ebb',
    meaningEn: 'Declining',
    meaningBn: 'অবনতি অবস্থায়',
    example: 'His fame is at a low ebb now.',
  },
  {
    id: 3,
    phrase: 'At daggers drawn',
    meaningEn: 'At enmity',
    meaningBn: 'শত্রুতাপূর্ণ অবস্থায়',
    example: 'The two brothers are now at daggers drawn.',
  },
  {
    id: 4,
    phrase: 'At large',
    meaningEn: 'Free',
    meaningBn: 'অবাধে',
    example: 'Birds fly at large in the sky.',
  },
  {
    id: 5,
    phrase: 'At all',
    meaningEn: 'Primarily',
    meaningBn: 'মোটেই',
    example: 'He is not happy at all.',
  },
  {
    id: 6,
    phrase: 'All at once / All of a sudden',
    meaningEn: 'Suddenly',
    meaningBn: 'হঠাৎ',
    example: 'All at once, a tiger came out of the bush.',
  },
  {
    id: 7,
    phrase: 'All in all',
    meaningEn: 'Supreme',
    meaningBn: 'সর্বময় কর্তৃত্ব',
    example: 'Mr. Jonayed is all in all in his office.',
  },
  {
    id: 8,
    phrase: "Achilles' heel",
    meaningEn: 'Weak point',
    meaningBn: 'দুর্বল দিক',
    example: "Math is his Achilles' heel.",
  },
  {
    id: 9,
    phrase: "At one's finger ends",
    meaningEn: 'Ready at hand',
    meaningBn: 'হাতের মুঠোয়',
    example: 'All these facts are at his finger ends.',
  },
  {
    id: 10,
    phrase: "At his wit's end",
    meaningEn: 'Puzzled',
    meaningBn: 'হতবুদ্ধি',
    example: "He was at his wit's end.",
  },
  {
    id: 11,
    phrase: 'Apple of discord',
    meaningEn: 'Matter of dispute',
    meaningBn: 'বিরোধের কারণ',
    example: 'Money is the apple of discord between the two brothers.',
  },
  {
    id: 12,
    phrase: "At arm's length",
    meaningEn: 'At a distance',
    meaningBn: 'দূরত্বে',
    example: "Try to keep the bad boy at arm's length.",
  },
  {
    id: 13,
    phrase: 'At stake',
    meaningEn: 'In danger',
    meaningBn: 'বিপদের মুখে',
    example: 'His life is at stake now.',
  },
  {
    id: 14,
    phrase: "At one's beck and call",
    meaningEn: 'Obedient',
    meaningBn: 'আদেশে উপস্থিত',
    example: 'He is always at my beck and call.',
  },
  {
    id: 15,
    phrase: 'At the eleventh hour',
    meaningEn: 'At the last moment',
    meaningBn: 'শেষ মুহূর্তে',
    example: 'The doctor came to the patient at the eleventh hour.',
  },
  {
    id: 16,
    phrase: 'At home',
    meaningEn: 'Skilled',
    meaningBn: 'দক্ষ',
    example: 'He is at home in mathematics.',
  },
  {
    id: 17,
    phrase: 'Bad blood',
    meaningEn: 'Ill-feeling',
    meaningBn: 'বিদ্বেষ',
    example: 'There is bad blood between the two brothers.',
  },
  {
    id: 18,
    phrase: 'Bag and baggage',
    meaningEn: 'With all belongings',
    meaningBn: 'সম্পূর্ণ মালপত্রসহ',
    example: 'He left the place bag and baggage.',
  },
  {
    id: 19,
    phrase: 'Beat about the bush',
    meaningEn: 'Talk irrelevantly',
    meaningBn: 'ঘুরিয়ে কথা বলা',
    example: 'Please come to the point without beating about the bush.',
  },
  {
    id: 20,
    phrase: 'Bed of roses',
    meaningEn: 'Comfortable condition',
    meaningBn: 'আরামদায়ক অবস্থা',
    example: 'Life is not a bed of roses.',
  },
  {
    id: 21,
    phrase: 'Birds of a feather',
    meaningEn: 'Persons of similar nature',
    meaningBn: 'এক রকম স্বভাবের লোক',
    example: 'Birds of a feather flock together.',
  },
  {
    id: 22,
    phrase: 'Beat black and blue',
    meaningEn: 'Beat severely',
    meaningBn: 'প্রচণ্ডভাবে প্রহার করা',
    example: 'They beat the thief black and blue.',
  },
  {
    id: 23,
    phrase: 'Black sheep',
    meaningEn: 'Person of bad character',
    meaningBn: 'বদচরিত্র ব্যক্তি',
    example: 'He is a black sheep.',
  },
  {
    id: 24,
    phrase: 'Beggars description',
    meaningEn: 'Cannot be described',
    meaningBn: 'বর্ণনাতীত',
    example: 'The beauty of DUET beggars description.',
  },
  {
    id: 25,
    phrase: 'By fits and starts',
    meaningEn: 'Irregularly',
    meaningBn: 'অনিয়মিতভাবে',
    example: 'He works by fits and starts.',
  },
  {
    id: 26,
    phrase: 'By and large',
    meaningEn: 'Mostly',
    meaningBn: 'মোটের উপর',
    example: 'People in our village are by and large farmers.',
  },
  {
    id: 27,
    phrase: 'Build castle in the air',
    meaningEn: 'Indulge in idle vision',
    meaningBn: 'কল্পনার রাজ্যে ভাসা',
    example: "Don't build castles in the air.",
  },
  {
    id: 28,
    phrase: 'Bone of contention',
    meaningEn: 'Matter of dispute',
    meaningBn: 'বিবাদের বিষয়',
    example: 'Only money is the bone of contention between the two brothers.',
  },
  {
    id: 29,
    phrase: 'Bolt from the blue',
    meaningEn: 'Unexpected sorrowful event',
    meaningBn: 'অপ্রত্যাশিত দুঃসংবাদ',
    example: 'The news came to me as a bolt from the blue.',
  },
  {
    id: 30,
    phrase: 'Burning question',
    meaningEn: 'Matter of strong dispute',
    meaningBn: 'জ্বলন্ত সমস্যা',
    example: 'Female education is a burning question.',
  },
  {
    id: 31,
    phrase: 'Bring to light',
    meaningEn: 'Make open',
    meaningBn: 'প্রকাশ করা',
    example: 'At last, the truth was brought to light.',
  },
  {
    id: 32,
    phrase: 'Bring to book',
    meaningEn: 'Punish',
    meaningBn: 'শাস্তি দেওয়া',
    example: 'He should be brought to book for his misconduct.',
  },
  {
    id: 33,
    phrase: "Breathe one's last",
    meaningEn: 'Die',
    meaningBn: 'মৃত্যুবরণ করা',
    example: 'The old man breathed his last on Sunday.',
  },
  {
    id: 34,
    phrase: 'Call to mind',
    meaningEn: 'Remember',
    meaningBn: 'মনে করা',
    example: 'I cannot call to mind your name.',
  },
  {
    id: 35,
    phrase: 'Cats and dogs',
    meaningEn: 'Rain heavily',
    meaningBn: 'প্রচণ্ড বৃষ্টি',
    example: 'It was raining cats and dogs.',
  },
  {
    id: 36,
    phrase: 'Come to light',
    meaningEn: 'Become known',
    meaningBn: 'প্রকাশিত হওয়া',
    example: 'At last, their private talk has come to light.',
  },
  {
    id: 37,
    phrase: 'Crocodile tears',
    meaningEn: 'Pretend cry',
    meaningBn: 'ভান করা কান্না',
    example: 'He shed crocodile tears at our misery.',
  },
  {
    id: 38,
    phrase: 'Cock and bull story',
    meaningEn: 'Absurd story',
    meaningBn: 'আজগুবি গল্প',
    example: 'Who will believe your cock and bull story?',
  },
  {
    id: 39,
    phrase: 'Caught red-handed',
    meaningEn: 'Caught with stolen goods',
    meaningBn: 'হাতেনাতে ধরা',
    example: 'The thief was caught red-handed.',
  },
  {
    id: 40,
    phrase: 'Crying need',
    meaningEn: 'Urgent need',
    meaningBn: 'অতীব প্রয়োজন',
    example: 'Mass education is the crying need of Bangladesh.',
  },
  {
    id: 41,
    phrase: 'Cut a sorry figure',
    meaningEn: 'Make bad result',
    meaningBn: 'খারাপ ফল করা',
    example: 'He cut a sorry figure in the exam.',
  },
  {
    id: 42,
    phrase: 'Call a spade a spade',
    meaningEn: 'Speak plainly',
    meaningBn: 'স্পষ্টভাবে বলা',
    example: 'I have no hesitation in calling a spade a spade.',
  },
  {
    id: 43,
    phrase: 'Dog days',
    meaningEn: 'Hot weather',
    meaningBn: 'প্রচণ্ড গরমের সময়',
    example: 'We rest during the dog days of summer.',
  },
  {
    id: 44,
    phrase: 'Die in harness',
    meaningEn: 'Die while in service',
    meaningBn: 'কর্মরত অবস্থায় মৃত্যু',
    example: 'Mr. Komol died in harness.',
  },
  {
    id: 45,
    phrase: 'Dead language',
    meaningEn: 'No longer spoken',
    meaningBn: 'মৃত ভাষা',
    example: 'Latin is a well-known dead language.',
  },
  {
    id: 46,
    phrase: 'Dead against',
    meaningEn: 'Bitterly against',
    meaningBn: 'কঠোরভাবে বিরোধী',
    example: 'He is dead against me.',
  },
  {
    id: 47,
    phrase: 'Dead of night',
    meaningEn: 'Midnight',
    meaningBn: 'গভীর রাত',
    example: 'Jubayer came to me at dead of night.',
  },
  {
    id: 48,
    phrase: 'Dark horse',
    meaningEn: 'Unexpected winner',
    meaningBn: 'অপ্রত্যাশিত বিজয়ী',
    example: 'The movie is a dark horse for the award.',
  },
  {
    id: 49,
    phrase: 'Dead letter',
    meaningEn: 'Law not in force',
    meaningBn: 'অকার্যকর আইন',
    example: 'That rule is now a dead letter.',
  },
  {
    id: 50,
    phrase: 'Dead ringer',
    meaningEn: 'Duplicate',
    meaningBn: 'হুবহু অনুরূপ ব্যক্তি',
    example: 'She is a dead ringer for her mother.',
  },
  {
    id: 51,
    phrase: 'Down and out',
    meaningEn: 'Destitute',
    meaningBn: 'নিঃস্ব',
    example: 'The homeless man looked down and out.',
  },
  {
    id: 52,
    phrase: 'End in smoke',
    meaningEn: 'Fail',
    meaningBn: 'ব্যর্থ হওয়া',
    example: 'All his plans ended in smoke.',
  },
  {
    id: 53,
    phrase: 'Flesh and blood',
    meaningEn: 'Human body',
    meaningBn: 'মানবদেহ',
    example: 'Flesh and blood cannot bear such insults.',
  },
  {
    id: 54,
    phrase: 'For good',
    meaningEn: 'Forever',
    meaningBn: 'চিরতরে',
    example: 'He left the place for good.',
  },
  {
    id: 55,
    phrase: 'Far and near / Far and wide',
    meaningEn: 'Everywhere',
    meaningBn: 'সর্বত্র',
    example: 'Newton is famous far and near.',
  },
  {
    id: 56,
    phrase: 'From hand to mouth',
    meaningEn: 'Live by hard labour',
    meaningBn: 'কষ্টে জীবিকা নির্বাহ করা',
    example: 'He lives from hand to mouth.',
  },
  {
    id: 57,
    phrase: 'Fall flat',
    meaningEn: 'Have no effect',
    meaningBn: 'ফলহীন হওয়া',
    example: 'My advice fell flat on him.',
  },
  {
    id: 58,
    phrase: 'Fish out of water',
    meaningEn: 'Uneasy situation',
    meaningBn: 'অস্বস্তিকর অবস্থায়',
    example: 'I felt like a fish out of water there.',
  },
  {
    id: 59,
    phrase: 'From A to Z',
    meaningEn: 'From beginning to end',
    meaningBn: 'শুরু থেকে শেষ পর্যন্ত',
    example: 'The statement is true from A to Z.',
  },
  {
    id: 60,
    phrase: 'Fish in troubled water',
    meaningEn: 'Take advantage of disorder',
    meaningBn: 'অস্থির অবস্থায় সুযোগ নেওয়া',
    example: 'He fishes in troubled water.',
  },
  {
    id: 61,
    phrase: 'Gala day',
    meaningEn: 'Festive day',
    meaningBn: 'উৎসবমুখর দিন',
    example: 'People enjoy a lot on a gala day.',
  },
  {
    id: 62,
    phrase: 'Get rid of',
    meaningEn: 'Be free from',
    meaningBn: 'মুক্ত হওয়া',
    example: 'I want to get rid of this problem.',
  },
  {
    id: 63,
    phrase: 'Gift of the gab',
    meaningEn: 'Fluency in speech',
    meaningBn: 'বাকপটুতার ক্ষমতা',
    example: 'She has the gift of the gab.',
  },
  {
    id: 64,
    phrase: 'Hold good',
    meaningEn: 'Be applicable',
    meaningBn: 'কার্যকর থাকা',
    example: 'The rule still holds good.',
  },
  {
    id: 65,
    phrase: 'Heart and soul',
    meaningEn: 'With all energy',
    meaningBn: 'সর্বান্তকরণে',
    example: 'He worked heart and soul.',
  },
  {
    id: 66,
    phrase: 'Hard and fast',
    meaningEn: 'Rigid',
    meaningBn: 'কঠোর',
    example: 'There is no hard and fast rule here.',
  },
  {
    id: 67,
    phrase: 'Hold water',
    meaningEn: 'Be valid',
    meaningBn: 'গ্রহণযোগ্য হওয়া',
    example: 'His excuse does not hold water.',
  },
  {
    id: 68,
    phrase: 'Herculean task',
    meaningEn: 'Very difficult task',
    meaningBn: 'কঠিন কাজ',
    example: 'Solving unemployment is a Herculean task.',
  },
  {
    id: 69,
    phrase: 'Hue and cry',
    meaningEn: 'Noise',
    meaningBn: 'হইচই',
    example: 'The thief ran away to avoid the hue and cry.',
  },
  {
    id: 70,
    phrase: 'Hush money',
    meaningEn: 'Bribe money',
    meaningBn: 'ঘুষের টাকা',
    example: 'He paid hush money.',
  },
  {
    id: 71,
    phrase: 'Household name',
    meaningEn: 'Familiar name',
    meaningBn: 'পরিচিত নাম',
    example: 'Einstein is a household name.',
  },
  {
    id: 72,
    phrase: 'In time',
    meaningEn: 'Proper time',
    meaningBn: 'যথাসময়ে',
    example: 'He reached the station in time.',
  },
  {
    id: 73,
    phrase: 'In black and white',
    meaningEn: 'In writing',
    meaningBn: 'লিখিতভাবে',
    example: 'He gave the promise in black and white.',
  },
  {
    id: 74,
    phrase: 'In lieu of',
    meaningEn: 'Instead of',
    meaningBn: 'পরিবর্তে',
    example: 'Give me a book in lieu of that.',
  },
  {
    id: 75,
    phrase: 'In a nutshell',
    meaningEn: 'Briefly',
    meaningBn: 'সংক্ষেপে',
    example: 'Tell the story in a nutshell.',
  },
  {
    id: 76,
    phrase: 'Ins and outs',
    meaningEn: 'Full details',
    meaningBn: 'খুঁটিনাটি বিষয়',
    example: 'I know the ins and outs of the matter.',
  },
  {
    id: 77,
    phrase: 'In the long run',
    meaningEn: 'Ultimately',
    meaningBn: 'শেষ পর্যন্ত',
    example: 'You will suffer in the long run.',
  },
  {
    id: 78,
    phrase: 'Lame excuse',
    meaningEn: 'Bad plea',
    meaningBn: 'অযৌক্তিক অজুহাত',
    example: 'This lame excuse will not do.',
  },
  {
    id: 79,
    phrase: 'Kith and kin',
    meaningEn: 'Near relatives',
    meaningBn: 'আত্মীয়স্বজন',
    example: 'I have no kith and kin.',
  },
  {
    id: 80,
    phrase: 'Irony of fate',
    meaningEn: 'By bad luck',
    meaningBn: 'ভাগ্যের পরিহাসে',
    example: 'He failed by irony of fate.',
  },
  {
    id: 81,
    phrase: 'In full swing',
    meaningEn: 'In full activity',
    meaningBn: 'পুরোদমে',
    example: 'The school is now in full swing.',
  },
  {
    id: 82,
    phrase: 'In a hurry',
    meaningEn: 'Very quickly',
    meaningBn: 'তাড়াহুড়ো করে',
    example: "Don't do the work in a hurry.",
  },
  {
    id: 83,
    phrase: 'In the teeth of',
    meaningEn: 'Facing difficulties',
    meaningBn: 'প্রতিকূলতার মধ্যেও',
    example: 'He succeeded in the teeth of difficulties.',
  },
  {
    id: 84,
    phrase: 'Man of letters',
    meaningEn: 'A scholar',
    meaningBn: 'পণ্ডিত ব্যক্তি',
    example: 'He is a man of letters.',
  },
  {
    id: 85,
    phrase: 'Man of straw',
    meaningEn: 'Worthless man',
    meaningBn: 'তুচ্ছ ব্যক্তি',
    example: 'He is a man of straw.',
  },
  {
    id: 86,
    phrase: 'Maiden speech',
    meaningEn: 'First speech',
    meaningBn: 'প্রথম বক্তৃতা',
    example: 'He gave his maiden speech.',
  },
  {
    id: 87,
    phrase: 'Null and void',
    meaningEn: 'Invalid',
    meaningBn: 'অকার্যকর',
    example: 'The contract is null and void.',
  },
  {
    id: 88,
    phrase: 'Nip in the bud',
    meaningEn: 'Destroy in the initial stage',
    meaningBn: 'অঙ্কুরেই দমন করা',
    example: 'All his hopes were nipped in the bud.',
  },
  {
    id: 89,
    phrase: 'Now and then',
    meaningEn: 'Occasionally',
    meaningBn: 'মাঝে মাঝে',
    example: 'He comes here now and then.',
  },
  {
    id: 90,
    phrase: 'Out of date',
    meaningEn: 'Out of fashion',
    meaningBn: 'পুরনো ধাঁচের',
    example: 'This fashion is now out of date.',
  },
  {
    id: 91,
    phrase: 'Out of the wood',
    meaningEn: 'Free from danger',
    meaningBn: 'বিপদমুক্ত',
    example: 'He is not yet out of the wood.',
  },
  {
    id: 92,
    phrase: 'Out of doors',
    meaningEn: 'Outside',
    meaningBn: 'বাইরে',
    example: 'It is rather cold out of doors.',
  },
  {
    id: 93,
    phrase: 'Out of sorts',
    meaningEn: 'Not well',
    meaningBn: 'অসুস্থ বা বিষণ্ণ',
    example: 'He is out of sorts now.',
  },
  {
    id: 94,
    phrase: 'Out of order',
    meaningEn: 'Defective',
    meaningBn: 'বিকল',
    example: 'The car is out of order.',
  },
  {
    id: 95,
    phrase: 'Out of temper',
    meaningEn: 'Angry',
    meaningBn: 'রেগে যাওয়া',
    example: 'He is now out of temper.',
  },
  {
    id: 96,
    phrase: 'On the whole',
    meaningEn: 'Generally speaking',
    meaningBn: 'সর্বোপরি',
    example: 'On the whole, his conduct is good.',
  },
  {
    id: 97,
    phrase: 'Part and parcel',
    meaningEn: 'Integral part',
    meaningBn: 'অবিচ্ছেদ্য অংশ',
    example: 'Ambition is part and parcel of life.',
  },
  {
    id: 98,
    phrase: 'Pros and cons',
    meaningEn: 'Details',
    meaningBn: 'পক্ষে ও বিপক্ষে বিষয়',
    example: 'I know the pros and cons of the matter.',
  },
  {
    id: 99,
    phrase: 'Red-letter day',
    meaningEn: 'Memorable day',
    meaningBn: 'স্মরণীয় দিন',
    example: 'The 5th August is a red-letter day in our history.',
  },
  {
    id: 100,
    phrase: 'Rank and file',
    meaningEn: 'Common people',
    meaningBn: 'সাধারণ মানুষ',
    example: 'The leader spoke to the rank and file.',
  },
  {
    id: 101,
    phrase: 'Round the clock',
    meaningEn: 'Twenty-four hours',
    meaningBn: 'চব্বিশ ঘণ্টা',
    example: 'He is working round the clock.',
  },
  {
    id: 102,
    phrase: 'Red tape',
    meaningEn: 'Official formalities',
    meaningBn: 'প্রশাসনিক জটিলতা',
    example: 'Red tapism causes delay in work.',
  },
  {
    id: 103,
    phrase: 'Steer clear of',
    meaningEn: 'Avoid',
    meaningBn: 'এড়িয়ে চলা',
    example: 'You must steer clear of bad company.',
  },
  {
    id: 104,
    phrase: 'Slow coach',
    meaningEn: 'Lazy person',
    meaningBn: 'ধীর কর্মী',
    example: "Don't be a slow coach.",
  },
  {
    id: 105,
    phrase: 'Slip of the pen',
    meaningEn: 'Minor writing mistake',
    meaningBn: 'লেখার ছোট ভুল',
    example: 'It was a slip of the pen.',
  },
  {
    id: 106,
    phrase: 'Slip of the tongue',
    meaningEn: 'Mistake in speaking',
    meaningBn: 'বলার ভুল',
    example: 'It was just a slip of the tongue.',
  },
  {
    id: 107,
    phrase: 'Tooth and nail',
    meaningEn: 'Strongly',
    meaningBn: 'আপ্রাণ',
    example: 'He fought tooth and nail against his enemy.',
  },
  {
    id: 108,
    phrase: 'Through thick and thin',
    meaningEn: 'Through all difficulties',
    meaningBn: 'সুখে-দুঃখে',
    example: 'She followed her husband through thick and thin.',
  },
  {
    id: 109,
    phrase: 'To the backbone',
    meaningEn: 'Completely',
    meaningBn: 'সম্পূর্ণভাবে',
    example: 'The boy is wicked to the backbone.',
  },
  {
    id: 110,
    phrase: 'To the letter',
    meaningEn: 'In all details',
    meaningBn: 'যথাযথভাবে',
    example: 'He followed my advice to the letter.',
  },
  {
    id: 111,
    phrase: 'Turn down',
    meaningEn: 'Refuse',
    meaningBn: 'প্রত্যাখ্যান করা',
    example: 'He turned down my proposal.',
  },
  {
    id: 112,
    phrase: 'Up and doing',
    meaningEn: 'Active',
    meaningBn: 'কর্মঠ',
    example: 'The boy is always up and doing.',
  },
  {
    id: 113,
    phrase: 'Ups and downs',
    meaningEn: 'Rises and falls',
    meaningBn: 'উত্থান-পতন',
    example: 'There are ups and downs in life.',
  },
  {
    id: 114,
    phrase: 'Weal and woe',
    meaningEn: 'Joy and sorrow',
    meaningBn: 'সুখ-দুঃখ',
    example: 'Life is full of weal and woe.',
  },
  {
    id: 115,
    phrase: 'White elephant',
    meaningEn: 'Costly but useless thing',
    meaningBn: 'ব্যয়বহুল কিন্তু অকেজো বস্তু',
    example: 'The old house is a white elephant.',
  },
  {
    id: 116,
    phrase: 'A far cry',
    meaningEn: 'Very different',
    meaningBn: 'অনেক ভিন্ন',
    example: 'We are a far cry from that.',
  },
  {
    id: 117,
    phrase: 'All the same',
    meaningEn: 'Indifferent',
    meaningBn: 'কোনো পার্থক্য নেই',
    example: 'It is all the same to me.',
  },
  {
    id: 118,
    phrase: 'At home',
    meaningEn: 'Skilled',
    meaningBn: 'দক্ষ',
    example: 'Both her children are still alive at home.',
  },
  {
    id: 119,
    phrase: 'Big gun',
    meaningEn: 'Important person',
    meaningBn: 'প্রভাবশালী ব্যক্তি',
    example: 'He is a big gun in our locality.',
  },
  {
    id: 120,
    phrase: 'Birds eye view',
    meaningEn: 'Overall view',
    meaningBn: 'সামগ্রিক দৃষ্টি',
    example: 'We got a birds eye view of the city from the hilltop.',
  },
  {
    id: 121,
    phrase: 'By leaps and bounds',
    meaningEn: 'Rapidly',
    meaningBn: 'দ্রুত',
    example: 'His business is growing by leaps and bounds.',
  },
  {
    id: 122,
    phrase: 'Carry the day',
    meaningEn: 'Be successful',
    meaningBn: 'সফল হওয়া',
    example: 'His idea carried the day in the meeting.',
  },
  {
    id: 123,
    phrase: 'Come by',
    meaningEn: 'Obtain',
    meaningBn: 'পাওয়া',
    example: "Good opportunities don't come by easily.",
  },
  {
    id: 124,
    phrase: 'Call up',
    meaningEn: 'Telephone',
    meaningBn: 'ফোন করা',
    example: 'I will call up my friend tonight.',
  },
  {
    id: 125,
    phrase: 'Come into force',
    meaningEn: 'Start to be effective',
    meaningBn: 'কার্যকর হওয়া',
    example: 'The new law will come into force next month.',
  },
  {
    id: 126,
    phrase: 'In front of',
    meaningEn: 'Ahead of',
    meaningBn: 'সামনে',
    example: 'He stood in front of the class.',
  },
  {
    id: 127,
    phrase: 'In good faith',
    meaningEn: 'Honestly',
    meaningBn: 'ভালো বিশ্বাসে',
    example: 'He acted in good faith while signing the contract.',
  },
  {
    id: 128,
    phrase: 'In spite of',
    meaningEn: 'Despite',
    meaningBn: 'সত্ত্বেও',
    example: 'She passed the exam in spite of her illness.',
  },
  {
    id: 129,
    phrase: 'Live on',
    meaningEn: 'Depend on',
    meaningBn: 'জীবিকা নির্বাহ করা',
    example: 'Many people live on farming.',
  },
  {
    id: 130,
    phrase: 'Keep an eye on',
    meaningEn: 'Watch carefully',
    meaningBn: 'নজর রাখা',
    example: 'Keep an eye on the baby while I cook.',
  },
  {
    id: 131,
    phrase: 'Run out',
    meaningEn: 'Finish',
    meaningBn: 'শেষ হয়ে যাওয়া',
    example: 'We have run out of sugar.',
  },
  {
    id: 132,
    phrase: 'Red handed',
    meaningEn: 'Caught while doing wrong',
    meaningBn: 'হাতেনাতে ধরা',
    example: 'The thief was caught red handed.',
  },
  {
    id: 133,
    phrase: 'Off and on',
    meaningEn: 'Occasionally',
    meaningBn: 'মাঝে মাঝে',
    example: 'It rained off and on all day.',
  },
  {
    id: 134,
    phrase: 'Point blank',
    meaningEn: 'Directly',
    meaningBn: 'সরাসরি',
    example: 'He refused point blank to help us.',
  },
  {
    id: 135,
    phrase: 'Safe and sound',
    meaningEn: 'Unharmed',
    meaningBn: 'নিরাপদে',
    example: 'They reached home safe and sound.',
  },
  {
    id: 136,
    phrase: 'Sitting duck',
    meaningEn: 'Vulnerable',
    meaningBn: 'সহজ শিকার',
    example: 'Without protection, the soldiers were sitting ducks.',
  },
  {
    id: 137,
    phrase: 'Take after',
    meaningEn: 'Resemble',
    meaningBn: 'কারো মতো হওয়া',
    example: 'She takes after her mother in looks.',
  },
  {
    id: 138,
    phrase: 'Take off',
    meaningEn: 'Remove or depart',
    meaningBn: 'খুলে নেওয়া বা উড়ে যাওয়া',
    example: 'The plane will take off at 9 a.m.',
  },
  {
    id: 139,
    phrase: 'Throw cold water',
    meaningEn: 'Discourage',
    meaningBn: 'উৎসাহ কমানো',
    example: "Don't throw cold water on his idea.",
  },
  {
    id: 140,
    phrase: 'Take into account',
    meaningEn: 'Consider',
    meaningBn: 'বিবেচনায় নেওয়া',
    example: 'You should take his opinion into account.',
  },
  {
    id: 141,
    phrase: 'Take the chair',
    meaningEn: 'Preside',
    meaningBn: 'সভা পরিচালনা করা',
    example: 'The principal took the chair during the meeting.',
  },
  {
    id: 142,
    phrase: 'Wear and tear',
    meaningEn: 'Damage from use',
    meaningBn: 'ব্যবহারজনিত ক্ষয়',
    example: 'The old car shows signs of wear and tear.',
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function filterIdiomsByRange(range: IdiomRangeFilter): IdiomItem[] {
  if (range === '1-35') return idiomsData.filter((i) => i.id >= 1 && i.id <= 35);
  if (range === '36-70') return idiomsData.filter((i) => i.id >= 36 && i.id <= 70);
  if (range === '71-105') return idiomsData.filter((i) => i.id >= 71 && i.id <= 105);
  if (range === '106-142') return idiomsData.filter((i) => i.id >= 106 && i.id <= 142);
  return idiomsData;
}

function formatOptionLabel(item: IdiomItem, style: IdiomMcqStyle): string {
  if (style === 'en_only') return item.meaningEn;
  if (style === 'bn_only') return item.meaningBn;
  return `${item.meaningEn} (${item.meaningBn})`;
}

export function generateIdiomsQuiz(
  count: number = 15,
  range: IdiomRangeFilter = 'all',
  style: IdiomMcqStyle = 'both'
): IdiomQuizQuestion[] {
  const source = filterIdiomsByRange(range);
  const validCount = Math.max(1, Math.min(source.length, count));
  const selected = shuffleArray(source).slice(0, validCount);

  return selected.map((item, idx) => {
    const correctOption = formatOptionLabel(item, style);

    const distractorPool = idiomsData.filter(
      (other) =>
        other.id !== item.id &&
        other.meaningEn.toLowerCase() !== item.meaningEn.toLowerCase() &&
        other.meaningBn !== item.meaningBn
    );

    const distractors = shuffleArray(distractorPool)
      .slice(0, 3)
      .map((d) => formatOptionLabel(d, style));

    const allOptions = shuffleArray([correctOption, ...distractors]) as [
      string,
      string,
      string,
      string,
    ];
    const correctAnswerIndex = allOptions.indexOf(correctOption);

    const questionText =
      style === 'en_only'
        ? `What is the correct meaning of the idiom "${item.phrase}"?`
        : style === 'bn_only'
        ? `"${item.phrase}" — এই Idiom/Phrase-টির সঠিক বাংলা অর্থ কোনটি?`
        : `"${item.phrase}" — এর সঠিক অর্থ কোনটি?`;

    const explanation = `"${item.phrase}" অর্থ: ${item.meaningEn} (${item.meaningBn})। উদাহরণ: ${item.example}`;

    return {
      id: `idiom_q_${item.id}_${idx}`,
      idiomId: item.id,
      phrase: item.phrase,
      meaningEn: item.meaningEn,
      meaningBn: item.meaningBn,
      example: item.example,
      questionText,
      options: allOptions,
      correctAnswerIndex,
      explanation,
    };
  });
}

export function generateIdiomsRecall(
  count: number = 15,
  direction: IdiomRecallDirection = 'phrase_to_meaning',
  range: IdiomRangeFilter = 'all'
): IdiomRecallQuestion[] {
  const source = filterIdiomsByRange(range);
  const validCount = Math.max(1, Math.min(source.length, count));
  const selected = shuffleArray(source).slice(0, validCount);

  return selected.map((item, idx) => {
    const actualDirection: 'phrase_to_meaning' | 'meaning_to_phrase' =
      direction === 'mixed'
        ? idx % 2 === 0
          ? 'phrase_to_meaning'
          : 'meaning_to_phrase'
        : direction;

    if (actualDirection === 'phrase_to_meaning') {
      return {
        id: `idiom_rec_${item.id}_${idx}`,
        idiomId: item.id,
        direction: 'phrase_to_meaning',
        promptTitle: item.phrase,
        promptSubtitle: `ক্রমিক #${item.id} • মনে মনে সঠিক ইংরেজি ও বাংলা অর্থ চিন্তা করুন`,
        phrase: item.phrase,
        meaningEn: item.meaningEn,
        meaningBn: item.meaningBn,
        example: item.example,
      };
    } else {
      return {
        id: `idiom_rec_${item.id}_${idx}`,
        idiomId: item.id,
        direction: 'meaning_to_phrase',
        promptTitle: `${item.meaningEn} (${item.meaningBn})`,
        promptSubtitle: `ক্রমিক #${item.id} • মনে মনে সঠিক Idiom/Phrase চিন্তা করুন`,
        phrase: item.phrase,
        meaningEn: item.meaningEn,
        meaningBn: item.meaningBn,
        example: item.example,
      };
    }
  });
}
