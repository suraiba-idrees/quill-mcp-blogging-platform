export interface AuthedVariables {
  userId: string;
  apiKeyId: string;
}

export type AuthedEnv = {
  Variables: AuthedVariables;
};