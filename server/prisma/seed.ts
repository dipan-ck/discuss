// prisma/seed.ts
import prisma from "../src/lib/prisma"

async function main() {
  console.log("Seeding database...")

  // 1. Create Users
  const alice = await prisma.user.create({
    data: {
      username: "alice",
      email: "alice@example.com",
      password: "hashedpassword1",
    },
  })

  const bob = await prisma.user.create({
    data: {
      username: "bob",
      email: "bob@example.com",
      password: "hashedpassword2",
    },
  })

  const carol = await prisma.user.create({
    data: {
      username: "carol",
      email: "carol@example.com",
      password: "hashedpassword3",
    },
  })

  // 2. Create Servers
  const server1 = await prisma.server.create({
    data: {
      name: "Gaming Server",
      ownerId: alice.id,
    },
  })

  const server2 = await prisma.server.create({
    data: {
      name: "Study Server",
      ownerId: bob.id,
    },
  })

  // 3. Add Server Members
  await prisma.serverMember.createMany({
    data: [
      { serverId: server1.id, userId: alice.id, role: "OWNER" },
      { serverId: server1.id, userId: bob.id, role: "MEMBER" },
      { serverId: server1.id, userId: carol.id, role: "MEMBER" },
      { serverId: server2.id, userId: bob.id, role: "OWNER" },
      { serverId: server2.id, userId: alice.id, role: "MEMBER" },
    ],
  })

  // 4. Create Channels
  const generalChannel1 = await prisma.channel.create({
    data: {
      name: "general",
      type: "TEXT",
      serverId: server1.id,
    },
  })

  const gamingChannel = await prisma.channel.create({
    data: {
      name: "gaming-chat",
      type: "TEXT",
      serverId: server1.id,
    },
  })

  const studyChannel = await prisma.channel.create({
    data: {
      name: "general",
      type: "TEXT",
      serverId: server2.id,
    },
  })

  // 5. Add Messages
  await prisma.message.createMany({
    data: [
      {
        channelId: generalChannel1.id,
        userId: alice.id,
        content: "Welcome to the Gaming Server!",
      },
      {
        channelId: generalChannel1.id,
        userId: bob.id,
        content: "Hi everyone! Excited to play!",
      },
      {
        channelId: gamingChannel.id,
        userId: carol.id,
        content: "Anyone up for a game tonight?",
      },
      {
        channelId: studyChannel.id,
        userId: bob.id,
        content: "Welcome to the Study Server!",
      },
      {
        channelId: studyChannel.id,
        userId: alice.id,
        content: "Thanks! Ready to study!",
      },
    ],
  })

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
