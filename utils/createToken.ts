import jwt from "jsonwebtoken";

export const createToken = (userid: number, email: string) => {
  const token = jwt.sign(
    { userId: userid, email: email },
    process.env.JWT_SECRET!,
    { expiresIn: "1w" }
  );

  return token;
};
