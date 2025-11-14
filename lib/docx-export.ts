import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { TailoredResume } from '@/types/resume';

export async function exportToDocx(resume: TailoredResume, filename: string = 'resume.docx') {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: resume.summary,
      spacing: { after: 300 },
    })
  );

  resume.sections.forEach((section) => {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    const contentLines = section.content.split('\n').filter(line => line.trim());
    contentLines.forEach((line) => {
      children.push(
        new Paragraph({
          text: line.trim(),
          spacing: { after: 100 },
        })
      );
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
