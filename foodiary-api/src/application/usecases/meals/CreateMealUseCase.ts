import { Meal } from "@application/entities/Meal";
import { MealRepository } from "@infra/database/dynamo/repositories/MealRepository";
import { MealsFileStorageGateway } from "@infra/gateways/MealsFIleStorageGateway";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateMealUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsFileStorageGateway: MealsFileStorageGateway,
  ) {}

  async execute({
    accountId,
    file,
  }: CreateMealUseCase.Input): Promise<CreateMealUseCase.Output> {
    const inputFileKey = MealsFileStorageGateway.generateInputFileKey({
      accountId,
      inputType: file.inputType,
    });

    const meal = new Meal({
      accountId,
      inputFileKey: inputFileKey,
      inputType: file.inputType,
      status: Meal.Status.UPLOADING,
    });

    const [, { uploadSignature }] = await Promise.all([
      this.mealRepository.create(meal),
      this.mealsFileStorageGateway.createPost({
        file: {
          key: inputFileKey,
          size: file.size,
          inputType: file.inputType,
        },
        mealId: meal.id,
      }),
    ]);

    return {
      mealId: meal.id,
      uploadSignature,
    };
  }
}

export namespace CreateMealUseCase {
  export type Input = {
    accountId: string;
    file: {
      inputType: Meal.InputType;
      size: number;
    };
  };

  export type Output = {
    mealId: string;
    uploadSignature: string;
  };
}
