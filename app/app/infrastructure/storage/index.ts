import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import Failure from '~/lib/failure';

export class BlobStorage {
  private filename: string;
  private file: File;
  private s3: S3Client;

  constructor(filename: string, file: File) {
    this.filename = filename;
    this.file = file;
    console.log({
      forcePathStyle: true,
      region: process.env.DIGITAL_OCEAN_REGION!,
      endpoint: process.env.DIGITAL_OCEAN_ENDPOINT_URL!,
      credentials: {
        accessKeyId: process.env.DIGITAL_OCEAN_API_ID!,
        secretAccessKey: process.env.DIGITAL_OCEAN_API_KEY!,
      },
    });
    this.s3 = new S3Client({
      forcePathStyle: true,
      region: process.env.DIGITAL_OCEAN_REGION!,
      endpoint: process.env.DIGITAL_OCEAN_ENDPOINT_URL!,
      credentials: {
        accessKeyId: process.env.DIGITAL_OCEAN_API_ID!,
        secretAccessKey: process.env.DIGITAL_OCEAN_API_KEY!,
      },
    });
  }

  async upload() {
    const params: PutObjectCommandInput = {
      Key: this.filename,
      Bucket: process.env.DIGITAL_OCEAN_BUCKET,
      Body: Buffer.from(await this.file.arrayBuffer()),
      ContentType: this.file.type,
      ACL: 'public-read',
    };

    try {
      await this.s3.send(new PutObjectCommand(params));
      return `${process.env.DIGITAL_OCEAN_ENDPOINT_URL!.replace(
        `${process.env.DIGITAL_OCEAN_REGION}.`,
        `${process.env.DIGITAL_OCEAN_REGION}.cdn.`,
      )}/images/${this.filename}`;
    } catch (error) {
      console.error(error);
      throw new Failure('internal_error', 'Failed to upload file to storage');
    }
  }
}
