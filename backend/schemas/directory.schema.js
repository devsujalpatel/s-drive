import z from "zod";
export const directorySchema = z.object({
  dirname: z
    .string()
    .max(100, { message: "Name must be at most 100 characters" })
    .default("New Folder"),
});
export const directorySchemaRename = z.object({
  newDirName: z
    .string()
    .max(100, { message: "Name must be at most 100 characters" })
    .default("New Folder"),
});