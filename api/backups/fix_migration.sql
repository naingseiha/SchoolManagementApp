-- Remove the incorrect migration entry
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20260112233943_optimize_login_performance';
