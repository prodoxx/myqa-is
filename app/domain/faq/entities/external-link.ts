import type { ExternalLink as ExternalLinkORM } from '@prisma/client';

export class ExternalLinkEntity {
  id?: ExternalLinkORM['id'];
  name?: ExternalLinkORM['name'];
  url?: ExternalLinkORM['url'];
  userProfileId?: ExternalLinkORM['userProfileId'];

  constructor(externalLink: ExternalLinkORM) {
    this.id = externalLink.id;
    this.name = externalLink.name;
    this.url = externalLink.url;
    this.userProfileId = externalLink.userProfileId;
  }

  json(): ExternalLinkDTO {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      userProfileId: this.userProfileId,
    } as ExternalLinkDTO;
  }
}

export type ExternalLinkDTO = ExternalLinkEntity;
