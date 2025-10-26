// កែប្រែគំរូតារាងកិត្តិយសសម្រាប់ support ៥-៦ នាក់ និងកំណត់ត្រឹម A4 មួយសន្លឹក
// Updated Honor Certificate Templates with 5-6 students support and A4 single page

// Helper function to get top students including ties
const getTopStudentsWithTies = (sortedReports, maxRank = 5) => {
  if (sortedReports.length === 0) return [];

  const result = [];
  let currentRank = 1;
  let previousAverage = null;

  for (let i = 0; i < sortedReports.length; i++) {
    const report = sortedReports[i];

    // If score is different from previous, update rank
    if (previousAverage !== null && report.average !== previousAverage) {
      currentRank = i + 1;
    }

    // Stop if we've exceeded max rank (but include all ties at rank 5)
    if (currentRank > maxRank) break;

    result.push({ ...report, rank: currentRank });
    previousAverage = report.average;
  }

  return result;
};

// A4 Page dimensions (portrait): 794px x 1123px (at 96 DPI)
const A4_HEIGHT = "1123px";
const A4_WIDTH = "794px";

// គំរូទី១ - មេដាយមាស (ពណ៌មាស-ទឹកក្រូច)
const HonorTemplate1 = () => {
  const topStudentsWithRanks = getTopStudentsWithTies(sortedReports);

  return (
    <div
      className="bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 relative overflow-hidden print:p-6"
      style={{
        height: A4_HEIGHT,
        width: A4_WIDTH,
        maxHeight: A4_HEIGHT,
        fontFamily: "Khmer OS Battambang",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* កុំឱ្យមាន decorative background pattern ច្រើនពេក */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-10 -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full opacity-10 translate-x-20 translate-y-20"></div>

      {/* Header - ស៊ុមស្អាត */}
      <div className="relative z-10 text-center mb-3 pb-2">
        <div className="inline-block bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white px-8 py-2 rounded-full shadow-lg mb-2">
          <h1
            className="text-lg font-bold"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ព្រះរាជាណាចក្រកម្ពុជា
          </h1>
        </div>
        <p
          className="text-base font-bold text-gray-700"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
        <div className="flex items-center justify-center mt-1">
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
          <span className="mx-2 text-yellow-600 text-xl">❀</span>
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
        </div>
      </div>

      {/* School Name */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">{honorSchoolName}</h2>
      </div>

      {/* Title - ស៊ុមចំណងជើងស្អាត */}
      <div className="text-center mb-4">
        <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 px-8 py-4 rounded-3xl shadow-xl border-4 border-amber-300">
          <h2
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "Khmer OS Muol Light",
              background: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            តារាងកិត្តិយស
          </h2>
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-2"></div>
          <p className="text-base font-bold text-orange-700">{honorPeriod}</p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Top Students with Medals - គ្មានប្រអប់/underline លើឈ្មោះ */}
      <div className="space-y-3 mb-4">
        {topStudentsWithRanks.map((report, index) => (
          <div key={report.student.id} className="relative">
            <div className="flex items-center gap-4">
              {/* Medal Circle - ស៊ុមមេដាយស្អាត */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 ${
                    report.rank === 1
                      ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-yellow-200"
                      : report.rank === 2
                      ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 border-gray-200"
                      : report.rank === 3
                      ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 border-orange-200"
                      : "bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600 border-blue-200"
                  }`}
                >
                  <span
                    className={`text-3xl font-bold ${
                      report.rank === 1
                        ? "text-yellow-900"
                        : report.rank === 2
                        ? "text-gray-900"
                        : report.rank === 3
                        ? "text-orange-900"
                        : "text-blue-900"
                    }`}
                    style={{ fontFamily: "Khmer OS Muol" }}
                  >
                    {["១", "២", "៣", "៤", "៥", "៦"][report.rank - 1]}
                  </span>
                </div>
                {/* Ribbon for top 3 */}
                {report.rank <= 3 && (
                  <div
                    className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-14 ${
                      report.rank === 1
                        ? "bg-gradient-to-b from-red-500 to-red-700"
                        : report.rank === 2
                        ? "bg-gradient-to-b from-red-400 to-red-600"
                        : "bg-gradient-to-b from-red-300 to-red-500"
                    }`}
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)",
                    }}
                  ></div>
                )}
              </div>

              {/* Name Card - គ្មាន border/underline លើបាវចនា */}
              <div
                className={`flex-1 p-4 rounded-xl shadow-lg ${
                  report.rank === 1
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100"
                    : report.rank === 2
                    ? "bg-gradient-to-r from-gray-50 to-gray-100"
                    : report.rank === 3
                    ? "bg-gradient-to-r from-orange-50 to-orange-100"
                    : "bg-gradient-to-r from-blue-50 to-blue-100"
                }`}
              >
                {/* ឈ្មោះ - គ្មានការគូសបន្ទាត់ឬប្រអប់ */}
                <p className="text-xl font-bold text-gray-800 mb-1">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                    ពិន្ទុ:{" "}
                    <span className="font-bold text-blue-600">
                      {report.average.toFixed(2)}
                    </span>
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                    និទ្ទេស:{" "}
                    <span className="font-bold">{report.letterGrade}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Signatures - ជៀសវាងការដាច់អក្សរ */}
      <div
        className="grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t-2 border-gray-300"
        style={{ pageBreakInside: "avoid" }}
      >
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">ត្រួតពិនិត្យ</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{teacherName}</p>
            <div className="h-0.5 bg-gray-400 mt-1"></div>
          </div>
        </div>
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">អនុញ្ញាត</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{principalName}</p>
            <div className="h-0.5 bg-gray-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// គំរូទី២ - ពានរង្វាន់ Trophy (ពណ៌ខៀវ-ស្វាយ)
const HonorTemplate2 = () => {
  const topStudentsWithRanks = getTopStudentsWithTies(sortedReports);

  return (
    <div
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 relative overflow-hidden print:p-6"
      style={{
        height: A4_HEIGHT,
        width: A4_WIDTH,
        maxHeight: A4_HEIGHT,
        fontFamily: "Khmer OS Battambang",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-blue-300 rounded-tl-3xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-purple-300 rounded-tr-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-purple-300 rounded-bl-3xl"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-blue-300 rounded-br-3xl"></div>

      {/* Header */}
      <div className="relative z-10 text-center mb-3 pb-2">
        <div className="inline-block border-4 border-double border-purple-500 rounded-2xl px-8 py-2 bg-white shadow-lg mb-2">
          <h1
            className="text-lg font-bold text-purple-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ព្រះរាជាណាចក្រកម្ពុជា
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent my-1"></div>
          <p
            className="text-base font-bold text-gray-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
        </div>
      </div>

      <div className="relative z-10 text-center mb-2">
        <h2 className="text-xl font-bold text-purple-700">{honorSchoolName}</h2>
      </div>

      {/* Title with Trophy - ស៊ុមស្អាត */}
      <div className="relative z-10 text-center mb-4">
        <div className="inline-block bg-gradient-to-br from-blue-100 to-purple-100 px-8 py-4 rounded-3xl shadow-xl border-4 border-purple-300">
          <div className="text-5xl mb-2">🏆</div>
          <h2
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "Khmer OS Muol Light",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            តារាងកិត្តិយស
          </h2>
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-2"></div>
          <p className="text-base font-bold text-purple-700">{honorPeriod}</p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Students List - គ្មាន border លើឈ្មោះ */}
      <div className="relative z-10 space-y-3 mb-4">
        {topStudentsWithRanks.map((report, index) => (
          <div
            key={report.student.id}
            className={`flex items-center gap-4 p-4 rounded-xl shadow-lg ${
              report.rank === 1
                ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                : report.rank === 2
                ? "bg-gradient-to-r from-gray-100 to-gray-200"
                : report.rank === 3
                ? "bg-gradient-to-r from-orange-100 to-orange-200"
                : "bg-gradient-to-r from-blue-100 to-purple-100"
            }`}
          >
            {/* Rank Badge */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-4 ${
                report.rank === 1
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-200"
                  : report.rank === 2
                  ? "bg-gradient-to-br from-gray-400 to-gray-600 border-gray-200"
                  : report.rank === 3
                  ? "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-200"
                  : "bg-gradient-to-br from-blue-400 to-purple-600 border-blue-200"
              }`}
            >
              <span
                className="text-white font-bold text-2xl"
                style={{ fontFamily: "Khmer OS Muol" }}
              >
                {["១", "២", "៣", "៤", "៥", "៦"][report.rank - 1]}
              </span>
            </div>

            {/* Student Info - គ្មានការគូស */}
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-800">
                {report.student.lastName} {report.student.firstName}
              </p>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="bg-white px-2 py-1 rounded-full shadow-sm">
                  ពិន្ទុ:{" "}
                  <span className="font-bold text-purple-600">
                    {report.average.toFixed(2)}
                  </span>
                </span>
                <span className="bg-white px-2 py-1 rounded-full shadow-sm">
                  និទ្ទេស:{" "}
                  <span className="font-bold">{report.letterGrade}</span>
                </span>
              </div>
            </div>

            {/* Medal Icon */}
            <div className="flex-shrink-0 text-4xl">
              {report.rank <= 3 ? ["🥇", "🥈", "🥉"][report.rank - 1] : "⭐"}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="relative z-10 grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t-2 border-purple-300"
        style={{ pageBreakInside: "avoid" }}
      >
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">ត្រួតពិនិត្យ</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{teacherName}</p>
            <div className="h-0.5 bg-purple-400 mt-1"></div>
          </div>
        </div>
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">អនុញ្ញាត</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{principalName}</p>
            <div className="h-0.5 bg-purple-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// គំរូទី៣ - ទំនើប Modern (ពណ៌ស្វាយ-ខៀវ)
const HonorTemplate3 = () => {
  const topStudentsWithRanks = getTopStudentsWithTies(sortedReports);

  return (
    <div
      className="bg-white p-8 relative overflow-hidden print:p-6"
      style={{
        height: A4_HEIGHT,
        width: A4_WIDTH,
        maxHeight: A4_HEIGHT,
        fontFamily: "Khmer OS Battambang",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
        border: "8px solid",
        borderImage: "linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899) 1",
      }}
    >
      {/* Header with gradient background */}
      <div className="text-center mb-3 pb-3 bg-gradient-to-r from-indigo-600 to-purple-600 -mx-8 -mt-8 px-8 pt-8 text-white rounded-b-3xl shadow-xl">
        <h1
          className="text-lg font-bold mb-1"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p
          className="text-base font-bold"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
        <div className="h-1 w-32 bg-white/30 mx-auto mt-2 rounded-full"></div>
      </div>

      <div className="text-center mb-2 mt-4">
        <h2 className="text-xl font-bold text-indigo-700">{honorSchoolName}</h2>
      </div>

      {/* Modern Title */}
      <div className="text-center mb-4">
        <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 px-8 py-4 rounded-3xl shadow-xl border-4 border-indigo-300">
          <div className="text-5xl mb-2">⭐</div>
          <h2
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "Khmer OS Muol Light",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            តារាងកិត្តិយស
          </h2>
          <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-2"></div>
          <p className="text-base font-bold text-indigo-700">{honorPeriod}</p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Clean Modern List - គ្មាន border លើឈ្មោះ */}
      <div className="space-y-3 mb-4">
        {topStudentsWithRanks.map((report, index) => (
          <div
            key={report.student.id}
            className={`relative overflow-hidden rounded-xl shadow-xl ${
              report.rank === 1
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : report.rank === 2
                ? "bg-gradient-to-r from-gray-400 to-gray-600"
                : report.rank === 3
                ? "bg-gradient-to-r from-orange-400 to-red-500"
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
            }`}
          >
            {/* Decorative Icon */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
              <div className="text-7xl">
                {report.rank <= 3 ? ["🥇", "🥈", "🥉"][report.rank - 1] : "⭐"}
              </div>
            </div>

            <div className="relative p-4 flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                  <span
                    className={`text-3xl font-bold ${
                      report.rank === 1
                        ? "text-yellow-600"
                        : report.rank === 2
                        ? "text-gray-600"
                        : report.rank === 3
                        ? "text-orange-600"
                        : "text-indigo-600"
                    }`}
                    style={{ fontFamily: "Khmer OS Muol" }}
                  >
                    {["១", "២", "៣", "៤", "៥", "៦"][report.rank - 1]}
                  </span>
                </div>
              </div>

              <div className="flex-1 text-white">
                <p className="text-lg font-bold drop-shadow-lg">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full backdrop-blur-sm">
                    ពិន្ទុ: {report.average.toFixed(2)}
                  </span>
                  <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full backdrop-blur-sm">
                    និទ្ទេស: {report.letterGrade}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-white text-4xl">
                {report.rank <= 3 ? ["🥇", "🥈", "🥉"][report.rank - 1] : "⭐"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t-2 border-indigo-300"
        style={{ pageBreakInside: "avoid" }}
      >
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">ត្រួតពិនិត្យ</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{teacherName}</p>
            <div className="h-0.5 bg-indigo-400 mt-1"></div>
          </div>
        </div>
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">អនុញ្ញាត</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{principalName}</p>
            <div className="h-0.5 bg-indigo-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// គំរូទី៤ - ស្រស់ស្អាត Elegant (ពណ៌ផ្កាឈូក-ស្វាយ)
const HonorTemplate4 = () => {
  const topStudentsWithRanks = getTopStudentsWithTies(sortedReports);

  return (
    <div
      className="bg-gradient-to-br from-rose-50 via-white to-pink-50 p-8 relative overflow-hidden print:p-6"
      style={{
        height: A4_HEIGHT,
        width: A4_WIDTH,
        maxHeight: A4_HEIGHT,
        fontFamily: "Khmer OS Battambang",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* Elegant frame */}
      <div className="absolute inset-0 m-4 border-4 border-double border-rose-300 rounded-3xl pointer-events-none"></div>

      {/* Decorative flowers */}
      <div className="absolute top-8 left-8 text-4xl opacity-30">🌸</div>
      <div className="absolute top-8 right-8 text-4xl opacity-30">🌸</div>
      <div className="absolute bottom-8 left-8 text-4xl opacity-30">🌸</div>
      <div className="absolute bottom-8 right-8 text-4xl opacity-30">🌸</div>

      {/* Elegant Header */}
      <div className="relative z-10 text-center mb-3">
        <div className="inline-block border-4 border-rose-400 rounded-full px-10 py-3 bg-white shadow-xl mb-2">
          <h1
            className="text-lg font-bold text-rose-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ព្រះរាជាណាចក្រកម្ពុជា
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent my-1"></div>
          <p
            className="text-base font-bold text-gray-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
        </div>
      </div>

      <div className="relative z-10 text-center mb-2">
        <h2 className="text-xl font-bold text-rose-700">{honorSchoolName}</h2>
      </div>

      {/* Elegant Title */}
      <div className="relative z-10 text-center mb-4">
        <div className="inline-block bg-gradient-to-br from-rose-100 to-pink-100 px-8 py-4 rounded-3xl shadow-xl border-4 border-rose-300">
          <h2
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "Khmer OS Muol Light",
              background: "linear-gradient(135deg, #f43f5e, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            តារាងកិត្តិយស
          </h2>
          <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mb-2"></div>
          <p className="text-base font-bold text-rose-700">{honorPeriod}</p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Elegant Cards - គ្មាន border លើឈ្មោះ */}
      <div className="relative z-10 space-y-3 mb-4">
        {topStudentsWithRanks.map((report, index) => (
          <div key={report.student.id} className="group">
            <div
              className={`flex items-center gap-4 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                report.rank === 1
                  ? "bg-gradient-to-r from-yellow-100 to-orange-100"
                  : report.rank === 2
                  ? "bg-gradient-to-r from-gray-100 to-gray-200"
                  : report.rank === 3
                  ? "bg-gradient-to-r from-orange-100 to-red-100"
                  : "bg-gradient-to-r from-rose-100 to-pink-100"
              }`}
            >
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 ${
                  report.rank === 1
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-200"
                    : report.rank === 2
                    ? "bg-gradient-to-br from-gray-400 to-gray-600 border-gray-200"
                    : report.rank === 3
                    ? "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-200"
                    : "bg-gradient-to-br from-rose-400 to-pink-600 border-rose-200"
                }`}
              >
                <span
                  className="text-white text-2xl font-bold"
                  style={{ fontFamily: "Khmer OS Muol" }}
                >
                  {["១", "២", "៣", "៤", "៥", "៦"][report.rank - 1]}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-lg font-bold text-gray-800">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="bg-white px-2 py-1 rounded-full shadow-sm">
                    ពិន្ទុ:{" "}
                    <span className="font-bold text-rose-600">
                      {report.average.toFixed(2)}
                    </span>
                  </span>
                  <span className="bg-white px-2 py-1 rounded-full shadow-sm">
                    និទ្ទេស:{" "}
                    <span className="font-bold">{report.letterGrade}</span>
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-3xl">
                {report.rank <= 3 ? ["🏆", "🥈", "🥉"][report.rank - 1] : "⭐"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="relative z-10 grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t-2 border-rose-300"
        style={{ pageBreakInside: "avoid" }}
      >
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">ត្រួតពិនិត្យ</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{teacherName}</p>
            <div className="h-0.5 bg-rose-400 mt-1"></div>
          </div>
        </div>
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">អនុញ្ញាត</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{principalName}</p>
            <div className="h-0.5 bg-rose-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// គំរូទី៥ - ប្រភេទថ្មី: ពណ៌បៃតង និងមាស (Green & Gold)
const HonorTemplate5 = () => {
  const topStudentsWithRanks = getTopStudentsWithTies(sortedReports);

  return (
    <div
      className="bg-gradient-to-br from-emerald-50 via-white to-green-50 p-8 relative overflow-hidden print:p-6"
      style={{
        height: A4_HEIGHT,
        width: A4_WIDTH,
        maxHeight: A4_HEIGHT,
        fontFamily: "Khmer OS Battambang",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* Decorative laurel wreaths */}
      <div className="absolute top-0 left-0 text-6xl opacity-20">🌿</div>
      <div className="absolute top-0 right-0 text-6xl opacity-20 transform scale-x-[-1]">
        🌿
      </div>

      {/* Header with gradient badge */}
      <div className="text-center mb-3 pb-3">
        <div className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-10 py-3 rounded-full shadow-xl mb-2 border-4 border-yellow-400">
          <h1
            className="text-lg font-bold"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ព្រះរាជាណាចក្រកម្ពុជា
          </h1>
          <div className="h-px bg-yellow-400 my-1"></div>
          <p
            className="text-base font-bold"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
        </div>
      </div>

      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-emerald-700">
          {honorSchoolName}
        </h2>
      </div>

      {/* Title with Achievement Badge */}
      <div className="text-center mb-4">
        <div className="inline-block bg-gradient-to-br from-emerald-100 to-green-100 px-8 py-4 rounded-3xl shadow-xl border-4 border-emerald-400">
          <div className="text-5xl mb-2">🏅</div>
          <h2
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "Khmer OS Muol Light",
              background: "linear-gradient(135deg, #059669, #65a30d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            តារាងកិត្តិយស
          </h2>
          <div className="h-1 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full mb-2"></div>
          <p className="text-base font-bold text-emerald-700">{honorPeriod}</p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Achievement Cards - គ្មាន border លើឈ្មោះ */}
      <div className="space-y-3 mb-4">
        {topStudentsWithRanks.map((report, index) => (
          <div
            key={report.student.id}
            className={`relative overflow-hidden rounded-2xl shadow-xl ${
              report.rank === 1
                ? "bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-500"
                : report.rank === 2
                ? "bg-gradient-to-r from-gray-200 to-gray-300 border-4 border-gray-500"
                : report.rank === 3
                ? "bg-gradient-to-r from-orange-200 to-orange-300 border-4 border-orange-500"
                : "bg-gradient-to-r from-emerald-100 to-green-100 border-4 border-emerald-400"
            }`}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Achievement Badge */}
              <div
                className={`flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white ${
                  report.rank === 1
                    ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"
                    : report.rank === 2
                    ? "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600"
                    : report.rank === 3
                    ? "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
                    : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600"
                }`}
              >
                <span
                  className="text-white text-3xl font-bold drop-shadow-lg"
                  style={{ fontFamily: "Khmer OS Muol" }}
                >
                  {["១", "២", "៣", "៤", "៥", "៦"][report.rank - 1]}
                </span>
              </div>

              {/* Student Info */}
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-800 mb-1">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-white px-3 py-1 rounded-full shadow-md">
                    ពិន្ទុ:{" "}
                    <span className="font-bold text-emerald-600">
                      {report.average.toFixed(2)}
                    </span>
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full shadow-md">
                    និទ្ទេស:{" "}
                    <span className="font-bold">{report.letterGrade}</span>
                  </span>
                </div>
              </div>

              {/* Trophy/Medal */}
              <div className="flex-shrink-0 text-5xl drop-shadow-lg">
                {report.rank === 1
                  ? "🥇"
                  : report.rank === 2
                  ? "🥈"
                  : report.rank === 3
                  ? "🥉"
                  : "🏅"}
              </div>
            </div>

            {/* Decorative ribbon */}
            {report.rank <= 3 && (
              <div
                className={`absolute bottom-0 left-0 right-0 h-2 ${
                  report.rank === 1
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-800"
                    : report.rank === 2
                    ? "bg-gradient-to-r from-gray-600 to-gray-800"
                    : "bg-gradient-to-r from-orange-600 to-orange-800"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t-2 border-emerald-300"
        style={{ pageBreakInside: "avoid" }}
      >
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">ត្រួតពិនិត្យ</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{teacherName}</p>
            <div className="h-0.5 bg-emerald-400 mt-1"></div>
          </div>
        </div>
        <div>
          <p className="text-xs mb-1">{reportDate}</p>
          <p className="text-xs mb-12">អនុញ្ញាត</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8">{principalName}</p>
            <div className="h-0.5 bg-emerald-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// គំរូទី៦ - ប្រភេទថ្មី: ពណ៌ខៀវស្ងាត់ និងមាសសុទ្ធ (Royal Blue & Gold)
const HonorTemplate6 = () => {
  const topStudentsWithRanks = getTopStudentsWithTies(sortedReports);

  return (
    <div
      className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8 relative overflow-hidden print:p-6"
      style={{
        height: A4_HEIGHT,
        width: A4_WIDTH,
        maxHeight: A4_HEIGHT,
        fontFamily: "Khmer OS Battambang",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* Golden decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-transparent via-yellow-500 to-transparent"></div>
      <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-transparent via-yellow-500 to-transparent"></div>

      {/* Ornate corners */}
      <div className="absolute top-4 left-4 text-4xl text-yellow-400 opacity-50">
        ✨
      </div>
      <div className="absolute top-4 right-4 text-4xl text-yellow-400 opacity-50">
        ✨
      </div>
      <div className="absolute bottom-4 left-4 text-4xl text-yellow-400 opacity-50">
        ✨
      </div>
      <div className="absolute bottom-4 right-4 text-4xl text-yellow-400 opacity-50">
        ✨
      </div>

      {/* Royal Header */}
      <div className="relative z-10 text-center mb-3 pb-3">
        <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 px-10 py-3 rounded-2xl shadow-2xl mb-2 border-4 border-yellow-300">
          <h1
            className="text-lg font-bold text-blue-900"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ព្រះរាជាណាចក្រកម្ពុជា
          </h1>
          <div className="h-px bg-blue-900 my-1"></div>
          <p
            className="text-base font-bold text-blue-900"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
        </div>
      </div>

      <div className="relative z-10 text-center mb-2">
        <h2 className="text-xl font-bold text-yellow-400">{honorSchoolName}</h2>
      </div>

      {/* Royal Title */}
      <div className="relative z-10 text-center mb-4">
        <div className="inline-block bg-white/10 backdrop-blur-sm px-8 py-4 rounded-3xl shadow-2xl border-4 border-yellow-400">
          <div className="text-5xl mb-2">👑</div>
          <h2
            className="text-4xl font-bold mb-1 text-yellow-400"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            តារាងកិត្តិយស
          </h2>
          <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-2"></div>
          <p className="text-base font-bold text-yellow-300">{honorPeriod}</p>
        </div>
        <p className="text-sm text-blue-200 mt-2">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Royal Achievement Cards */}
      <div className="relative z-10 space-y-3 mb-4">
        {topStudentsWithRanks.map((report, index) => (
          <div
            key={report.student.id}
            className="relative overflow-hidden rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border-4 border-yellow-400"
          >
            <div className="p-4 flex items-center gap-4">
              {/* Royal Badge */}
              <div
                className={`flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 ${
                  report.rank === 1
                    ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-yellow-200"
                    : report.rank === 2
                    ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 border-gray-200"
                    : report.rank === 3
                    ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 border-orange-200"
                    : "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 border-blue-200"
                }`}
              >
                <span
                  className={`text-3xl font-bold drop-shadow-lg ${
                    report.rank <= 3 ? "text-white" : "text-white"
                  }`}
                  style={{ fontFamily: "Khmer OS Muol" }}
                >
                  {["១", "២", "៣", "៤", "៥", "៦"][report.rank - 1]}
                </span>
              </div>

              {/* Student Info - Premium Style */}
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-800 mb-1">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow-lg">
                    ពិន្ទុ:{" "}
                    <span className="font-bold">
                      {report.average.toFixed(2)}
                    </span>
                  </span>
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-blue-900 px-3 py-1 rounded-full shadow-lg font-bold">
                    និទ្ទេស: {report.letterGrade}
                  </span>
                </div>
              </div>

              {/* Crown/Medal */}
              <div className="flex-shrink-0 text-5xl drop-shadow-2xl">
                {report.rank === 1
                  ? "👑"
                  : report.rank === 2
                  ? "🥈"
                  : report.rank === 3
                  ? "🥉"
                  : "⭐"}
              </div>
            </div>

            {/* Golden accent strip */}
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
          </div>
        ))}
      </div>

      {/* Footer - Royal Style */}
      <div
        className="relative z-10 grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t-2 border-yellow-400"
        style={{ pageBreakInside: "avoid" }}
      >
        <div>
          <p className="text-xs text-blue-200 mb-1">{reportDate}</p>
          <p className="text-xs text-blue-200 mb-12">ត្រួតពិនិត្យ</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8 text-yellow-400">
              {teacherName}
            </p>
            <div className="h-0.5 bg-yellow-400 mt-1"></div>
          </div>
        </div>
        <div>
          <p className="text-xs text-blue-200 mb-1">{reportDate}</p>
          <p className="text-xs text-blue-200 mb-12">អនុញ្ញាត</p>
          <div className="inline-block">
            <p className="font-bold text-sm px-8 text-yellow-400">
              {principalName}
            </p>
            <div className="h-0.5 bg-yellow-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export {
  HonorTemplate1,
  HonorTemplate2,
  HonorTemplate3,
  HonorTemplate4,
  HonorTemplate5,
  HonorTemplate6,
  getTopStudentsWithTies,
};
