import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";

import { mutation, query } from "../_generated/server";
import { requireUser } from "./users";

export const authedQuery = customQuery(query, {
  args: {
    sessionToken: v.string(),
  },
  input: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    return { ctx: { ...ctx, user }, args };
  },
});

export const authedMutation = customMutation(mutation, {
  args: {
    sessionToken: v.string(),
  },
  input: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    return { ctx: { ...ctx, user }, args };
  },
});
