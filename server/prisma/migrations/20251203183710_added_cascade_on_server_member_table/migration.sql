-- DropForeignKey
ALTER TABLE "ServerMember" DROP CONSTRAINT "ServerMember_serverId_fkey";

-- AddForeignKey
ALTER TABLE "ServerMember" ADD CONSTRAINT "ServerMember_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
