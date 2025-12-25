import z from "zod";
import prisma from "../lib/prisma";


class ServerService {

      private nameSchema = z
  .string()
  .min(3, { message: "Server name must be at least 3 characters" })
  .max(30, { message: "Server name cannot exceed 30 characters" });




  validateServerName(name: string) {
    return this.nameSchema.parse(name); 
  }

  async createServer(name: string, ownerId: string){
       
    return await prisma.server.create({
        data : {
            name,
            ownerId
        }
    })
  }

async getUserServers(userId: string) {

 const memberships =  await prisma.serverMember.findMany({
    where: { userId },
    select: {
      role: true,
      server: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

    return memberships.map(m => ({
    id: m.server.id,
    name: m.server.name,
    role: m.role
  }));
}





  async addMemberToServer(serverId: string, userId: string, role: 'ADMIN' | 'MEMBER' | "OWNER"){ 
    await prisma.serverMember.create({
        data : {
            serverId,
            userId,
            role
        }
    })

  }



  async verifyServerRole(serverId: string, userId: string){
    
    const membership = await prisma.serverMember.findFirst({
        where: {
            serverId,
            userId
        },
        select: {
            role: true
        }
    })

      // Not even a member → reject
  if (!membership) return false;

    // Only OWNER or ADMIN allowed
  return membership.role === "OWNER" || membership.role === "ADMIN";

  }


  async verifyServerOwnerShip(serverId: string, userId: string) {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { ownerId: true },
    });

    if (!server) return false;

    return server.ownerId === userId;
}


  async deleteServer(serverId: string) {
    await prisma.server.delete({
        where: { id: serverId }
    });

    }

    async isServerMember(serverId: string, userId: string) {
        const membership = await prisma.serverMember.findFirst({
            where: {
                serverId,
                userId
            }
        });

        if (!membership) return false;

        return true;
    }


async searchServersByName(nameQuery: string) {
  return await prisma.server.findMany({
    where: {
      name: {
        contains: nameQuery,
        mode: "insensitive",
      },
    },
    take: 30,
    select: {
      id: true,
      name: true,
      _count: {
        select: { members: true }
      }
    }
  });
}


    

async removeUserFromServer(serverId: string, userId: string) {
  await prisma.serverMember.deleteMany({
    where: {
      serverId,
      userId,
    },
  });
}


}


export const serverService = new ServerService();