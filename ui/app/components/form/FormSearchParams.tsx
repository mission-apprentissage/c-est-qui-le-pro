"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FieldValues } from "react-hook-form";
import { paramsToString, searchParamsToObject } from "#/app/utils/searchParams";
import { RefObject, Suspense, useRef } from "react";

type FormSearchParamsProps<FormData extends FieldValues> = {
  url: string;
  defaultValues: FormData;
  dynamicValues?: Array<keyof FormData>; // Value updated outside the form
  schema: yup.ObjectSchema<FormData>;
  children: ({
    control,
    errors,
    formRef,
    register,
  }: {
    control: Control<FormData, any>;
    errors: FieldErrors<FormData>;
    formRef: RefObject<HTMLFormElement>;
    register: UseFormRegister<FormData>;
  }) => JSX.Element;
  onSubmit?: (data: FormData) => void;
};

export function FormSearchParams<FormData extends FieldValues>({
  url,
  defaultValues,
  dynamicValues,
  schema,
  children,
  onSubmit,
}: FormSearchParamsProps<FormData>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formRef = useRef<HTMLFormElement>(null);

  const parameters: any = searchParamsToObject(searchParams, defaultValues, schema);

  const {
    control,
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: parameters,
    resolver: yupResolver(schema),
  });

  const onSubmitBase = handleSubmit((data) => {
    const dataWithDynamic = Object.assign(
      data,
      (dynamicValues || []).reduce((acc, key) => {
        return { ...acc, [key]: parameters[key] };
      }, {})
    );

    onSubmit && onSubmit(dataWithDynamic);

    const urlParams = paramsToString(dataWithDynamic);
    router.push(`${url}?${urlParams}`);
  });

  return (
    <form
      autoComplete="off"
      onSubmit={onSubmitBase}
      ref={formRef}
      style={{ flex: "1", display: "flex", flexDirection: "column" }}
    >
      {children({ control, register, errors, formRef })}
    </form>
  );
}

export default function FormSearchParamsWithSuspense<FormData extends FieldValues>({
  url,
  defaultValues,
  schema,
  children,
}: FormSearchParamsProps<FormData>) {
  return (
    <Suspense>
      <FormSearchParams url={url} defaultValues={defaultValues} schema={schema}>
        {children}
      </FormSearchParams>
    </Suspense>
  );
}
