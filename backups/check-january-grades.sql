-- Check for January 2026 grades
SELECT 
  month,
  year,
  COUNT(*) as grade_count,
  studentId
FROM Grade
WHERE month = 'មករា' AND year = 2026
GROUP BY studentId, month, year
LIMIT 10;
