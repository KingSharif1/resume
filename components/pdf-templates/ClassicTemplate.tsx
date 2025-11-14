import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TailoredResume } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 15,
  },
  summary: {
    marginBottom: 25,
    marginTop: 20,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: '#1f2937',
    textAlign: 'justify',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1f2937',
    marginLeft: 10,
  },
  bulletPoint: {
    marginBottom: 4,
    flexDirection: 'row',
  },
  bullet: {
    marginRight: 6,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
  },
});

interface ClassicTemplateProps {
  resume: TailoredResume;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ resume }) => {
  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const cleanLine = line.trim().replace(/^[•\-*]\s*/, '');
      return (
        <View key={index} style={styles.bulletPoint}>
          <Text style={styles.bullet}>◦</Text>
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
