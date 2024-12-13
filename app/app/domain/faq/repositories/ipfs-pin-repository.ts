import { IpfsPinEntity } from '../entities/ipfs-pin';

export class IpfsPinRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new IpfsPinEntity(data);
  }
}
