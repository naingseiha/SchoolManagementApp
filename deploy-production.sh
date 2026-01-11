#!/bin/bash

# 🛡️ SAFE PRODUCTION DEPLOYMENT SCRIPT
# This script ensures safe deployment with backups and verification

set -e  # Exit on any error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  PRODUCTION DEPLOYMENT - STUDENT LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
ask_confirmation() {
    read -p "$(echo -e ${YELLOW}$1${NC}) [y/N]: " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "📋 PRE-DEPLOYMENT CHECKLIST"
echo ""

# 1. Load DATABASE_URL from api/.env if not set
if [ -z "$DATABASE_URL" ]; then
    if [ -f "api/.env" ]; then
        echo "📄 Loading DATABASE_URL from api/.env..."
        export $(grep -v '^#' api/.env | grep DATABASE_URL | xargs)
        if [ -z "$DATABASE_URL" ]; then
            print_error "DATABASE_URL not found in api/.env"
            exit 1
        fi
        print_success "DATABASE_URL loaded from api/.env"
    else
        print_error "DATABASE_URL not set and api/.env not found"
        echo "Please either:"
        echo "  1. Add DATABASE_URL to api/.env, OR"
        echo "  2. Export it: export DATABASE_URL=\"your-url\""
        exit 1
    fi
else
    print_success "DATABASE_URL is set (from environment)"
fi

# 2. Verify we're on production
echo ""
print_warning "CRITICAL: This will modify PRODUCTION database"
echo "Database: $(echo $DATABASE_URL | grep -o 'neondb' || echo 'Unknown')"
echo ""

if ! ask_confirmation "Are you ABSOLUTELY SURE this is the correct database?"; then
    print_error "Deployment cancelled"
    exit 1
fi

# 3. Check for backup
echo ""
echo "🔄 Step 1: Database Backup"
BACKUP_FILE="backup_before_student_login_$(date +%Y%m%d_%H%M%S).sql"

if ask_confirmation "Create database backup now?"; then
    echo "Creating backup..."
    if command -v pg_dump &> /dev/null; then
        pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
        if [ -f "$BACKUP_FILE" ]; then
            print_success "Backup created: $BACKUP_FILE"
            BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
            echo "   Size: $BACKUP_SIZE"
        else
            print_error "Backup failed"
            exit 1
        fi
    else
        print_warning "pg_dump not found. Please create backup manually in Neon dashboard."
        if ! ask_confirmation "Have you created a backup in Neon dashboard?"; then
            print_error "Please create backup first"
            exit 1
        fi
    fi
else
    print_warning "Skipping backup creation"
    if ! ask_confirmation "Do you have a recent backup?"; then
        print_error "Please create backup first"
        exit 1
    fi
fi

# 4. Review migration
echo ""
echo "🔍 Step 2: Review Migration"
echo "Generating migration SQL..."
cd api
npx prisma migrate dev --create-only --name add_student_login_and_roles 2>&1 | tail -20

echo ""
print_warning "Please review the migration file in api/prisma/migrations/"
if ! ask_confirmation "Does the migration look safe? (No data deletion)"; then
    print_error "Please review migration manually"
    exit 1
fi

# 5. Deploy migration
echo ""
echo "🚀 Step 3: Deploy Migration"
if ask_confirmation "Deploy migration to production database?"; then
    echo "Deploying migration..."
    npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        print_success "Migration deployed successfully"
    else
        print_error "Migration failed"
        echo ""
        print_warning "To rollback, run:"
        echo "  psql \$DATABASE_URL < $BACKUP_FILE"
        exit 1
    fi
else
    print_error "Migration cancelled"
    exit 1
fi

# 6. Verify migration
echo ""
echo "✅ Step 4: Verify Migration"
npx prisma migrate status

if [ $? -eq 0 ]; then
    print_success "Migration status: OK"
else
    print_error "Migration status: FAILED"
    exit 1
fi

# 7. Set default values for existing students
echo ""
echo "🔄 Step 5: Set Default Values"
if ask_confirmation "Set default values for all existing students?"; then
    echo "Updating students..."
    npx prisma db execute --stdin <<EOF
UPDATE students 
SET 
  "isAccountActive" = true, 
  "studentRole" = 'GENERAL'::\"StudentRole\"
WHERE 
  "isAccountActive" IS NULL 
  OR "studentRole" IS NULL;
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Default values set"
    else
        print_warning "Could not set defaults (may already be set)"
    fi
fi

cd ..

# 8. Git status
echo ""
echo "📦 Step 6: Prepare Code Deployment"
echo "Git status:"
git status --short

echo ""
if ask_confirmation "Commit and push changes?"; then
    git add .
    git commit -m "feat: add student login system with account management"
    
    print_warning "About to push to production..."
    echo "This will trigger:"
    echo "  - Render: API deployment (automatic)"
    echo "  - Vercel: Frontend deployment (automatic)"
    echo ""
    
    if ask_confirmation "Push to production?"; then
        git push origin main
        print_success "Code pushed to production"
        echo ""
        echo "🔄 Deployments starting..."
        echo "  - Check Render dashboard for API deployment"
        echo "  - Check Vercel dashboard for frontend deployment"
    else
        print_warning "Push cancelled. You can push manually later with:"
        echo "  git push origin main"
    fi
fi

# 9. Final checklist
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 POST-DEPLOYMENT CHECKLIST:"
echo ""
echo "  [ ] Wait for Render deployment to complete"
echo "  [ ] Wait for Vercel deployment to complete"
echo "  [ ] Test teacher login (should work unchanged)"
echo "  [ ] Test API health: curl https://schoolmanagementapp-3irq.onrender.com/api/health"
echo "  [ ] Check admin statistics: GET /api/admin/accounts/statistics"
echo "  [ ] Create student accounts: npx ts-node api/scripts/create-student-accounts.ts"
echo "  [ ] Test student login with student code"
echo "  [ ] Monitor Neon dashboard for errors"
echo "  [ ] Monitor Render logs for errors"
echo ""
echo "📄 DOCUMENTATION:"
echo "  - STUDENT_LOGIN_IMPLEMENTATION.md - API docs"
echo "  - STUDENT_LOGIN_QUICKSTART.md - User guide"
echo "  - PRODUCTION_DEPLOYMENT_SAFETY.md - This guide"
echo ""
echo "🆘 ROLLBACK (if needed):"
echo "  1. Revert deployments in Render/Vercel dashboards"
echo "  2. Restore database: psql \$DATABASE_URL < $BACKUP_FILE"
echo ""
print_success "Deployment script completed!"
echo ""
