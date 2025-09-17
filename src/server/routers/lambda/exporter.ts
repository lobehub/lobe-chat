import { z } from 'zod';

import { DrizzleMigrationModel } from '@/database/models/drizzleMigration';
import { MessageModel } from '@/database/models/message';
import { SessionModel } from '@/database/models/session';
import { DataExporterRepos } from '@/database/repositories/dataExporter';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { ExportDatabaseData } from '@/types/export';
import { ChatMessage } from '@/types/message';

const exportProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  const dataExporterRepos = new DataExporterRepos(ctx.serverDB, ctx.userId);
  const drizzleMigration = new DrizzleMigrationModel(ctx.serverDB);
  const messageModel = new MessageModel(ctx.serverDB, ctx.userId);
  const sessionModel = new SessionModel(ctx.serverDB, ctx.userId);

  return opts.next({
    ctx: { dataExporterRepos, drizzleMigration, messageModel, sessionModel },
  });
});

const generatePdfFromMessages = async (messages: ChatMessage[], title: string, systemRole?: string) => {
  // Import PDF generation libs dynamically (server-side only)
  const { generateMarkdown } = await import('@/features/ShareModal/ShareText/template');
  const jsPDF = (await import('jspdf')).default;
  
  // Generate markdown content
  const content = generateMarkdown({
    messages,
    title,
    systemRole: systemRole || '',
    includeTool: true,
    includeUser: true,
    withRole: true,
    withSystemRole: !!systemRole,
  });

  // Create PDF from markdown content
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth() - 20; // 10px margin on each side
  const pageHeight = pdf.internal.pageSize.getHeight() - 20; // 10px margin top/bottom
  
  // Split content into lines that fit page width
  const lines = pdf.splitTextToSize(content, pageWidth);
  let yPosition = 15;
  
  lines.forEach((line: string) => {
    if (yPosition > pageHeight) {
      pdf.addPage();
      yPosition = 15;
    }
    pdf.text(line, 10, yPosition);
    yPosition += 7; // Line height
  });

  // Return PDF as buffer
  return Buffer.from(pdf.output('arraybuffer'));
};

export const exporterRouter = router({
  exportData: exportProcedure.mutation(async ({ ctx }): Promise<ExportDatabaseData> => {
    const data = await ctx.dataExporterRepos.export(5);

    const schemaHash = await ctx.drizzleMigration.getLatestMigrationHash();

    return { data, schemaHash };
  }),

  exportPdf: exportProcedure
    .input(
      z.object({
        sessionId: z.string(),
        topicId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { sessionId, topicId } = input;

      // Get session details
      const session = await ctx.sessionModel.findByID(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Get messages for the session/topic
      const messages = await ctx.messageModel.findBySessionId(sessionId, topicId);

      // Generate PDF
      const pdfBuffer = await generatePdfFromMessages(
        messages as ChatMessage[],
        session.title || 'Chat Export',
        session.config?.systemRole,
      );

      // Return PDF as base64 for transport
      return {
        pdf: pdfBuffer.toString('base64'),
        filename: `${session.title || 'Chat Export'}.pdf`,
      };
    }),
});
