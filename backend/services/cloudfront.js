import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

const distributionName = process.env.CLOUDFRONT_DISTRIBUTION_NAME;
const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString();

export const createCloudfrontGetSignedUrl = ({ key, download, filename }) => {
  // const url = `${distributionName}/${key}?response-content-disposition=attachment;filename="${filename}"`;
  // let baseUrl = `${distributionName}/${key}`;

  const url = new URL(`${distributionName}/${key}`);

  if (download) {
    url.searchParams.set('download', 'true');
  }

  // 4. Generate the signed response using the custom policy structure
  const signedUrl = getSignedUrl({
    url: url.toString(),
    keyPairId,
    privateKey,
    dateLessThan,
  });

  return signedUrl;
};
