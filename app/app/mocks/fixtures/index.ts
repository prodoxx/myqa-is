import { faker } from '@faker-js/faker';
import { UserEntity } from '~/domain/faq/entities/user';

/**
 * A base fake user entity that does not yet exist in the database.
 */
export const mockUserEntity = new UserEntity({
  id: 1,
  password: 'test',
  email: faker.internet.email(),
  username: 'bikingwithdave',
  createdAt: new Date(),
  updatedAt: new Date(),
});
