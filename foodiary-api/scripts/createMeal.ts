/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://api.beatrizevittor.online/meals";
const TOKEN =
  "eyJraWQiOiJ1WkJ0cmxUeFlkb2lxZ3BpQ1UwMktieWJaREgyY05HK2JDTDhUVlFSNmpZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiMzNjYmE5YS1mMDExLTcwZmItOTMzZC1lYzFkZjM4MmY0YjEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV9mQkNsUElSd1YiLCJjbGllbnRfaWQiOiI3djl2MXNncm9kcWU1aTUxb2c2bHZwcGRwaCIsIm9yaWdpbl9qdGkiOiI0M2MzZTZkNi0wYzRhLTRlMTMtYmE3YS0zNzY0YWZhMjBmMDUiLCJpbnRlcm5hbElkIjoiMzViTTNEd0p5VVhLTXpvekVZMVlpUFkzTHZNIiwiZXZlbnRfaWQiOiIxMTNmOGJhOS03ODE0LTQ1ODktYTBlMi0zZjI5Y2FlYjFlM2UiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzYzNDU2ODA5LCJleHAiOjE3NjM1MDAwMDksImlhdCI6MTc2MzQ1NjgxMCwianRpIjoiMmRkZjI0ZjQtMTc1NS00YWMwLWFmMzYtMmFkYTdkYTU1YTczIiwidXNlcm5hbWUiOiJiMzNjYmE5YS1mMDExLTcwZmItOTMzZC1lYzFkZjM4MmY0YjEifQ.whkulzbaLLmEOlKBEggOWDP5F02zDropr8-bZWsXepDJwNXc-H4uFoy2No1QARET1kgCoLPmp2ID5KOC3c9IfBzZv9MIROSFit08YANoOeS3i5OSxWOL67OgjUvLG_toqEjzHiyKkRLKWZJaYYM30kQc6cbD-Buw-87R4UVRkBDtPD2ucdXnHX8YeyLjn9PVWq2-Fntq9iRmwGWoGuBi-DsvgCGI2WPgAYrPQqulJx2BM4WdD3IoPHzuYOjyED5eU56MCKXZ5-qmldupR6WMuvWhFKPlDGgmAlGjwb6lFJnLKL6SxYRX19DsHkD32G3cVlovkkLGI0ypQzA6Df8J-w";

interface IPresignResponse {
  uploadSignature: string;
}

interface IPresignDecoded {
  url: string;
  fields: Record<string, string>;
}

async function readFile(
  filePath: string,
  type: "audio/m4a" | "image/jpeg",
): Promise<{
  data: Buffer;
  size: number;
  type: string;
}> {
  console.log(`🔍 Reading file from disk: ${filePath}`);
  const data = await fs.readFile(filePath);
  return {
    data,
    size: data.length,
    type,
  };
}

async function createMeal(
  fileType: string,
  fileSize: number,
): Promise<IPresignDecoded> {
  console.log(
    `🚀 Requesting presigned POST for ${fileSize} bytes of type ${fileType}`,
  );
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ file: { type: fileType, size: fileSize } }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to get presigned POST: ${res.status} ${res.statusText}`,
    );
  }

  const json = (await res.json()) as IPresignResponse;
  const decoded = JSON.parse(
    Buffer.from(json.uploadSignature, "base64").toString("utf-8"),
  ) as IPresignDecoded;

  console.log("✅ Received presigned POST data");
  return decoded;
}

function buildFormData(
  fields: Record<string, string>,
  fileData: Buffer,
  filename: string,
  fileType: string,
): FormData {
  console.log(
    `📦 Building FormData with ${Object.keys(fields).length} fields and file ${filename}`,
  );
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  const blob = new Blob([fileData], { type: fileType });
  form.append("file", blob, filename);
  return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
  console.log(`📤 Uploading to S3 at ${url}`);
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `S3 upload failed: ${res.status} ${res.statusText} — ${text}`,
    );
  }

  console.log("🎉 Upload completed successfully");
}

async function uploadFile(
  filePath: string,
  fileType: "audio/m4a" | "image/jpeg",
): Promise<void> {
  try {
    const { data, size, type } = await readFile(filePath, fileType);
    const { url, fields } = await createMeal(type, size);
    const form = buildFormData(fields, data, path.basename(filePath), type);
    await uploadToS3(url, form);
  } catch (err) {
    console.error("❌ Error during uploadFile:", err);
    throw err;
  }
}

uploadFile(path.resolve(__dirname, "assets", "cover.jpg"), "image/jpeg").catch(
  () => process.exit(1),
);
