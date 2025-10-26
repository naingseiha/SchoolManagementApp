"use client";

import StudentPhoto from "../StudentPhoto";

interface HonorTemplate4Props {
  topStudents: any[];
  selectedClass: any;
  honorSchoolName: string;
  honorPeriod: string;
  showStudentPhotos: boolean;
  showBorder: boolean;
  pageMargin: string;
  reportDate: string;
  teacherName: string;
  principalName: string;
}

export default function HonorTemplate4({
  topStudents,
  selectedClass,
  honorSchoolName,
  honorPeriod,
  showStudentPhotos,
  showBorder,
  pageMargin,
  reportDate,
  teacherName,
  principalName,
}: HonorTemplate4Props) {
  return (
    <div
      className="honor-certificate"
      style={{
        fontFamily: "Khmer OS Battambang",
        padding: pageMargin,
        backgroundColor: "white",
      }}
    >
      <div
        className={`h-full flex flex-col ${
          showBorder
            ? "border-[8px] border-double border-rose-600 rounded-lg p-6"
            : "p-8"
        }`}
        style={{
          backgroundColor: "#fff5f7",
          backgroundImage: "linear-gradient(135deg, #fff5f7 0%, #ffe4e6 100%)",
        }}
      >
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl text-rose-600">🌺</span>
            <h1
              className="text-xl font-bold text-gray-800 mx-3"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              ព្រះរាជាណាចក្រកម្ពុជា
            </h1>
            <span className="text-2xl text-rose-600">🌺</span>
          </div>
          <p
            className="text-base font-bold text-gray-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
          <div className="flex items-center justify-center mt-2">
            <span className="text-rose-600">❖</span>
            <div className="h-px w-16 bg-rose-600 mx-2"></div>
            <span className="text-rose-600">❖</span>
            <div className="h-px w-16 bg-rose-600 mx-2"></div>
            <span className="text-rose-600">❖</span>
          </div>
        </div>
        <div className="text-center mb-3">
          <h2
            className="text-lg font-bold text-rose-800"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            {honorSchoolName}
          </h2>
        </div>
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="text-3xl">🏵️</span>
            <h2
              className="text-4xl font-bold text-rose-600"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              តារាងកិត្តិយស
            </h2>
            <span className="text-3xl">🏵️</span>
          </div>
          <div className="mt-2">
            <span
              className="inline-block bg-rose-100 text-rose-800 px-5 py-1 rounded-full text-sm font-semibold"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              {honorPeriod}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ថ្នាក់៖ {selectedClass?.name} • ឆ្នាំសិក្សា {selectedClass?.year}
          </p>
        </div>
        <div className="flex-1 space-y-3 mb-5">
          {topStudents.map((report, index) => (
            <div key={report.student.id}>
              <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-3 border-2 border-rose-200">
                {showStudentPhotos ? (
                  <StudentPhoto student={report.student} size="md" />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                      index === 0
                        ? "bg-gradient-to-br from-rose-400 to-rose-600"
                        : index === 1
                        ? "bg-gradient-to-br from-pink-400 to-pink-600"
                        : index === 2
                        ? "bg-gradient-to-br from-red-400 to-red-600"
                        : "bg-gradient-to-br from-orange-400 to-orange-600"
                    }`}
                  >
                    <span
                      className="text-white text-xl font-bold"
                      style={{ fontFamily: "Khmer OS Muol" }}
                    >
                      {["១", "២", "៣", "៤", "៥", "៦"][index]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className="text-base font-bold text-gray-800"
                    style={{ fontFamily: "Khmer OS Muol Light" }}
                  >
                    {report.student.lastName} {report.student.firstName}
                  </p>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="bg-rose-50 px-2 py-1 rounded-full">
                      ពិន្ទុ:{" "}
                      <span className="font-bold text-rose-600">
                        {report.average.toFixed(2)}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-2 py-1 rounded-full">
                      និទ្ទេស:{" "}
                      <span className="font-bold">{report.letterGrade}</span>
                    </span>
                  </div>
                </div>
                <div className="text-3xl flex-shrink-0">
                  {index < 3 ? ["🏵️", "🌺", "🌸"][index] : "🌼"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-12 text-center pt-4 border-t border-rose-300">
          <div>
            <p className="text-xs mb-1">{reportDate}</p>
            <p className="text-xs mb-12">ត្រួតពិនិត្យ</p>
            <div className="inline-block border-t-2 border-rose-400 pt-1 px-8">
              <p
                className="font-semibold text-sm"
                style={{ fontFamily: "Khmer OS Muol Light" }}
              >
                {teacherName}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs mb-1">{reportDate}</p>
            <p className="text-xs mb-12">អនុញ្ញាត</p>
            <div className="inline-block border-t-2 border-rose-400 pt-1 px-8">
              <p
                className="font-semibold text-sm"
                style={{ fontFamily: "Khmer OS Muol Light" }}
              >
                {principalName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
