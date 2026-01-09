'use client';

import { useState } from 'react';
import { Certification, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { UnifiedTextField, UnifiedDateField } from '@/components/fields';

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addCertification = () => {
    const newCertification: Certification = {
      id: generateId(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };

    const updated = [...certifications, newCertification];
    onChange(updated);

    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(newCertification.id);
      return newSet;
    });
  };

  const updateCertification = (id: string, updates: Partial<Certification>) => {
    const updated = certifications.map(cert =>
      cert.id === id ? { ...cert, ...updates } : cert
    );
    onChange(updated);
  };

  const removeCertification = (id: string) => {
    const updated = certifications.filter(cert => cert.id !== id);
    onChange(updated);
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Certifications</h3>
          <p className="text-sm text-slate-600">Add your professional certifications</p>
        </div>
        <Button onClick={addCertification} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No certifications added yet</p>
          <Button onClick={addCertification} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your Certification
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => {
            const isExpanded = expandedItems.has(cert.id);

            return (
              <Card key={cert.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {cert.name || 'New Certification'}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {cert.issuer}
                        {cert.date && ` • ${cert.date}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(cert.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCertification(cert.id, { visible: cert.visible === false ? true : false })}
                        className={cert.visible === false ? 'text-slate-400' : 'text-slate-600'}
                        title={cert.visible === false ? 'Hidden from preview - Click to show' : 'Visible in preview - Click to hide'}
                      >
                        {cert.visible === false ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(cert.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UnifiedTextField
                        id={`certifications-${cert.id}-name`}
                        section="certifications"
                        fieldKey="name"
                        itemId={cert.id}
                        label="Certification Name"
                        value={cert.name}
                        onChange={(value) => updateCertification(cert.id, { name: value })}
                        placeholder="AWS Certified Solutions Architect"
                        required
                      />
                      <UnifiedTextField
                        id={`certifications-${cert.id}-issuer`}
                        section="certifications"
                        fieldKey="issuer"
                        itemId={cert.id}
                        label="Issuing Organization"
                        value={cert.issuer}
                        onChange={(value) => updateCertification(cert.id, { issuer: value })}
                        placeholder="Amazon Web Services"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UnifiedDateField
                        id={`certifications-${cert.id}-date`}
                        section="certifications"
                        fieldKey="date"
                        itemId={cert.id}
                        label="Issue Date"
                        value={cert.date || ''}
                        onChange={(value) => updateCertification(cert.id, { date: value })}
                      />
                      <UnifiedDateField
                        id={`certifications-${cert.id}-expiryDate`}
                        section="certifications"
                        fieldKey="expiryDate"
                        itemId={cert.id}
                        label="Expiration Date"
                        value={cert.expiryDate || ''}
                        onChange={(value) => updateCertification(cert.id, { expiryDate: value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UnifiedTextField
                        id={`certifications-${cert.id}-credentialId`}
                        section="certifications"
                        fieldKey="credentialId"
                        itemId={cert.id}
                        label="Credential ID"
                        value={cert.credentialId || ''}
                        onChange={(value) => updateCertification(cert.id, { credentialId: value })}
                        placeholder="ABC-123-XYZ"
                      />
                      <UnifiedTextField
                        id={`certifications-${cert.id}-url`}
                        section="certifications"
                        fieldKey="url"
                        itemId={cert.id}
                        label="Credential URL"
                        value={cert.url || ''}
                        onChange={(value) => updateCertification(cert.id, { url: value })}
                        placeholder="https://..."
                        inputType="url"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
