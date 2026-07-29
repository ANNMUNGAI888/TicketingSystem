import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

async function main() {
  console.log("Starting database seeding...");

  // Create ticket number sequence if it doesn't exist
  console.log("Creating ticket number sequence...");
  try {
    await prisma.$executeRaw`
      CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1
    `;
    console.log("Ticket number sequence created or already exists.");
  } catch (error) {
    console.error("Error creating sequence:", error);
  }

  // Seed admin user
  console.log("Seeding admin user...");
  const adminEmail = "admin@ticketsystem.com";
  const adminPassword = "Admin@123"; // Change after first login

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        fullName: "System Administrator",
        email: adminEmail,
        passwordHash,
        role: "IT_ADMIN",
        mustChangePass: true,
        isActive: true,
      },
    });

    console.log("Admin user created:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${adminPassword} (change after first login)`);
  } else {
    console.log("Admin user already exists, skipping creation.");
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
