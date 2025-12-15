import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "dev_secret";

export function signJwt(payload: any) {
  return jwt.sign(payload, secret, { expiresIn: "12h" });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, secret) as any;
  } catch {
    return null;
  }
}
