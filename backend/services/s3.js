import 'dotenv/config';
import {
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const createUploadSignedUrl = async ({ key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(['content-type']),
  });
};

export const createGetSignedUrl = async ({
  key,
  download = false,
  filename,
}) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: download
      ? `attachment; filename="${filename}"`
      : `inline`,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });
};

export const getS3FileMetaData = async (key) => {
  const command = new HeadObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  return response;
};

export const deleteS3File = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  return s3Client.send(command);
};

export const deleteS3Files = async (keys) => {
  const command = new DeleteObjectsCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Delete: {
      Objects: keys,
    },
  });

  return s3Client.send(command);
};
