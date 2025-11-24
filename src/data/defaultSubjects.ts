export interface SubjectTemplate {
  nameKh: string;
  nameEn: string;
  code: string;
  category: "social" | "science"; // ✅ Only 2 categories
  maxScores: {
    [grade: string]: {
      science?: number;
      social?: number;
      default?: number;
    };
  };
  description?: string;
}

export const defaultSubjects: SubjectTemplate[] = [
  // ថ្នាក់ទី 7 និង 8
  {
    nameKh: "តែងសេចក្តី",
    nameEn: "Writer",
    code: "WRITER",
    category: "social", // ✅ Changed from "core"
    maxScores: {
      "7": { default: 60 },
      "8": { default: 60 },
    },
  },
  {
    nameKh: "សរសេរតាមអាន",
    nameEn: "Writing",
    code: "WRITING",
    category: "social", // ✅ Changed from "core"
    maxScores: {
      "7": { default: 40 },
      "8": { default: 40 },
    },
  },
  {
    nameKh: "អក្សរសាស្ត្រខ្មែរ",
    nameEn: "Khmer Literature",
    code: "KHM",
    category: "social", // ✅ Changed from "core"
    maxScores: {
      "9": { default: 100 },
      "10": { default: 150 },
      "11": { default: 75 },
      "12": { science: 75, social: 125 },
    },
  },
  {
    nameKh: "គណិតវិទ្យា",
    nameEn: "Math",
    code: "MATH",
    category: "science", // ✅ Changed from "core"
    maxScores: {
      "7": { default: 100 },
      "8": { default: 100 },
      "9": { default: 100 },
      "10": { default: 150 },
      "11": { default: 125 },
      "12": { science: 125, social: 75 },
    },
  },
  {
    nameKh: "រូបវិទ្យា",
    nameEn: "Physics",
    code: "PHY",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 75 },
      "12": { science: 75, social: 50 },
    },
  },
  {
    nameKh: "គីមីវិទ្យា",
    nameEn: "Chemistry",
    code: "CHEM",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 37 },
      "11": { default: 75 },
      "12": { science: 75, social: 50 },
    },
  },
  {
    nameKh: "ជីវវិទ្យា",
    nameEn: "Biology",
    code: "BIO",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 75 },
      "12": { default: 75 },
    },
  },
  {
    nameKh: "ផែនដីវិទ្យា",
    nameEn: "Earth Science",
    code: "EARTH",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "10": { default: 25 },
      "11": { default: 50 },
      "12": { science: 50, social: 50 },
    },
  },
  {
    nameKh: "សីលធម៌-ពលរដ្ឋវិជ្ជា",
    nameEn: "Moral Education - Civics",
    code: "MORAL",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 38 },
      "11": { default: 50 },
      "12": { science: 50, social: 75 },
    },
  },
  {
    nameKh: "ភូមិវិទ្យា",
    nameEn: "Geography",
    code: "GEO",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 38 },
      "11": { default: 50 },
      "12": { science: 50, social: 75 },
    },
  },
  {
    nameKh: "ប្រវត្តិវិទ្យា",
    nameEn: "History",
    code: "HIST",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 37 },
      "11": { default: 50 },
      "12": { science: 50, social: 75 },
    },
  },
  {
    nameKh: "ភាសាអង់គ្លេស",
    nameEn: "English",
    code: "ENG",
    category: "social", // ✅ Changed from "core"
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 100 },
      "11": { default: 100 },
      "12": { science: 50, social: 50 },
    },
  },
  {
    nameKh: "គេហវិទ្យា",
    nameEn: "HE",
    code: "HE",
    category: "social", // ✅ Changed from "other"
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
    },
  },
  {
    nameKh: "កីឡា",
    nameEn: "Sports",
    code: "SPORTS",
    category: "social", // ✅ Changed from "other"
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "10": { default: 50 },
      "11": { default: 50 },
    },
  },
  {
    nameKh: "កសិកម្ម",
    nameEn: "Agriculture",
    code: "AGRI",
    category: "science", // ✅ Changed from "technology"
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "10": { default: 50 },
      "11": { default: 50 },
    },
  },
  {
    nameKh: "ព័ត៌មានវិទ្យា",
    nameEn: "ICT",
    code: "ICT",
    category: "science", // ✅ Changed from "technology"
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 50 },
      "12": { science: 50, social: 50 },
    },
  },
  {
    nameKh: "សេដ្ឋកិច្ច",
    nameEn: "Economics",
    code: "ECON",
    category: "social", // ✅ Changed from "other"
    maxScores: {
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 55 },
      "12": { default: 50 },
    },
  },
];

/**
 * Generate subjects for a specific grade and track
 */
export function generateSubjectsForGrade(
  grade: string,
  track?: "science" | "social"
): Partial<Subject>[] {
  return defaultSubjects
    .filter((template) => template.maxScores[grade])
    .map((template) => {
      const maxScoreConfig = template.maxScores[grade];
      let maxScore = maxScoreConfig.default || 50;

      // Apply track-specific scores
      if (track && maxScoreConfig[track]) {
        maxScore = maxScoreConfig[track];
      }

      return {
        nameKh: template.nameKh,
        nameEn: template.nameEn,
        name: template.nameKh,
        code: `${template.code}-G${grade}${
          track ? `-${track.toUpperCase()}` : ""
        }`,
        category: template.category,
        grade: grade,
        track: track,
        weeklyHours: 0, // To be configured
        annualHours: 0, // To be configured
        isActive: true,
      };
    });
}

/**
 * Get all unique grades from default subjects
 */
export function getAvailableGrades(): string[] {
  const grades = new Set<string>();
  defaultSubjects.forEach((subject) => {
    Object.keys(subject.maxScores).forEach((grade) => grades.add(grade));
  });
  return Array.from(grades).sort();
}

/**
 * Get subjects count by grade
 */
export function getSubjectsCountByGrade(grade: string): number {
  return defaultSubjects.filter((s) => s.maxScores[grade]).length;
}
