import { AbortMultipartUploadCommand, S3Client } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { getErrorMessage } from '~/lib/error-messages';
import Failure from '~/lib/failure';

export class BlobStorage {
  private bucket: string;
  private s3: S3Client;

  constructor(bucket: string, accessKeyId: string, secretAccessKey: string, region: string) {
    this.bucket = bucket;
    this.s3 = new S3Client({
      region: region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(path: string, file: File) {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: path,
      UploadId: nanoid(),
    });

    try {
      await this.s3.send(command);
    } catch (e) {
      throw new Failure('internal_error', getErrorMessage(e));
    }
  }
}
