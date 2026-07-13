import { google } from "googleapis";

const googleDriveService = {
  async getFiles() {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const drive = google.drive({
      auth,
    });

    const files = await drive.files.list({
      pageSize: 1000,
      fields: "nextPageToken, files(id, name, mimeType, size, createdTime)",
    });
    console.log(files.data);
    return files.data;
  }
};
await googleDriveService.getFiles();

export default googleDriveService;
