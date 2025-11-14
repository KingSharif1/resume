import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TailoredResume } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    padding: 55,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  summary: {
    marginBottom: 28,
    fontSize: 10,
    lineHeight: 1.6,
    color: '#525252',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#171717',
    letterSpacing: 0.3,
  },
  content: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#525252',
  },
  bulletPoint: {
    marginLeft: 5,
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#d4d4d4',
  },
});

interface MinimalTemplateProps {
  resume: TailoredResume;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ resume }) => {
  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const cleanLine = line.trim().replace(/^[•\-*]\s*/, '');
      return (
        <View key={index} style={styles.bulletPoint}>
          <Text>{cleanLine}</Text>
        </View>
      );
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.summary}>
          <Text>{resume.summary}</Text>
        </View>

        {resume.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.content}>
              {renderContent(section.content)}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};
