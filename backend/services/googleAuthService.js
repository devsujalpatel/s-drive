import { OAuth2Client} from "google-auth-library";



async function main() {
  const oAuth2Client = await getAuthenticatedClient();
  const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
  const res = await oAuth2Client.fetch(url);
  console.log(res.data);

  const tokenInfo = await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token
  );
  console.log(tokenInfo);
}