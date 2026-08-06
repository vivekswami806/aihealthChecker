import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';

import prisma from './database.js';
import { config } from './index.js';

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('Google account has no email'));
        }

        let user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName,
              authProvider: 'GOOGLE',
              isVerified: true,
            },
          });
        } else {
          user = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              authProvider: 'GOOGLE',
              isVerified: true,
              lastLoginAt: new Date(),
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

/*
passport.use(
  new GitHubStrategy.Strategy(
    {
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@github.local`;

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName:
                profile.displayName || profile.username,
              authProvider: 'GITHUB',
              isVerified: true,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
*/

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;