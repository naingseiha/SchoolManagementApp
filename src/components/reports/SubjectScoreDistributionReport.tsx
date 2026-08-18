"use client";

import React, { useMemo } from "react";

export const SCORE_INTERVALS = [
  { key: "0", label: "0", min: 0, max: 0, isZero: true },
  { key: "1-10", label: "1 - 10", min: 0.0001, max: 10 },
  { key: "11-20", label: "11 - 20", min: 10.0001, max: 20 },
  { key: "21-30", label: "21 - 30", min: 20.0001, max: 30 },
  { key: "31-40", label: "31 - 40", min: 30.0001, max: 40 },
  { key: "41-50", label: "41 - 50", min: 40.0001, max: 50 },
  { key: "51-60", label: "51 - 60", min: 50.0001, max: 60 },
  { key: "61-70", label: "61 - 70", min: 60.0001, max: 70 },
  { key: "71-80", label: "71 - 80", min: 70.0001, max: 80 },
  { key: "81-90", label: "81 - 90", min: 80.0001, max: 90 },
  { key: "91-100", label: "91 - 100", min: 90.0001, max: 100 },
  { key: "101-110", label: "101 - 110", min: 100.0001, max: 110 },
  { key: "111-120", label: "111 - 120", min: 110.0001, max: 120 },
  { key: "121-130", label: "121 - 130", min: 120.0001, max: 130 },
  { key: "131-140", label: "131 - 140", min: 130.0001, max: 140 },
  { key: "141-150", label: "141 - 150", min: 140.0001, max: 150 },
];

export interface SubjectScoreDistributionProps {
  students: any[];
  subjects: Array<{
    id: string;
    nameKh: string;
    nameEn?: string;
    code?: string;
    maxScore: number;
    coefficient?: number;
    track?: string | null;
  }>;
  selectedClass: any;
  selectedYear: number;
  schoolCode?: string;
  province?: string;
  district?: string;
  commune?: string;
  schoolName?: string;
  phoneNumber?: string;
  fillDate?: string;
  fillerName?: string;
  isScienceTrack?: boolean;
  isSocialTrack?: boolean;
}

export const STANDARD_DISTRIBUTION_SUBJECTS = [
  {
    order: 1,
    standardNameKh: "ភាសាខ្មែរ",
    matchKeys: [
      "ភាសាខ្មែរ",
      "ខ្មែរ",
      "KHM",
      "KHMER",
      "តែងសេចក្តី",
      "តែងសេចក្ដី",
      "តែង",
      "សរសេរតាមអាន",
      "ស.អាន",
      "ចំ.តាម",
      "WRITING",
      "WRITER",
      "DICTATION",
    ],
    defaultMaxScore: 100,
  },
  {
    order: 2,
    standardNameKh: "សីលធម៌-ពលរដ្ឋ",
    matchKeys: [
      "សីលធម៌-ពលរដ្ឋ",
      "សីលធម៌",
      "ពលរដ្ឋ",
      "ពលរដ្ឋវិទ្យា",
      "MORAL",
      "ETHICS",
      "CIVIC",
      "CIVICS",
    ],
    defaultMaxScore: 50,
  },
  {
    order: 3,
    standardNameKh: "ប្រវត្តិវិទ្យា",
    matchKeys: ["ប្រវត្តិវិទ្យា", "ប្រវត្តិ", "HIST", "HISTORY"],
    defaultMaxScore: 50,
  },
  {
    order: 4,
    standardNameKh: "ភូមិវិទ្យា",
    matchKeys: ["ភូមិវិទ្យា", "ភូមិ", "GEO", "GEOGRAPHY"],
    defaultMaxScore: 50,
  },
  {
    order: 5,
    standardNameKh: "គណិតវិទ្យា",
    matchKeys: ["គណិតវិទ្យា", "គណិត", "MATH", "MATHEMATICS"],
    defaultMaxScore: 100,
  },
  {
    order: 6,
    standardNameKh: "រូបវិទ្យា",
    matchKeys: ["រូបវិទ្យា", "រូប", "PHY", "PHYSICS"],
    defaultMaxScore: 50,
  },
  {
    order: 7,
    standardNameKh: "គីមីវិទ្យា",
    matchKeys: ["គីមីវិទ្យា", "គីមី", "CHEM", "CHEMISTRY"],
    defaultMaxScore: 50,
  },
  {
    order: 8,
    standardNameKh: "ជីវវិទ្យា",
    matchKeys: ["ជីវវិទ្យា", "ជីវៈ", "BIO", "BIOLOGY"],
    defaultMaxScore: 50,
  },
  {
    order: 9,
    standardNameKh: "ផែនដីវិទ្យា",
    matchKeys: [
      "ផែនដីវិទ្យា",
      "ផែនដី",
      "ផែនដីនិងបរិស្ថានវិទ្យា",
      "ផែនដី និងបរិស្ថានវិទ្យា",
      "ផែនដី និង បរិស្ថានវិទ្យា",
      "EARTH",
      "EARTH_SCIENCE",
    ],
    defaultMaxScore: 50,
  },
  {
    order: 10,
    standardNameKh: "ភាសាបរទេស",
    matchKeys: [
      "ភាសាបរទេស",
      "ភាសាអង់គ្លេស",
      "ភាសាបារាំង",
      "អង់គ្លេស",
      "បារាំង",
      "ភាសា",
      "ENG",
      "ENGLISH",
      "FR",
      "FRENCH",
      "FOREIGN",
      "FOREIGN_LANG",
    ],
    defaultMaxScore: 50,
  },
];

export const isExcludedSubject = (subject: any): boolean => {
  if (!subject) return false;
  const name = (subject.nameKh || subject.name || "").toString().trim().toLowerCase();
  const code = (subject.code || "").toString().trim().toUpperCase();

  // 1. NEVER exclude any of our 10 standard core subjects
  if (
    name.includes("ខ្មែរ") ||
    name.includes("តែង") ||
    name.includes("សរសេរ") ||
    name.includes("អាន") ||
    name.includes("គណិត") ||
    name.includes("រូប") ||
    name.includes("គីមី") ||
    name.includes("ជីវ") ||
    name.includes("ផែនដី") ||
    name.includes("សីលធម៌") ||
    name.includes("ពលរដ្ឋ") ||
    name.includes("ប្រវត្តិ") ||
    name.includes("ភូមិ") ||
    name.includes("អង់គ្លេស") ||
    name.includes("បារាំង") ||
    name.includes("បរទេស") ||
    code === "KHM" ||
    code === "KHMER" ||
    code === "WRITER" ||
    code === "WRITING" ||
    code === "DICTATION" ||
    code === "MATH" ||
    code === "PHY" ||
    code === "PHYSICS" ||
    code === "CHEM" ||
    code === "CHEMISTRY" ||
    code === "BIO" ||
    code === "BIOLOGY" ||
    code === "EARTH" ||
    code === "MORAL" ||
    code === "HIST" ||
    code === "HISTORY" ||
    code === "GEO" ||
    code === "ENG" ||
    code === "FR" ||
    code.startsWith("KHM") ||
    code.startsWith("WRI") ||
    code.startsWith("MAT") ||
    code.startsWith("PHY") ||
    code.startsWith("CHE") ||
    code.startsWith("BIO") ||
    code.startsWith("EAR") ||
    code.startsWith("MOR") ||
    code.startsWith("CIV") ||
    code.startsWith("HIS") ||
    code.startsWith("GEO") ||
    code.startsWith("ENG") ||
    code.startsWith("FR")
  ) {
    return false;
  }

  // 2. Exact excluded codes (Do NOT use substring matching on short codes)
  const exactExcludedCodes = [
    "AGRI",
    "AGRICULTURE",
    "HE",
    "HOMEMAKING",
    "HOME_ECONOMICS",
    "SPORTS",
    "SPORT",
    "PE",
    "PHYSICAL_EDUCATION",
    "ICT",
    "COMPUTER",
    "IT",
    "HLTH",
    "HEALTH",
    "HEALTH_EDUCATION",
  ];
  if (exactExcludedCodes.includes(code)) return true;

  // 3. Excluded code prefixes
  if (
    code.startsWith("AGR") ||
    code.startsWith("SPO") ||
    code.startsWith("ICT") ||
    code.startsWith("COMP") ||
    code.startsWith("HLT")
  ) {
    return true;
  }

  // 4. Excluded Khmer name keywords
  const excludedNameKeywords = [
    "កសិកម្ម",
    "គេហវិជ្ជា",
    "គេហវិទ្យា",
    "គេហ",
    "កីឡា",
    "អប់រំកាយ",
    "អប់រំកីឡា",
    "កុំព្យូទ័រ",
    "ពត៌មានវិទ្យា",
    "ព័ត៌មានវិទ្យា",
    "បច្ចេកវិទ្យាព័ត៌មាន",
    "សុខភាព",
    "អប់រំសុខភាព",
    "កម្មវិធីជីវភាព",
  ];
  return excludedNameKeywords.some((keyword) => name.includes(keyword.toLowerCase()));
};

export const isGrade789 = (selectedClass: any, subjects?: any[]): boolean => {
  const g = selectedClass?.grade?.toString().trim() || "";
  const name = selectedClass?.name?.toString().trim() || "";

  if (["7", "8", "9", "07", "08", "09", "៧", "៨", "៩"].includes(g)) return true;
  if (/ថ្នាក់ទី\s*[789៧៨៩]/i.test(name) || /Grade\s*[789]/i.test(name) || /^[789៧៨៩]/i.test(name)) return true;

  if (
    subjects &&
    subjects.some((s) => {
      const sName = (s.nameKh || s.name || s.code || "").toLowerCase();
      return (
        sName.includes("តែង") ||
        sName.includes("សរសេរ") ||
        sName.includes("dictation") ||
        sName.includes("writer")
      );
    })
  ) {
    return true;
  }

  return false;
};

export const getStandardSubjectIndex = (
  subject: any,
  isJuniorGrade: boolean = false
): number => {
  if (isExcludedSubject(subject)) return -1;

  const name = (subject.nameKh || subject.name || "").toString().trim().toLowerCase();
  const code = (subject.code || "").toString().trim().toUpperCase();

  // 1. Khmer (Slot 0 -> ភាសាខ្មែរ)
  // For Grades 7, 8, 9: តែងសេចក្តី and សរសេរតាមអាន (and ភាសាខ្មែរ / អក្សរសាស្ត្រខ្មែរ) all map to ភាសាខ្មែរ
  if (
    name.includes("ខ្មែរ") ||
    name.includes("តែង") ||
    name.includes("សរសេរ") ||
    name.includes("អាន") ||
    code === "KHM" ||
    code === "KHMER" ||
    code === "WRITING" ||
    code === "WRITER" ||
    code === "DICTATION" ||
    code.startsWith("KHM") ||
    code.startsWith("WRI")
  ) {
    return 0; // 1. ភាសាខ្មែរ
  }

  // 2. Morals - Civics (Slot 1 -> សីលធម៌-ពលរដ្ឋ)
  if (
    name.includes("សីលធម៌") ||
    name.includes("ពលរដ្ឋ") ||
    code === "MORAL" ||
    code === "ETHICS" ||
    code === "CIVIC" ||
    code === "CIVICS" ||
    code.startsWith("MOR") ||
    code.startsWith("CIV")
  ) {
    return 1; // 2. សីលធម៌-ពលរដ្ឋ
  }

  // 3. History (Slot 2 -> ប្រវត្តិវិទ្យា)
  if (
    name.includes("ប្រវត្តិ") ||
    code === "HIST" ||
    code === "HISTORY" ||
    code.startsWith("HIS")
  ) {
    return 2; // 3. ប្រវត្តិវិទ្យា
  }

  // 4. Geography (Slot 3 -> ភូមិវិទ្យា)
  if (
    name.includes("ភូមិ") ||
    code === "GEO" ||
    code === "GEOGRAPHY" ||
    code.startsWith("GEO")
  ) {
    return 3; // 4. ភូមិវិទ្យា
  }

  // 5. Math (Slot 4 -> គណិតវិទ្យា)
  if (
    name.includes("គណិត") ||
    code === "MATH" ||
    code === "MATHEMATICS" ||
    code.startsWith("MAT")
  ) {
    return 4; // 5. គណិតវិទ្យា
  }

  // 6. Physics (Slot 5 -> រូបវិទ្យា)
  if (
    name.includes("រូប") ||
    code === "PHY" ||
    code === "PHYSICS" ||
    code.startsWith("PHY")
  ) {
    return 5; // 6. រូបវិទ្យា
  }

  // 7. Chemistry (Slot 6 -> គីមីវិទ្យា)
  if (
    name.includes("គីមី") ||
    code === "CHEM" ||
    code === "CHEMISTRY" ||
    code === "CHM" ||
    code.startsWith("CHE")
  ) {
    return 6; // 7. គីមីវិទ្យា
  }

  // 8. Biology (Slot 7 -> ជីវវិទ្យា)
  if (
    name.includes("ជីវៈ") ||
    name.includes("ជីវវិទ្យា") ||
    name.includes("ជីវ") ||
    code === "BIO" ||
    code === "BIOLOGY" ||
    code.startsWith("BIO")
  ) {
    return 7; // 8. ជីវវិទ្យា
  }

  // 9. Earth Science (Slot 8 -> ផែនដីវិទ្យា)
  if (
    name.includes("ផែនដី") ||
    code === "EARTH" ||
    code === "EARTH_SCIENCE" ||
    code.startsWith("EAR")
  ) {
    return 8; // 9. ផែនដីវិទ្យា
  }

  // 10. Foreign Language (Slot 9 -> ភាសាបរទេស)
  if (
    name.includes("បរទេស") ||
    name.includes("អង់គ្លេស") ||
    name.includes("បារាំង") ||
    (name.includes("ភាសា") && !name.includes("ខ្មែរ")) ||
    code === "ENG" ||
    code === "ENGLISH" ||
    code === "FR" ||
    code === "FRENCH" ||
    code === "FOREIGN" ||
    code === "FOREIGN_LANG" ||
    code.startsWith("ENG") ||
    code.startsWith("FR")
  ) {
    return 9; // 10. ភាសាបរទេស
  }

  return -1;
};

export const getStudentSubjectAnnualScore = (
  student: any,
  subjectId: string,
  rawSub?: any
): number | null => {
  if (!student) return null;

  // 1. If from studentTrackingData / transcriptData (student.subjectScores)
  if (student.subjectScores) {
    let s = student.subjectScores[subjectId];

    // Fallback: check by rawSub._id, code, nameKh, etc. if not found directly
    if (!s && rawSub) {
      const candidates = [
        rawSub._id,
        rawSub.id,
        rawSub.code,
        rawSub.nameKh,
        rawSub.nameEn,
        rawSub.name,
      ].filter(Boolean);

      for (const key of candidates) {
        if (student.subjectScores[key]) {
          s = student.subjectScores[key];
          break;
        }
      }

      // If still not found, search through Object.entries of student.subjectScores
      if (!s) {
        const subCode = (rawSub.code || "").toUpperCase();
        const subNameKh = (rawSub.nameKh || rawSub.name || "").toLowerCase();

        for (const [key, val] of Object.entries(student.subjectScores)) {
          const valObj = val as any;
          if (
            key === subjectId ||
            key === rawSub.id ||
            key === rawSub._id ||
            (subCode && key.toUpperCase() === subCode) ||
            (subNameKh && key.toLowerCase().includes(subNameKh)) ||
            (valObj && valObj.subjectId === subjectId) ||
            (valObj && valObj.subjectId === rawSub.id) ||
            (valObj && valObj.code && valObj.code.toUpperCase() === subCode)
          ) {
            s = valObj;
            break;
          }
        }
      }
    }

    if (s) {
      if (s.annualScore !== undefined && s.annualScore !== null && !isNaN(Number(s.annualScore))) {
        return Number(s.annualScore);
      }
      const sem1 =
        s.semester1Score !== null && s.semester1Score !== undefined && !isNaN(Number(s.semester1Score))
          ? Number(s.semester1Score)
          : null;
      const sem2 =
        s.semester2Score !== null && s.semester2Score !== undefined && !isNaN(Number(s.semester2Score))
          ? Number(s.semester2Score)
          : null;

      if (sem1 !== null && sem2 !== null) return (sem1 + sem2) / 2;
      if (sem1 !== null) return sem1;
      if (sem2 !== null) return sem2;
      if (s.score !== null && s.score !== undefined && !isNaN(Number(s.score))) {
        return Number(s.score);
      }
    }
  }

  // 2. If from monthly report grades array (student.grades)
  if (student.grades) {
    if (Array.isArray(student.grades)) {
      const g = student.grades.find(
        (item: any) =>
          item.subjectId === subjectId ||
          (rawSub && item.subjectId === rawSub.id) ||
          (rawSub && item.subjectId === rawSub._id) ||
          (rawSub && item.subjectCode === rawSub.code)
      );
      if (g && g.score !== null && g.score !== undefined && !isNaN(Number(g.score))) {
        return Number(g.score);
      }
    } else if (typeof student.grades === "object") {
      const g = student.grades[subjectId] ?? (rawSub ? student.grades[rawSub.id] : null);
      if (g !== null && g !== undefined && !isNaN(Number(g))) {
        return Number(g);
      }
    }
  }

  return null;
};

export const getStudentScoreForStandardSlot = (
  student: any,
  rawSubjectsForSlot: any[]
): { score: number | null; maxScore: number } => {
  if (!rawSubjectsForSlot || rawSubjectsForSlot.length === 0) {
    return { score: null, maxScore: 50 };
  }

  let totalScore = 0;
  let hasAnyScore = false;
  let totalMaxScore = 0;

  for (const rawSub of rawSubjectsForSlot) {
    const rawMax = Number(rawSub.maxScore) || 50;
    totalMaxScore += rawMax;
    const s = getStudentSubjectAnnualScore(student, rawSub.id, rawSub);
    if (s !== null && s !== undefined && !isNaN(Number(s))) {
      totalScore += Number(s);
      hasAnyScore = true;
    }
  }

  return {
    score: hasAnyScore ? totalScore : null,
    maxScore: totalMaxScore > 0 ? totalMaxScore : 50,
  };
};

export const toKhmerNum = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return "";
  const khmerNums = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return num.toString().replace(/[0-9]/g, (m) => khmerNums[parseInt(m)]);
};

export const isFemaleStudent = (gender: string | undefined | null): boolean => {
  if (!gender) return false;
  const g = gender.toString().toLowerCase().trim();
  return g === "female" || g === "ស្រី" || g === "f";
};

export const getIntervalIndex = (score: number | null | undefined): number | null => {
  if (score === null || score === undefined || isNaN(score)) return null;
  if (score <= 0) return 0;
  if (score <= 10) return 1;
  if (score <= 20) return 2;
  if (score <= 30) return 3;
  if (score <= 40) return 4;
  if (score <= 50) return 5;
  if (score <= 60) return 6;
  if (score <= 70) return 7;
  if (score <= 80) return 8;
  if (score <= 90) return 9;
  if (score <= 100) return 10;
  if (score <= 110) return 11;
  if (score <= 120) return 12;
  if (score <= 130) return 13;
  if (score <= 140) return 14;
  return 15;
};

export const getMaxActiveIntervalIndex = (subject: {
  nameKh?: string;
  name?: string;
  maxScore?: number;
}): number => {
  const name = (subject.nameKh || (subject as any).name || "").toLowerCase();
  const maxScore = Number(subject.maxScore) || 50;

  if (name.includes("គណិត") || name.includes("math")) return 15; // Math shows all 16 columns
  if (name.includes("ខ្មែរ") || name.includes("khmer")) return 15; // Khmer shows all 16 columns
  if (maxScore >= 125) return 15;
  if (maxScore >= 100) return 10; // up to 91-100
  if (name.includes("ផែនដី") || name.includes("បរទេស") || name.includes("អង់គ្លេស")) return 10; // up to 91-100
  return 8; // max 50/75-pt subjects active up to 71-80
};

export default function SubjectScoreDistributionReport({
  students = [],
  subjects = [],
  selectedClass,
  selectedYear,
  schoolCode = "01020710711",
  province = "ខេត្តសៀមរាប",
  district = "ស្រុកប្រាសាទបាគង",
  commune = "កណ្ដែក",
  schoolName = "វិទ្យាល័យ ហ៊ុនសែន ស្វាយធំ",
  phoneNumber = "069 216251",
  fillDate = "14/08/2026",
  fillerName = "ស៊ីម ប៊ុយគាន",
  isScienceTrack,
  isSocialTrack,
}: SubjectScoreDistributionProps) {
  // Determine track checkboxes
  const classTrack = selectedClass?.track?.toLowerCase() || "";
  const isScience =
    isScienceTrack !== undefined
      ? isScienceTrack
      : classTrack.includes("science") || classTrack.includes("វិទ្យាសាស្ត្រ");
  const isSocial =
    isSocialTrack !== undefined
      ? isSocialTrack
      : classTrack.includes("social") || classTrack.includes("សង្គម");

  const isJunior = useMemo(() => isGrade789(selectedClass, subjects), [selectedClass, subjects]);

  // Calculate totals and distribution per standard subject
  const distributionData = useMemo(() => {
    const totalFemaleInClass = students.filter((s) => isFemaleStudent(s.gender)).length;
    const totalMaleInClass = students.filter((s) => !isFemaleStudent(s.gender)).length;

    // Filter out excluded subjects (កសិកម្ម, កីឡា, កុំព្យូទ័រ, អប់រំសុខភាព)
    const validSubjects = subjects.filter((s) => !isExcludedSubject(s));

    return STANDARD_DISTRIBUTION_SUBJECTS.map((stdSubject, slotIdx) => {
      // Find all raw subjects in this class corresponding to this standard slot
      const matchedRawSubs = validSubjects.filter(
        (s) => getStandardSubjectIndex(s, isJunior) === slotIdx
      );

      // Determine maxScore for this slot
      let computedMaxScore = stdSubject.defaultMaxScore;
      if (matchedRawSubs.length > 0) {
        computedMaxScore = matchedRawSubs.reduce(
          (sum, sub) => sum + (Number(sub.maxScore) || 50),
          0
        );
      }

      // If Grade 7, 8, 9, Khmer = តែងសេចក្តី (50) + សរសេរតាមអាន (50) = 100
      if (slotIdx === 0 && isJunior) {
        computedMaxScore = 100;
      }

      const passThreshold = computedMaxScore / 2;
      const maxColIdx = getMaxActiveIntervalIndex({
        nameKh: stdSubject.standardNameKh,
        maxScore: computedMaxScore,
      });

      const femaleCounts = new Array(SCORE_INTERVALS.length).fill(0);
      const maleCounts = new Array(SCORE_INTERVALS.length).fill(0);
      let femalePassed = 0;
      let malePassed = 0;

      students.forEach((student) => {
        const isF = isFemaleStudent(student.gender);
        const { score } = getStudentScoreForStandardSlot(student, matchedRawSubs);

        if (score !== null) {
          const idx = getIntervalIndex(score);
          if (idx !== null) {
            if (isF) {
              femaleCounts[idx]++;
            } else {
              maleCounts[idx]++;
            }
          }
          if (score >= passThreshold) {
            if (isF) femalePassed++;
            else malePassed++;
          }
        } else {
          // If no score recorded, count in 0 bucket
          if (isF) {
            femaleCounts[0]++;
          } else {
            maleCounts[0]++;
          }
        }
      });

      return {
        standardNameKh: stdSubject.standardNameKh,
        order: stdSubject.order,
        maxColIdx,
        passThreshold,
        computedMaxScore,
        hasData: matchedRawSubs.length > 0,
        female: {
          counts: femaleCounts,
          total: totalFemaleInClass,
          passed: femalePassed,
        },
        male: {
          counts: maleCounts,
          total: totalMaleInClass,
          passed: malePassed,
        },
      };
    });
  }, [students, subjects, isJunior]);

  const classNameFormatted = useMemo(() => {
    const rawName = selectedClass?.name || "";
    if (!rawName) return "ថ្នាក់ទី";
    const khmerName = toKhmerNum(rawName);
    if (khmerName.includes("ថ្នាក់ទី")) return khmerName;
    return `ថ្នាក់ទី ${khmerName}`;
  }, [selectedClass]);

  const academicYearFormatted = useMemo(() => {
    return `${toKhmerNum(selectedYear)}-${toKhmerNum(selectedYear + 1)}`;
  }, [selectedYear]);

  return (
    <div className="distribution-report-container">
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Bokor&family=Moul&family=Siemreap&display=swap");

        .khmer-muol {
          font-family: "Moul", "Khmer OS Muol Light", serif !important;
        }
        .khmer-bokor {
          font-family: "Bokor", "Khmer OS Bokor", serif !important;
        }
        .khmer-siemreap {
          font-family: "Siemreap", "Khmer OS Siem Reap", serif !important;
        }

        .distribution-report-page {
          background: #ffffff;
          padding: 8mm 6mm 6mm;
          width: 297mm;
          min-height: 200mm;
          margin: 0 auto;
          box-sizing: border-box;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          color: #000000;
        }

        .info-blue {
          color: #0000cd !important;
          font-weight: bold;
        }

        table.score-dist-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #000000;
          font-family: "Siemreap", "Khmer OS Siem Reap", serif;
        }

        table.score-dist-table th,
        table.score-dist-table td {
          border: 1px solid #000000;
          text-align: center;
          vertical-align: middle;
          padding: 2px 1px;
        }

        table.score-dist-table th {
          background-color: #fad7b5 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-size: 11px;
          font-weight: bold;
          line-height: 1.2;
        }

        table.score-dist-table td {
          font-size: 12px;
          height: 26px;
          padding: 3px 1px;
        }

        .bg-sub-even td {
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .bg-sub-odd td {
          background-color: #fffdf0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .checkbox-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 13px;
          height: 13px;
          border: 1.5px solid #000000;
          margin-left: 5px;
          font-size: 11px;
          font-weight: bold;
          vertical-align: middle;
          line-height: 1;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 4mm 4mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .distribution-report-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .distribution-report-page {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 2mm 2mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          table.score-dist-table th {
            background-color: #fad7b5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .bg-sub-even td {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .bg-sub-odd td {
            background-color: #fffdf0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="distribution-report-page">
        {/* Main Title */}
        <h1 className="khmer-muol text-center text-[15px] font-normal leading-relaxed text-black mb-3 tracking-wide">
          តារាងស្រង់ពិន្ទុតាមមុខវិជ្ជា សម្រាប់សាលាមធ្យមសិក្សា {academicYearFormatted}
        </h1>

        {/* Subheader Metadata */}
        <div className="khmer-siemreap text-[11.5px] leading-relaxed mb-2 px-1">
          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-1 items-center mb-1">
            <div className="col-span-3 text-left">
              <span>លេខកូដសាលា ៖ </span>
              <span className="info-blue">{schoolCode}</span>
            </div>
            <div className="col-span-3 text-left pl-2">
              <span>ឈ្មោះខេត្ត ៖ </span>
              <span className="info-blue">{province}</span>
            </div>
            <div className="col-span-4 text-left">
              <span>ឈ្មោះក្រុង-ស្រុក-ខណ្ឌ ៖ </span>
              <span className="info-blue">{district}</span>
            </div>
            <div className="col-span-2 text-right">
              <span>វិទ្យាសាស្ត្រ</span>
              <span className="checkbox-box">{isScience ? "✓" : ""}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-12 gap-1 items-center">
            <div className="col-span-3 text-left">
              <span>ឈ្មោះឃុំ-សង្កាត់ ៖ </span>
              <span className="info-blue">{commune}</span>
            </div>
            <div className="col-span-3 text-left pl-2">
              <span>ឈ្មោះសាលា ៖ </span>
              <span className="info-blue">{schoolName}</span>
            </div>
            <div className="col-span-4 text-left">
              <span>ទូរស័ព្ទអ្នកបំពេញ ៖ </span>
              <span className="info-blue">{phoneNumber}</span>
            </div>
            <div className="col-span-2 text-right">
              <span>វិទ្យា.សង្គម</span>
              <span className="checkbox-box">{isSocial ? "✓" : ""}</span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <table className="score-dist-table mb-2">
          <thead>
            {/* Top Header Row */}
            <tr style={{ height: "30px" }}>
              <th
                className="w-[88px] khmer-muol text-[11.5px] font-normal py-1.5 px-0.5"
                style={{ backgroundColor: "#fad7b5" }}
              >
                {classNameFormatted}
              </th>
              <th
                colSpan={17}
                className="khmer-bokor text-[12.5px] font-normal py-1.5"
                style={{ backgroundColor: "#fad7b5" }}
              >
                មធ្យមភាគពិន្ទុ ( ពិន្ទុប្រឡងឆមាសទី១ + ពិន្ទុប្រឡងឆមាសទី២ ) ចែកនឹង ២
              </th>
              <th
                rowSpan={2}
                className="w-[45px] khmer-bokor text-[12px] font-normal"
                style={{ backgroundColor: "#fad7b5" }}
              >
                សរុប
              </th>
              <th
                rowSpan={2}
                className="w-[58px] khmer-bokor text-[11px] font-normal leading-tight px-1"
                style={{ backgroundColor: "#fad7b5" }}
              >
                សរុប
                <br />
                សិស្សជាប់
              </th>
            </tr>

            {/* Score Interval Header Row */}
            <tr style={{ height: "28px" }}>
              <th
                className="w-[88px] khmer-muol text-[10.5px] font-normal py-1.5"
                style={{ backgroundColor: "#fad7b5" }}
              >
                មុខវិជ្ជា
              </th>
              <th
                className="w-[38px] khmer-bokor text-[12px] font-normal py-1.5"
                style={{ backgroundColor: "#fad7b5" }}
              >
                ភេទ
              </th>
              {SCORE_INTERVALS.map((interval) => (
                <th
                  key={interval.key}
                  className="w-[43px] text-[8.5px] font-sans font-bold py-1.5 px-0 text-center tracking-tighter"
                  style={{ backgroundColor: "#fad7b5" }}
                >
                  {interval.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {distributionData.length === 0 ? (
              <tr>
                <td colSpan={20} className="py-8 text-center text-gray-500 khmer-siemreap">
                  មិនមានទិន្នន័យមុខវិជ្ជាសម្រាប់ថ្នាក់នេះទេ
                </td>
              </tr>
            ) : (
              distributionData.map((row, subjectIdx) => {
                const rowClass = subjectIdx % 2 === 0 ? "bg-sub-even" : "bg-sub-odd";
                return (
                  <React.Fragment key={row.order || subjectIdx}>
                    {/* Row 1: Female (ស្រី) */}
                    <tr className={rowClass}>
                      {/* Subject Name (spans 2 rows) */}
                      <td
                        rowSpan={2}
                        className="khmer-siemreap text-[11px] font-medium text-left px-1.5"
                        style={{ verticalAlign: "middle" }}
                      >
                        {row.standardNameKh}
                      </td>

                      {/* Gender Label: ស្រី */}
                      <td className="khmer-siemreap text-[11.5px] font-medium">ស្រី</td>

                      {/* 16 Interval Columns */}
                      {SCORE_INTERVALS.map((_, colIdx) => {
                        const count = row.female.counts[colIdx];
                        const isOutOfRange = colIdx > row.maxColIdx && count === 0;

                        return (
                          <td
                            key={`female-${colIdx}`}
                            className="font-sans text-[11.5px]"
                          >
                            {isOutOfRange ? "" : count}
                          </td>
                        );
                      })}

                      {/* Total Female */}
                      <td className="font-sans text-[11.5px] font-bold text-center">
                        {row.female.total}
                      </td>

                      {/* Total Passed Female */}
                      <td className="font-sans text-[11.5px] font-bold text-center">
                        {row.female.passed}
                      </td>
                    </tr>

                    {/* Row 2: Male (ប្រុស) */}
                    <tr className={rowClass}>
                      {/* Gender Label: ប្រុស */}
                      <td className="khmer-siemreap text-[11.5px] font-medium">ប្រុស</td>

                      {/* 16 Interval Columns */}
                      {SCORE_INTERVALS.map((_, colIdx) => {
                        const count = row.male.counts[colIdx];
                        const isOutOfRange = colIdx > row.maxColIdx && count === 0;

                        return (
                          <td
                            key={`male-${colIdx}`}
                            className="font-sans text-[11.5px]"
                          >
                            {isOutOfRange ? "" : count}
                          </td>
                        );
                      })}

                      {/* Total Male */}
                      <td className="font-sans text-[11.5px] font-bold text-center">
                        {row.male.total}
                      </td>

                      {/* Total Passed Male */}
                      <td className="font-sans text-[11.5px] font-bold text-center">
                        {row.male.passed}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer Signature */}
        <div className="khmer-siemreap text-[12px] flex justify-end mt-2 pr-6">
          <div className="space-y-1.5 text-left min-w-[240px]">
            <div>
              <span>បំពេញនៅថ្ងៃទី ៖ </span>
              <span className="info-blue">{fillDate}</span>
            </div>
            <div>
              <span>បំពេញដោយ ៖ </span>
              <span className="info-blue text-[13px]">{fillerName}</span>
            </div>
            <div className="pt-1">
              <span>ហត្ថលេខា ៖ </span>
              <span className="text-gray-400 font-sans tracking-widest">
                .................................
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
