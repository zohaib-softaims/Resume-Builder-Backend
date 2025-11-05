import prisma from "../src/lib/prisma.js";

const createTestUser = async () => {
  try {
    // Test user data
    const testUser = {
      id: "test_user_123",
      email: "test@example.com",
      name: "Test User",
      image_url: null,
    };

    console.log("Creating test user...");
    console.log("User data:", testUser);

    const user = await prisma.user.upsert({
      where: { id: testUser.id },
      update: testUser,
      create: testUser,
    });

    console.log("\n✓ Test user created successfully!");
    console.log("\nUser details:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Name:", user.name);
    console.log("Created at:", user.createdAt);

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error creating test user:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

createTestUser();
