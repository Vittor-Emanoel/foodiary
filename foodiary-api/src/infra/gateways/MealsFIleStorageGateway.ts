import KSUID from "ksuid";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { s3Client } from "@infra/clients/s3Client";
import { AppConfig } from "@shared/config/AppConfig";
import { minutesToSeconds } from "@shared/utils/minutosToSeconds";

@Injectable()
export class MealsFileStorageGateway {
  constructor(private readonly config: AppConfig) {}

  static generateInputFileKey({
    accountId,
    inputType,
  }: MealsFileStorageGateway.GenerateInputFileKeyParams) {
    const extension = inputType === Meal.InputType.AUDIO ? "m4a" : "jpeg";
    const fileName = `${KSUID.randomSync().string}.${extension}`;

    return `${accountId}/${fileName}`;
  }

  async createPost({
    file: { key, size, inputType },
    mealId,
  }: MealsFileStorageGateway.CreatePOSTParams): Promise<MealsFileStorageGateway.CreatePOSTResult> {
    const bucket = this.config.storage.mealsBucket;
    const contenType =
      inputType === Meal.InputType.AUDIO ? "audio/m4a" : "image/jpeg";

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key: key,
      Expires: minutesToSeconds(5),
      Conditions: [
        { bucket },
        ["eq", "$key", key],
        ["eq", "$Content-Type", contenType],
        ["content-length-range", size, size],
      ],
      Fields: {
        "x-amz-meta-mealid": mealId,
      },
    });

    const uploadSignature = Buffer.from(
      JSON.stringify({
        url,
        fields: {
          ...fields,
          "Content-Type": contenType,
        },
      }),
    ).toString("base64");

    return {
      uploadSignature,
    };
  }
}

export namespace MealsFileStorageGateway {
  export type GenerateInputFileKeyParams = {
    accountId: string;
    inputType: Meal.InputType;
  };

  export type CreatePOSTParams = {
    mealId: string;
    file: {
      key: string;
      size: number;
      inputType: Meal.InputType;
    };
  };

  export type CreatePOSTResult = {
    uploadSignature: string;
  };
}
