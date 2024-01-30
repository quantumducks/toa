/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Schemas {
  configuration?: {
    trust?: TrustConfiguration[];
    /**
     * Force identities to be explicitly created or incept before being used in authentication
     */
    explicit_identity_creation?: boolean;
    /**
     * The value of `sub` of an identity token that will be assigned the `system` Role
     */
    principal?: {
      iss: string;
      sub: string;
    };
  };
  entity?: {
    /**
     * The issuer, or signer, of the token, URI like `https://accounts.google.com`
     */
    iss: string;
    /**
     * the ID that represents the principal making the request
     */
    sub: string;
  };
}
export interface TrustConfiguration {
  /**
   * Allowed origins for a token `iss` field
   */
  issuer: string;
  /**
   * Acceptable `aud` value(s)
   *
   * @minItems 1
   */
  audience?: [string, ...string[]];
}
