// import prisma from '../config/database.js';
// import bcrypt from 'bcryptjs';

// export class UserRepository {

//   // ======================
//   // FIND USER BY EMAIL
//   // ======================
//   async findByEmail(email) {
//     return prisma.user.findUnique({
//       where: { email },
//       include: {
//         subscriptions: true,
//       },
//     });
//   }

//   // ======================
//   // FIND USER BY ID
//   // ======================
//   async findById(id) {
//     return prisma.user.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         email: true,
//         fullName: true,
//         profileImage: true,
//         role: true,
//         isVerified: true,
//         createdAt: true,
//         updatedAt: true,
//         subscriptions: true,
//       },
//     });
//   }

//   // ======================
//   // CREATE USER
//   // ======================
//   async create(userData) {
//     const { email, password, fullName } = userData;

//     const hashedPassword = password
//       ? await bcrypt.hash(password, 10)
//       : null;

//     return prisma.user.create({
//       data: {
//         email,
//         passwordHash: hashedPassword,
//         fullName,
//         AuthProvider:'LOCAL',
//         isVerified: userData.is_verified || false,
//       },
//     });
//   }

//   // ======================
//   // UPDATE USER
//   // ======================
//   async update(id, updateData) {
//     return prisma.user.update({
//       where: { id },
//       data: updateData,
//     });
//   }

//   // ======================
//   // DELETE USER
//   // ======================
//   async delete(id) {
//     return prisma.user.delete({
//       where: { id },
//     });
//   }

//   // ======================
//   // GOOGLE LOGIN
//   // ======================
//   async findByGoogleId(googleId) {
//     return prisma.user.findFirst({
//       where: { googleId },
//     });
//   }

//   // ======================
//   // GITHUB LOGIN
//   // ======================
//   async findByGithubId(githubId) {
//     return prisma.user.findFirst({
//       where: { githubId },
//     });
//   }

//   // ======================
//   // UPDATE LAST LOGIN
//   // ======================
//   async updateLastLogin(id) {
//     return prisma.user.update({
//       where: { id },
//       data: {
//         lastLoginAt: new Date(),
//       },
//     });
//   }

//   // ======================
//   // VERIFY PASSWORD
//   // ======================
//   async verifyPassword(user, password) {
//     if (!user.passwordHash) return false;
//     return bcrypt.compare(password, user.passwordHash);
//   }

//   // ======================
//   // HASH PASSWORD
//   // ======================
//   async hashPassword(password) {
//     return bcrypt.hash(password, 10);
//   }

//   // ======================
//   // GET ALL USERS
//   // ======================
//   async getAllUsers(skip = 0, take = 10) {
//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         skip,
//         take,
//         select: {
//           id: true,
//           email: true,
//           fullName: true,
//           role: true,
//           isVerified: true,
//           createdAt: true,
//           lastLoginAt: true,
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       }),
//       prisma.user.count(),
//     ]);

//     return { users, total };
//   }

//   // ======================
//   // CREATE SESSION
//   // ======================
//   async createSession(userId, refreshToken, userAgent, ipAddress) {
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);

//     return prisma.session.create({
//       data: {
//         userId,
//         refreshToken,
//         userAgent,
//         ipAddress,
//         expiresAt,
//       },
//     });
//   }

//   // ======================
//   // FIND SESSION
//   // ======================
//   async findSession(userId, refreshToken) {
//     return prisma.session.findFirst({
//       where: {
//         userId,
//         refreshToken,
//         expiresAt: {
//           gt: new Date(),
//         },
//       },
//     });
//   }

//   // ======================
//   // DELETE SESSION
//   // ======================
//   async deleteSession(sessionId) {
//     return prisma.session.delete({
//       where: { id: sessionId },
//     });
//   }

//   // ======================
//   // DELETE ALL SESSIONS
//   // ======================
//   async deleteAllUserSessions(userId) {
//     return prisma.session.deleteMany({
//       where: { userId },
//     });
//   }
// }

// export default new UserRepository();



import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

export class UserRepository {
  // ======================
  // FIND USER BY EMAIL
  // ======================
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: true,
      },
    });
  }
// ======================
// FIND USER BY GOOGLE ID
// ======================
async findByGoogleId(googleId) {
  return prisma.user.findUnique({
    where: {
      googleId,
    },
  });
}

// ======================
// FIND USER BY GITHUB ID
// ======================
async findByGithubId(githubId) {
  return prisma.user.findUnique({
    where: {
      githubId,
    },
  });
}
  // ======================
  // FIND USER BY ID
  // ======================
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        profileImage: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: true,
      },
    });
  }

  // ======================
  // CREATE USER
  // ======================
  async create(userData) {
    const {
      email,
      password,
      fullName,
      authProvider = 'LOCAL',
      isVerified = false,
    } = userData;

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : null;

    return prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        authProvider,
        isVerified,
      },
    });
  }

  // ======================
  // UPDATE USER
  // ======================
  async update(id, updateData) {
    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // ======================
  // DELETE USER
  // ======================
  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }

  // ======================
  // UPDATE LAST LOGIN
  // ======================
  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  // ======================
  // VERIFY PASSWORD
  // ======================
  async verifyPassword(user, password) {
    if (!user.passwordHash) return false;

    return bcrypt.compare(password, user.passwordHash);
  }

  // ======================
  // HASH PASSWORD
  // ======================
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  // ======================
  // GET ALL USERS
  // ======================
  async getAllUsers(skip = 0, take = 10) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  }

  // ======================
  // CREATE SESSION
  // ======================
  async createSession(
    userId,
    refreshToken,
    userAgent,
    ipAddress
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return prisma.session.create({
      data: {
        userId,
        refreshToken,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });
  }

  // ======================
  // FIND SESSION
  // ======================
  async findSession(userId, refreshToken) {
    return prisma.session.findFirst({
      where: {
        userId,
        refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  // ======================
  // DELETE SESSION
  // ======================
  async deleteSession(sessionId) {
    return prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
  }

  // ======================
  // DELETE ALL SESSIONS
  // ======================
  async deleteAllUserSessions(userId) {
    return prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }
}

export default new UserRepository();