import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TailoredResume } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 25,
  },
  summary: {
    marginBottom: 25,
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    textAlign: 'justify',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#4b5563',
  },
  bulletPoint: {
    marginLeft: 15,
    marginBottom: 5,
    flexDirection: 'row',
  },
  bullet: {
    marginRight: 8,
    color: '#3b82f6',
  },
  bulletText: {
    flex: 1,
  },
});

interface ModernTemplateProps {
  resume: TailoredResume;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ resume }) => {
  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const cleanLine = line.trim().replace(/^[•\-*]\s*/, '');
      return (
        <View key={index} style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{cleanLine}</Text>
        </View>
      );
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.summary}>
            <Text>{resume.summary}</Text>
          </View>
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
