/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'path';

const API_URL = 'https://api.beatrizevittor.online/meals';
const TOKEN =
  'eyJraWQiOiJ1WkJ0cmxUeFlkb2lxZ3BpQ1UwMktieWJaREgyY05HK2JDTDhUVlFSNmpZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiMzNjYmE5YS1mMDExLTcwZmItOTMzZC1lYzFkZjM4MmY0YjEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV9mQkNsUElSd1YiLCJjbGllbnRfaWQiOiI3djl2MXNncm9kcWU1aTUxb2c2bHZwcGRwaCIsIm9yaWdpbl9qdGkiOiI2ODg5MTgyNC00Njg2LTQ3M2EtOGZhNS05NmY1Yjg1YTU1YjEiLCJpbnRlcm5hbElkIjoiMzViTTNEd0p5VVhLTXpvekVZMVlpUFkzTHZNIiwiZXZlbnRfaWQiOiJlNDY4NWNmNS1lNzljLTQ0M2QtODNhNy02NjU5YzUxOWIzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzYzOTc3NjgxLCJleHAiOjE3NjQwMjA4ODEsImlhdCI6MTc2Mzk3NzY4MSwianRpIjoiZTIzNzU3YTAtNzdjZi00MTVkLThkYzgtYzcwOGYzMDI4M2JlIiwidXNlcm5hbWUiOiJiMzNjYmE5YS1mMDExLTcwZmItOTMzZC1lYzFkZjM4MmY0YjEifQ.Oi0KXpm60vIJLE3pOtsWlxbnZAHR7uoKoRvv2ksOqXATmnuU8XQcIDqr_g09XC0VYPxjNR411GO1Y7TqQlZk56GQSGzoEpju4oMobgytXHEdh7F0nmZ4eEmfph5yZ4P7vIlfOUUBmil_KheT3UE-qRz27kXiFYVWACKg_wN7O9VQRddFZsB1Sb0Vye67MM7TmgH4bW75d4VS-ySYgffuRazww-DKRI8uZUb3hh0QBaIkDDlreFLHwpVe4u4LitPuE6I-WJ8wnorunHXovH5cJcUArhitlPjEa8fgGZ0DYFz1cDlIkhpFtnhKtxhRPhX9vIDMUPINgRbVR3HruSzUyw';

interface IPresignResponse {
  uploadSignature: string;
}

interface IPresignDecoded {
  url: string;
  fields: Record<string, string>;
}

async function readFile(
  filePath: string,
  type: 'audio/m4a' | 'image/jpeg',
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
    Buffer.from(json.uploadSignature, 'base64').toString('utf-8'),
  ) as IPresignDecoded;

  console.log('✅ Received presigned POST data');
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
  form.append('file', blob, filename);
  return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
  console.log(`📤 Uploading to S3 at ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `S3 upload failed: ${res.status} ${res.statusText} — ${text}`,
    );
  }

  console.log('🎉 Upload completed successfully');
}

async function uploadFile(
  filePath: string,
  fileType: 'audio/m4a' | 'image/jpeg',
): Promise<void> {
  try {
    const { data, size, type } = await readFile(filePath, fileType);
    const { url, fields } = await createMeal(type, size);
    const form = buildFormData(fields, data, path.basename(filePath), type);
    await uploadToS3(url, form);
  } catch (err) {
    console.error('❌ Error during uploadFile:', err);
    throw err;
  }
}

uploadFile(path.resolve(__dirname, 'assets', 'cover.jpg'), 'image/jpeg').catch(
  () => process.exit(1),
);
