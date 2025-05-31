export {};

export type Roles = "admin" | "applicant";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
      convexUserId: string;
    };
  }
}
