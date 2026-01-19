-- Check if indexes already exist in production
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'users' 
  AND indexname LIKE '%isActive%';
