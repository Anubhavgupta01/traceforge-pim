import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  exportBatch,
  exportUnihackDelivery,
  getLatestDashboard,
  getRecordDetail,
  processBatch,
  reviewField,
} from "./pimDb";
import { enrichRecord } from "./pimPipeline";

const rawRowSchema = z.object({
  Mfg_Part_Num: z.string().nullable().optional(),
  Part_Desc: z.string().nullable().optional(),
  E1_Brand: z.string().nullable().optional(),
  Unilog_Brand: z.string().nullable().optional(),
  DIB_Brand: z.string().nullable().optional(),
  Part_Manuf: z.string().nullable().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  pim: router({
    enrichPreview: publicProcedure
      .input(rawRowSchema)
      .mutation(({ input }) => enrichRecord(input, "preview", 1)),
    processBatch: publicProcedure
      .input(
        z.object({
          sourceName: z.string().min(1).max(255),
          rows: z.array(rawRowSchema).min(1).max(1000),
          batchId: z.string().min(1).max(64).optional(),
          sourceOffset: z.number().int().min(0).optional(),
          totalRows: z.number().int().min(1).max(1000).optional(),
          finalize: z.boolean().optional(),
        })
      )
      .mutation(({ input }) =>
        processBatch(input.sourceName, input.rows, input)
      ),
    dashboard: publicProcedure.query(() => getLatestDashboard()),
    record: publicProcedure
      .input(z.object({ recordId: z.string().min(1) }))
      .query(({ input }) => getRecordDetail(input.recordId)),
    exportBatch: publicProcedure
      .input(z.object({ batchId: z.string().min(1) }))
      .query(({ input }) => exportBatch(input.batchId)),
    exportUnihackDelivery: publicProcedure
      .input(z.object({ batchId: z.string().min(1) }))
      .query(({ input }) => exportUnihackDelivery(input.batchId)),
    reviewField: publicProcedure
      .input(
        z.object({
          recordId: z.string().min(1),
          fieldKey: z.string().min(1),
          action: z.enum(["approve", "edit", "flag"]),
          approvedValue: z.string().max(2000).optional(),
          note: z.string().max(2000).optional(),
          actor: z.string().max(255).optional(),
        })
      )
      .mutation(({ input }) => reviewField(input)),
  }),
});

export type AppRouter = typeof appRouter;
