// Helper functions for reports

export const getSubjectAbbr = (subjectName: string): string => {
  const abbrMap: { [key: string]: string } = {
    គណិតវិទ្យា: "M",
    Mathematics: "M",
    ខ្មែរ: "K",
    Khmer: "K",
    អង់គ្លេស: "E",
    English: "E",
    រូបវិទ្យា: "P",
    Physics: "P",
    គីមីវិទ្យា: "C",
    Chemistry: "C",
    ជីវវិទ្យា: "B",
    Biology: "B",
    បច្ចេកវិទ្យា: "IT",
    Technology: "IT",
    វិទ្យាសាស្ត្រ: "S",
    Science: "S",
    ប្រវត្តិសាស្ត្រ: "H",
    History: "H",
    ភូមិសាស្ត្រ: "G",
    Geography: "G",
    កីឡា: "PE",
    "Physical Education": "PE",
  };

  if (abbrMap[subjectName]) return abbrMap[subjectName];
  for (const [key, value] of Object.entries(abbrMap)) {
    if (subjectName.includes(key) || key.includes(subjectName)) return value;
  }
  return subjectName
    .substring(0, Math.min(3, subjectName.length))
    .toUpperCase();
};

export const getMonthName = (month: string): string => {
  const months: { [key: string]: string } = {
    "1": "មករា",
    "2": "កុម្ភៈ",
    "3": "មីនា",
    "4": "មេសា",
    "5": "ឧសភា",
    "6": "មិថុនា",
    "7": "កក្កដា",
    "8": "សីហា",
    "9": "កញ្ញា",
    "10": "តុលា",
    "11": "វិច្ឆិកា",
    "12": "ធ្នូ",
  };
  return months[month] || "មករា";
};

export const getMedalEmoji = (rank: number): string => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
};

export const monthOptions = [
  { value: "1", label: "មករា - January" },
  { value: "2", label: "កុម្ភៈ - February" },
  { value: "3", label: "មីនា - March" },
  { value: "4", label: "មេសា - April" },
  { value: "5", label: "ឧសភា - May" },
  { value: "6", label: "មិថុនា - June" },
  { value: "7", label: "កក្កដា - July" },
  { value: "8", label: "សីហា - August" },
  { value: "9", label: "កញ្ញា - September" },
  { value: "10", label: "តុលា - October" },
  { value: "11", label: "វិច្ឆិកា - November" },
  { value: "12", label: "ធ្នូ - December" },
];

export const reportTypeOptions = [
  { value: "monthly", label: "លទ្ធផលប្រចាំខែ - Monthly Results" },
  { value: "honor", label: "តារាងកិត្តិយស - Honor Roll" },
  { value: "statistics", label: "ស្ថិតិថ្នាក់ - Class Statistics" },
];

export const certificateTemplates = [
  { value: "template1", label: "គំរូទី១ - មេដាយមាស Gold Medal" },
  { value: "template2", label: "គំរូទី២ - ពានរង្វាន់ Trophy" },
  { value: "template3", label: "គំរូទី៣ - ទំនើប Modern" },
  { value: "template4", label: "គំរូទី៤ - ស្រស់ស្អាត Elegant" },
  { value: "template5", label: "គំរូទី៥ - ប្រណីត Premium" },
];
