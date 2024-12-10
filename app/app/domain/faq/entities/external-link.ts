import type { ExternalLink as ExternalLinkORM } from '@prisma/client';
import { SocialLink as SocialLinkORM } from '@prisma/client';

export const SocialLink: typeof SocialLinkORM = {
  FACEBOOK: 'FACEBOOK',
  TWITTER: 'TWITTER',
  INSTAGRAM: 'INSTAGRAM',
  YOUTUBE: 'YOUTUBE',
  THREADS: 'THREADS',
  SNAPCHAT: 'SNAPCHAT',
};

export class ExternalLinkEntity {
  id?: ExternalLinkORM['id'];
  url: ExternalLinkORM['url'];
  userProfileId?: ExternalLinkORM['userProfileId'];
  type: ExternalLinkORM['type'];

  constructor(
    externalLink: Pick<ExternalLinkORM, 'url' | 'type'> &
      Partial<Pick<ExternalLinkORM, 'id' | 'userProfileId'>>
  ) {
    this.id = externalLink.id;
    this.url = externalLink.url;
    this.userProfileId = externalLink.userProfileId;
    this.type = externalLink.type;
  }

  json(): ExternalLinkDTO {
    return {
      id: this.id,
      url: this.url,
      userProfileId: this.userProfileId,
      type: this.type,
    } as ExternalLinkDTO;
  }
}

export type ExternalLinkDTO = ExternalLinkEntity;
