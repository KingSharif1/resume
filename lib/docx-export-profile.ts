import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeProfile, SectionType } from '@/lib/resume-schema';

export async function exportToDocx(profile: ResumeProfile, filename: string = 'resume.docx') {
  const sections: Paragraph[] = [];

  // --- Header (Name & Contact) ---
  sections.push(
    new Paragraph({
      text: `${profile.contact.firstName} ${profile.contact.middleName ? profile.contact.middleName + ' ' : ''}${profile.contact.lastName}`,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }, // half line
    })
  );

  const contactParts = [
    profile.contact.email,
    profile.contact.phone,
    profile.contact.location,
    profile.contact.linkedin?.replace(/^https?:\/\//, ''),
    profile.contact.website?.replace(/^https?:\/\//, ''),
  ].filter(Boolean);

  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(' | '),
            size: 20, // 10pt
            color: '666666',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }, // space after header
      })
    );
  }

  // --- Helper to add Section Title ---
  const addSectionTitle = (title: string) => {
    sections.push(
      new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        border: {
          bottom: { color: "auto", space: 1, value: "single", size: 6 },
        },
        spacing: { before: 300, after: 150 },
      })
    );
  };

  // --- Summary ---
  if (profile.summary?.content) {
    addSectionTitle('Professional Summary');
    sections.push(
      new Paragraph({
        text: profile.summary.content,
        spacing: { after: 200 },
      })
    );
  }

  // --- Experience ---
  const visibleExperience = profile.experience.filter(e => e.visible !== false);
  if (visibleExperience.length > 0) {
    addSectionTitle('Experience');
    
    visibleExperience.forEach(exp => {
      // Title line: Position ----- Date
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 24 }), // 12pt
            new TextRun({ 
              text: `\t${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`,
              bold: true,
            }),
          ],
          tabStops: [{ type: "right", position: 9000 }], // Right align date
          spacing: { before: 100 },
        })
      );

      // Subtitle line: Company ----- Location
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.company, italics: true }),
            new TextRun({ text: `\t${exp.location || ''}`, italics: true }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
        })
      );

      // Description
      if (exp.description) {
        sections.push(
          new Paragraph({
            text: exp.description,
            spacing: { before: 100, after: 100 },
          })
        );
      }

      // Bullets using standard bullet formatting
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach(achievement => {
          sections.push(
            new Paragraph({
              text: achievement,
              bullet: { level: 0 },
            })
          );
        });
      }
    });
  }

  // --- Education ---
  const visibleEducation = profile.education.filter(e => e.visible !== false);
  if (visibleEducation.length > 0) {
    addSectionTitle('Education');

    visibleEducation.forEach(edu => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution, bold: true, size: 24 }),
            new TextRun({ 
              text: `\t${edu.startDate} – ${edu.current ? 'Present' : edu.endDate}`,
              bold: true,
            }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
          spacing: { before: 100 },
        })
      );

      sections.push(
        new Paragraph({
          children: [
            new TextRun({ 
              text: `${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}`,
              italics: true 
            }),
            new TextRun({ text: `\t${edu.location || ''}`, italics: true }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
        })
      );
    });
  }

  // --- Skills ---
  const skillEntries = Object.entries(profile.skills);
  if (skillEntries.length > 0) {
    addSectionTitle('Skills');
    
    skillEntries.forEach(([category, skills]) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${category}: `, bold: true }),
            new TextRun({ text: (skills as string[]).join(', ') }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  // --- Projects ---
  const visibleProjects = profile.projects.filter(p => p.visible !== false);
  if (visibleProjects.length > 0) {
    addSectionTitle('Projects');

    visibleProjects.forEach(proj => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 24 }),
            new TextRun({ 
              text: `\t${proj.startDate} – ${proj.current ? 'Present' : proj.endDate}`,
              bold: true,
            }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
          spacing: { before: 100 },
        })
      );

      if (proj.description) {
        sections.push(
          new Paragraph({
            text: proj.description,
            spacing: { after: 100 },
          })
        );
      }

      if (proj.achievements && proj.achievements.length > 0) {
        proj.achievements.forEach((achievement) => {
          sections.push(
            new Paragraph({
              text: achievement,
              bullet: { level: 0 },
            })
          );
        });
      }
    });
  }

  // --- Document Construction ---
  const doc = new Document({
    sections: [
      {
        properties: {
            page: {
                margin: {
                    top: 720, // 0.5 inch (1440 twips = 1 inch)
                    bottom: 720,
                    left: 720,
                    right: 720,
                },
            },
        },
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
