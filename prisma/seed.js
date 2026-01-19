import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing plans (optional - comment out if you want to keep existing data)
  // await prisma.plan.deleteMany({});
  // console.log('🗑️  Cleared existing plans');

  // Create subscription plans
  const plans = [
    {
      name: 'Free Plan',
      type: 'free',
      generalOptimization: true,
      jobOptimization: false,
      stripe_product_id: null, // Replace with your actual Stripe Product ID for free plan
      stripe_price_id: null, // Replace with your actual Stripe Price ID for free plan
      is_active: true,
    },
    {
      name: 'Job Optimization',
      type: 'Monthly',
      generalOptimization: true,
      jobOptimization: true,
      stripe_product_id: 'prod_TmcipUg5NEu6xo',
      stripe_price_id: 'price_1Sp3TJRtODtXJpl6N3oPNv1n',
      is_active: false,
    },
  ];

  // Upsert plans (create if doesn't exist, update if exists)
  for (const plan of plans) {
    let createdPlan;

    // If plan has stripe_product_id, use upsert with stripe_product_id
    if (plan.stripe_product_id) {
      createdPlan = await prisma.plan.upsert({
        where: {
          stripe_product_id: plan.stripe_product_id,
        },
        update: {
          name: plan.name,
          type: plan.type,
          generalOptimization: plan.generalOptimization,
          jobOptimization: plan.jobOptimization,
          stripe_price_id: plan.stripe_price_id,
          is_active: plan.is_active,
        },
        create: plan,
      });
    } else {
      // For plans without stripe_product_id, check if plan with same name/type exists
      const existingPlan = await prisma.plan.findFirst({
        where: {
          name: plan.name,
          type: plan.type,
          stripe_product_id: null, // Only match plans without Stripe IDs
        },
      });

      if (existingPlan) {
        // Update existing plan
        createdPlan = await prisma.plan.update({
          where: {
            id: existingPlan.id,
          },
          data: {
            name: plan.name,
            type: plan.type,
            generalOptimization: plan.generalOptimization,
            jobOptimization: plan.jobOptimization,
            stripe_price_id: plan.stripe_price_id,
            is_active: plan.is_active,
          },
        });
      } else {
        // Create new plan
        createdPlan = await prisma.plan.create({
          data: plan,
        });
      }
    }

    console.log(`✅ Plan created/updated: ${createdPlan.name} (${createdPlan.id})`);
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
