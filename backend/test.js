import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const allPosts = await prisma.posts.findMany();
  console.log(allPosts);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

  