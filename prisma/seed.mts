import { faker } from '@faker-js/faker';
import { CountryCode, PrismaClient } from '@prisma/client';
import bycrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { differenceInYears } from 'date-fns';

const db = new PrismaClient();

const seed = async () => {
  const password = await bycrypt.hash('password', 12)

  // Create gigged user
  let user;

  try {
    user = await db.user.create({
      data: {
        email: 'admin@myfaq.is',
        username: "admin",
        password,
      },
    });
  } catch (e) {
    user = await db.user.create({
      data: {
        email: faker.internet.email({ allowSpecialCharacters: true }),
        username: nanoid(),
        password,
      },
    });
  }


  // Create fake business
  const createUser = async (index: number) => {
    const businessName = faker.company.buzzNoun();

    const newUser = await db.user.create({
      data: {
        email: `business-${index}${nanoid(2)}@myfaq.is`,
        username: businessName.toLowerCase() + nanoid(3),
        password,
        UserProfile: {
          create: {
            country: CountryCode.US,
            dateOfBirth: new Date(differenceInYears(new Date(), new Date(1997, 10, 10))),
          }
        }
      },
    });

    return newUser;
  }

  // populate with products
  await Promise.all(
    Array.from(Array(5).keys()).map(async (_, index) => {
      await createUser(index);
    })
  )
};

seed();
