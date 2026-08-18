import z from "zod";
export const fileName = z.object({
  newFileName: z
    .string()
    .max(255, { message: "Name must be at most 255 characters" })
    .default("Untitled"),
});
