import crypto from "crypto";

const createSlug = (name) => {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${cleanName}-${crypto.randomBytes(3).toString("hex")}`;
};

export default createSlug;