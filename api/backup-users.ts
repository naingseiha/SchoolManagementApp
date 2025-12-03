import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function backupUsers() {
  try {
    const users = await prisma.user. findMany();
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📦 Backing up ${users.length} users... `);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    fs.writeFileSync(
      "prisma/backup-users.json",
      JSON.stringify(users, null, 2)
    );
    
    console.log("✅ Users backed up to prisma/backup-users.json");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

backupUsers();
