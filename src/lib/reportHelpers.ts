// Month options - MUST use Khmer names
export const monthOptions = [
  { value: "មករា", label: "មករា (January)" },
  { value: "កុម្ភៈ", label: "ឆមាសទី១ (First Semester)" },
  { value: "មីនា", label: "មីនា (March)" },
  { value: "មេសា", label: "មេសា (April)" },
  { value: "ឧសភា", label: "ឧសភា (May)" },
  { value: "មិថុនា", label: "មិថុនា (June)" },
  { value: "កក្កដា", label: "កក្កដា (July)" },
  { value: "សីហា", label: "សីហា (August)" },
  { value: "កញ្ញា", label: "កញ្ញា (September)" },
  { value: "តុលា", label: "តុលា (October)" },
  { value: "វិច្ឆិកា", label: "វិច្ឆិកា (November)" },
  { value: "ធ្នូ", label: "ធ្នូ (December)" },
];

// ✅ Get current Khmer month
export const getCurrentKhmerMonth = (): string => {
  const months = [
    "មករា",
    "កុម្ភៈ",
    "មីនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
  ];
  const currentMonthIndex = new Date().getMonth();
  return months[currentMonthIndex];
};

export const getMonthName = (monthNumber: string): string => {
  const months = [
    "មករា",
    "កុម្ភៈ",
    "មីនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
  ];
  const index = parseInt(monthNumber) - 1;
  return months[index] || monthNumber;
};

export const getMonthDisplayName = (month: string, grade?: string): string => {
  const trimmedMonth = month.trim();
  if (trimmedMonth === "កុម្ភៈ") return "ឆមាសទី១";
  if (trimmedMonth === "កក្កដា" && grade && ["7", "8", "10", "11"].includes(grade.toString())) {
    return "ឆមាសទី២";
  }
  return month;
};

export const getDynamicMonthOptions = (grade?: string) => {
  const isSpecialGrade = grade && ["7", "8", "10", "11"].includes(grade.toString());
  return monthOptions.map((option) => {
    if (option.value === "កក្កដា" && isSpecialGrade) {
      return { ...option, label: "ឆមាសទី២ (Second Semester)" };
    }
    return option;
  });
};

export const getMonthNumber = (khmerMonth: string): number => {
  const months = [
    "មករា",
    "កុម្ភៈ",
    "មីនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
  ];
  return months.indexOf(khmerMonth) + 1;
};

// Subject abbreviations
export const getSubjectAbbr = (subjectName: string): string => {
  const abbr: { [key: string]: string } = {
    តែងសេចក្តី: "តែង",
    សរសេរតាមអាន: "ស.  អាន",
    គណិតវិទ្យា: "គណិត",
    រូបវិទ្យា: "រូប",
    គីមីវិទ្យា: "គីមី",
    ជីវវិទ្យា: "ជីវៈ",
    ផែនដីវិទ្យា: "ផែនដី",
    "សីលធម៌-ពលរដ្ឋវិជ្ជា": "សីលធម៌",
    ភូមិវិទ្យា: "ភូមិ",
    ប្រវត្តិវិទ្យា: "ប្រវត្តិ",
    ភាសាអង់គ្លេស: "អង់គ្លេស",
    គេហវិទ្យា: "គេហ",
    កីឡា: "កីឡា",
    កសិកម្ម: "កសិកម្ម",
    ព័ត៌មានវិទ្យា: "ICT",
    ភាសាខ្មែរ: "ខ្មែរ",
  };
  return abbr[subjectName] || subjectName;
};

// Report type options
export const reportTypeOptions = [
  { value: "monthly", label: "របាយការណ៍ប្រចាំខែ Monthly Report" },
  { value: "statistics", label: "របាយការណ៍ស្ថិតិ Statistics" },
  { value: "honor", label: "តារាងកិត្តិយស Honor Certificate" },
];

// Certificate templates
export const certificateTemplates = [
  { value: "template1", label: "គំរូទី១ - Classic Gold" },
  { value: "template2", label: "គំរូទី២ - Modern Blue" },
  { value: "template3", label: "គំរូទី៣ - Elegant Purple" },
  { value: "template4", label: "គំរូទី៤ - Royal Red" },
  { value: "template5", label: "គំរូទី៥ - Fresh Green" },
];

// Medal emoji for top students
export const getMedalEmoji = (rank: number): string => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
};
