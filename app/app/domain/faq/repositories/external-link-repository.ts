import prisma from '~/infrastructure/database/index.server';
import { ExternalLinkEntity } from '../entities/external-link';

export class ExternalLinkRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new ExternalLinkEntity(data);
  }
}
