const axios = require('axios');

async function test() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@school.edu.kh',
      password: 'admin123'
    });
    const token = loginRes.data.data.token;

    // Get Results screen data for class 11ក
    const resultsRes = await axios.get(
      'http://localhost:5001/api/reports/monthly/cmiq805mh0015q0jal0pu36yp?month=ធ្នូ&year=2025',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const resultsData = resultsRes.data.data;
    console.log('\n=== RESULTS SCREEN (Class 11ក) ===');
    console.log('Class Name:', resultsData.className);
    console.log('Total Students:', resultsData.students.length);
    console.log('Total Coefficient:', resultsData.totalCoefficient);

    // Count grade distribution
    const gradeDist = {A: 0, B: 0, C: 0, D: 0, E: 0, F: 0};
    let totalAvg = 0;
    let passCount = 0;

    resultsData.students.forEach(s => {
      gradeDist[s.gradeLevel]++;
      totalAvg += parseFloat(s.average);
      if (s.gradeLevel !== 'F') passCount++;
    });

    console.log('\nGrade Distribution:');
    console.log('  A:', gradeDist.A);
    console.log('  B:', gradeDist.B);
    console.log('  C:', gradeDist.C);
    console.log('  D:', gradeDist.D);
    console.log('  E:', gradeDist.E);
    console.log('  F:', gradeDist.F);
    console.log('\nClass Average:', (totalAvg / resultsData.students.length).toFixed(2));
    console.log('Pass Count:', passCount);
    console.log('Pass Rate:', ((passCount / resultsData.students.length) * 100).toFixed(1) + '%');

    // Sample student
    console.log('\nSample Student (First):', resultsData.students[0].studentName);
    console.log('  Total Score:', resultsData.students[0].totalScore);
    console.log('  Average:', resultsData.students[0].average);
    console.log('  Grade Level:', resultsData.students[0].gradeLevel);

    // Get Statistics screen data
    const statsRes = await axios.get(
      'http://localhost:5001/api/dashboard/comprehensive-stats',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const grade11 = statsRes.data.data.grades.find(g => g.grade === '11');
    const class11k = grade11.classes.find(c => c.name === 'ថ្នាក់ទី11ក');

    console.log('\n\n=== STATISTICS SCREEN (Class 11ក) ===');
    console.log('Class Name:', class11k.name);
    console.log('Student Count:', class11k.studentCount);
    console.log('\nGrade Distribution:');
    console.log('  A:', class11k.gradeDistribution.A.total);
    console.log('  B:', class11k.gradeDistribution.B.total);
    console.log('  C:', class11k.gradeDistribution.C.total);
    console.log('  D:', class11k.gradeDistribution.D.total);
    console.log('  E:', class11k.gradeDistribution.E.total);
    console.log('  F:', class11k.gradeDistribution.F.total);
    console.log('\nClass Average:', class11k.averageScore);
    console.log('Pass Count:', class11k.passedCount);
    console.log('Pass Rate:', class11k.passPercentage + '%');

    // Compare
    console.log('\n\n=== COMPARISON ===');
    console.log('Grade A - Results:', gradeDist.A, '| Statistics:', class11k.gradeDistribution.A.total, '| Match:', gradeDist.A === class11k.gradeDistribution.A.total ? '✅' : '❌');
    console.log('Grade B - Results:', gradeDist.B, '| Statistics:', class11k.gradeDistribution.B.total, '| Match:', gradeDist.B === class11k.gradeDistribution.B.total ? '✅' : '❌');
    console.log('Grade C - Results:', gradeDist.C, '| Statistics:', class11k.gradeDistribution.C.total, '| Match:', gradeDist.C === class11k.gradeDistribution.C.total ? '✅' : '❌');
    console.log('Grade D - Results:', gradeDist.D, '| Statistics:', class11k.gradeDistribution.D.total, '| Match:', gradeDist.D === class11k.gradeDistribution.D.total ? '✅' : '❌');
    console.log('Grade E - Results:', gradeDist.E, '| Statistics:', class11k.gradeDistribution.E.total, '| Match:', gradeDist.E === class11k.gradeDistribution.E.total ? '✅' : '❌');
    console.log('Grade F - Results:', gradeDist.F, '| Statistics:', class11k.gradeDistribution.F.total, '| Match:', gradeDist.F === class11k.gradeDistribution.F.total ? '✅' : '❌');
    console.log('Pass Count - Results:', passCount, '| Statistics:', class11k.passedCount, '| Match:', passCount === class11k.passedCount ? '✅' : '❌');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

test();
