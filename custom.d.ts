declare namespace Express {
  export interface Request {
    email?: string;
    roles?: string[];
    isAdmin?: boolean;
    organizationId?: string;
  }
}
