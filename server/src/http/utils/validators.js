import Joi from "joi";
import { mapValues } from "lodash-es";
import { formatArrayParameters } from "./formatters.ts";
import { DiplomeType, FormationTag } from "shared";

const UAI_PATTERN = /^[0-9]{7}[A-Z]{1}$/;
export const CFD_PATTERN = /^(?:CFD:)?([0-9A-Z]{8})$/;
export const MEF11_PATTERN = /^(?:MEFSTAT11:)?([0-9]{11})$/;
export const SISE_PATTERN = /^SISE:([0-9]{7})$/;

const customJoi = Joi.extend(
  (joi) => ({
    type: "arrayOf",
    base: joi.array(),
    // eslint-disable-next-line no-unused-vars
    coerce(value) {
      return { value: formatArrayParameters(value) };
    },
  }),

  (joi) => ({
    type: "codeCertification",
    base: joi.string(),
    messages: {
      "code_certification.invalid": "{{#label}} must be a valid certification code.",
    },
    // eslint-disable-next-line no-unused-vars
    coerce(value, helpers) {
      const errors = ![CFD_PATTERN, MEF11_PATTERN, SISE_PATTERN].some((r) => r.test(value));
      return { value: value, errors: errors ? helpers.error("code_certification.invalid") : null };
    },
  }),

  (joi) => ({
    type: "codesCertification",
    base: joi.arrayOf().items(joi.codeCertification().required()).single().default([]),
    messages: {
      "codes_certification.invalid": "{{#label}} must have the type CFD, MEFSTAT11 or SISE",
    },
    validate(value, helpers) {
      const errors = value.some((v) => {
        return ![CFD_PATTERN, MEF11_PATTERN, SISE_PATTERN].some((r) => r.test(v));
      });

      return { value, errors: errors ? helpers.error("codes_certification.invalid") : null };
    },
  })
);

export function arrayOf(itemSchema = Joi.string()) {
  return customJoi.arrayOf().items(itemSchema).single();
}

export function uai() {
  return {
    uai: Joi.string().pattern(UAI_PATTERN).required(),
  };
}

export function uais() {
  return {
    uais: arrayOf(Joi.string().pattern(UAI_PATTERN).required()).default([]),
  };
}

export function cfds() {
  return {
    cfds: arrayOf(Joi.string().pattern(CFD_PATTERN).required()).default([]),
  };
}

export function domaines() {
  return {
    domaines: arrayOf(Joi.string().required()).default([]),
  };
}

export function voie() {
  return {
    voie: arrayOf(Joi.string().required()).default([]),
  };
}

export function diplome() {
  return {
    diplome: arrayOf(
      Joi.string()
        .valid(...Object.keys(DiplomeType))
        .required()
    ).default([]),
  };
}

export function tag() {
  return {
    tag: arrayOf(
      Joi.string()
        .valid(...Object.values(FormationTag))
        .required()
    ).default([]),
  };
}

export function pagination({ items_par_page, page } = {}) {
  return {
    items_par_page: Joi.number().default(items_par_page ?? 10),
    page: Joi.number().default(page ?? 1),
  };
}

export async function validate(obj, validators, formatters = {}) {
  const parameters = await Joi.object(validators).validateAsync(obj, { abortEarly: false });
  return mapValues(parameters, (parameter, key) => (formatters[key] ? formatters[key](parameter) : parameter));
}
