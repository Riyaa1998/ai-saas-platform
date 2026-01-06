import { PrismaClient } from "@prisma/client";

// Create a custom type that includes both camelCase and lowercase model names
type PrismaClientWithModels = PrismaClient & {
  userApiLimit: any;
  userapilimit: any;
  userSubscription: any;
  usersubscription: any;
}

const prismaClient = new PrismaClient() as PrismaClientWithModels;

// Create a custom proxy for prisma to handle the model name mismatch
const prisma = new Proxy(prismaClient, {
  get(target, prop) {
    // Handle the model name mismatch for userApiLimit
    if (prop === 'userApiLimit') {
      return (target as any).userapilimit;
    }
    
    // Handle the model name mismatch for userSubscription
    if (prop === 'userSubscription') {
      return (target as any).usersubscription;
    }
    
    return target[prop as keyof typeof target];
  }
});

export default prisma;
