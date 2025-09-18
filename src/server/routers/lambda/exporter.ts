import { marked } from 'marked';
import PDFDocument from 'pdfkit';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';


import { DrizzleMigrationModel } from '@/database/models/drizzleMigration';
import { MessageModel } from '@/database/models/message';
import { SessionModel } from '@/database/models/session';
import { DataExporterRepos } from '@/database/repositories/dataExporter';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { ExportDatabaseData } from '@/types/export';

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

/**
 * 使用 PDFKit 从 Markdown 内容生成 PDF。
 * 真正的服务器端方案：完全不依赖浏览器环境，体积小、速度快、稳定性高。
 * @param markdownContent - 需要转换的 Markdown 字符串。
 * @param title - 文档的标题。
 * @returns 包含生成的 PDF 的 Buffer。
 */
const generatePdfFromMarkdown = async (
  markdownContent: string,
  title: string,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
     const tokens = marked.lexer(markdownContent);

      const doc = new PDFDocument({
        bufferPages: true,
        margins: {
          bottom: 50,
          left: 50,
          right: 50,
          top: 50,
        },
        size: 'A4',
      });

      const chunks: Buffer[] = [];

      const fontPath = path.join(process.cwd(), 'public', 'fonts');
      const regularFont = fs.readFileSync(path.join(fontPath, 'SourceHanSansSC-Regular.otf'));

      doc.registerFont('Regular', regularFont);
      doc.font('Regular');

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown(2);

      let currentY = doc.y;

      for (const token of tokens) {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        switch (token.type) {
          case 'heading': {
            const headingSize = Math.max(16 - (token.depth - 1) * 2, 12);
            doc.fontSize(headingSize)
              .fillColor('#222')
              .text(token.text, { continued: false });
            doc.moveDown(0.5);
            break;
          }

          case 'paragraph': {
            doc.fontSize(12)
              .fillColor('#333')
              .text(token.text, { align: 'left', lineGap: 2 });
            doc.moveDown(1);
            break;
          }

          case 'list': {
            for (const item of token.items) {
              doc.fontSize(12)
                .fillColor('#333')
                .text(`• ${item.text}`, { indent: 20, lineGap: 2 });
            }
            doc.moveDown(1);
            break;
          }

          case 'blockquote': {
            doc.fontSize(12)
              .fillColor('#666')
              .text(token.text, { indent: 20, lineGap: 2 });
            doc.moveDown(1);
            break;
          }

          case 'code': {
            doc.fontSize(10)
              .fillColor('#333')
              .text(token.text, {
                continued: false,
                indent: 20,
                lineGap: 1
              });
            doc.moveDown(1);
            break;
          }

          case 'hr': {
            doc.moveTo(50, doc.y)
              .lineTo(545, doc.y)
              .stroke();
            doc.moveDown(1);
            break;
          }

          default: {
            if ('text' in token && token.text) {
              doc.fontSize(12)
                .fillColor('#333')
                .text(token.text, { align: 'left', lineGap: 2 });
              doc.moveDown(1);
            }
            break;
          }
        }

        currentY = doc.y;
      }

      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .fillColor('#666')
          .text(`Page ${i + 1} of ${pages.count}`, 50, 750, {
            align: 'center',
            width: 495
          });
      }

      // 完成文档
      doc.end();

    } catch (error) {
      reject(new Error(`PDFKit PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
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
        content: z.string(),
        sessionId: z.string(),
        title: z.string(),
        topicId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { content, title } = input;
      const pdfBuffer = await generatePdfFromMarkdown(content, title);
      console.log("pdfBuffer", pdfBuffer)
      return {
        filename: `${title}.pdf`,
        pdf: pdfBuffer.toString('base64'),
      };
    }),
});