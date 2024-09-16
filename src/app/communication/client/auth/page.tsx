import { getCompanyId } from "@/lib/companyId";
import { db } from "@/lib/db";
import { google } from "googleapis";

export default async function Page({
  searchParams,
}: {
  searchParams: { code: string };
}) {
  const code = searchParams.code;

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/communication/client/auth`,
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      const companyId = await getCompanyId();
      await db.company.update({
        where: { id: companyId },
        data: {
          googleRefreshToken: tokens.refresh_token,
        },
      });
    }
  } catch (error) {
    console.log("Error getting token", error);
  }

  return <div>Connecting with Google...</div>;
}
