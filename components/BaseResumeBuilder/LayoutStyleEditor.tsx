'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, RotateCcw, Undo, Redo, GripVertical } from 'lucide-react';
import { useResumeSettings, FontFamily, DateFormat } from '@/lib/resume-settings-context';
import { ResumeProfile, SectionType, SECTION_CONFIGS } from '@/lib/resume-schema';
import { FullPageResumePreview } from '@/components/FullPageResumePreview';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LayoutStyleEditorProps {
    profile: ResumeProfile;
    onBack: () => void;
}

function SortableItem(props: { id: string; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg mb-2 cursor-move hover:border-blue-400 transition-colors touch-none">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{props.children}</span>
        </div>
    );
}

export function LayoutStyleEditor({ profile, onBack }: LayoutStyleEditorProps) {
    const { settings, updateFontSettings, updateLayoutSettings, resetSettings } = useResumeSettings();
    const [activeTab, setActiveTab] = useState('settings');
    const [zoom, setZoom] = useState(100);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = settings.layout.sectionOrder.indexOf(active.id as SectionType);
            const newIndex = settings.layout.sectionOrder.indexOf(over?.id as SectionType);

            const newOrder = arrayMove(settings.layout.sectionOrder, oldIndex, newIndex);
            updateLayoutSettings({ sectionOrder: newOrder });
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 h-14 flex-none z-30 shadow-sm px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={onBack} className="text-slate-700">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Editor
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                            <TabsTrigger value="text">Text</TabsTrigger>
                            <TabsTrigger value="layout">Layout</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center border-r border-slate-200 pr-2 mr-2 gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                            <Undo className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                            <Redo className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 mr-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(25, zoom - 10))}>
                            -
                        </Button>
                        <span className="w-12 text-center">{zoom}%</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(150, zoom + 10))}>
                            +
                        </Button>
                    </div>

                    <Button size="sm" className="bg-slate-900 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Controls */}
                <div className="w-[350px] bg-white border-r border-slate-200 overflow-y-auto flex-none z-20">
                    <div className="p-6 space-y-8">

                        {/* Text Tab Content */}
                        {activeTab === 'text' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                        <span className="text-xl">T</span> Formatting
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={resetSettings} className="text-xs text-slate-500 h-auto p-0 hover:bg-transparent hover:text-blue-600">
                                        Reset
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Primary Font (Headings)</Label>
                                        <Select
                                            value={settings.font.primary}
                                            onValueChange={(value) => updateFontSettings({ primary: value as FontFamily })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inter">Inter</SelectItem>
                                                <SelectItem value="Roboto">Roboto</SelectItem>
                                                <SelectItem value="Arial">Arial</SelectItem>
                                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                                <SelectItem value="Georgia">Georgia</SelectItem>
                                                <SelectItem value="Courier New">Courier New</SelectItem>
                                                <SelectItem value="Verdana">Verdana</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Secondary Font (Body)</Label>
                                        <Select
                                            value={settings.font.secondary}
                                            onValueChange={(value) => updateFontSettings({ secondary: value as FontFamily })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inter">Inter</SelectItem>
                                                <SelectItem value="Roboto">Roboto</SelectItem>
                                                <SelectItem value="Arial">Arial</SelectItem>
                                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                                <SelectItem value="Georgia">Georgia</SelectItem>
                                                <SelectItem value="Courier New">Courier New</SelectItem>
                                                <SelectItem value="Verdana">Verdana</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Heading Size</Label>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{settings.font.headingSize}%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ headingSize: Math.max(50, settings.font.headingSize - 10) })}>-</Button>
                                            <Slider
                                                value={[settings.font.headingSize]}
                                                min={50}
                                                max={200}
                                                step={5}
                                                onValueChange={([val]) => updateFontSettings({ headingSize: val })}
                                                className="flex-1"
                                            />
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ headingSize: Math.min(200, settings.font.headingSize + 10) })}>+</Button>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 px-1">
                                            <span>50% - 200%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Body Size</Label>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{settings.font.bodySize}%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ bodySize: Math.max(50, settings.font.bodySize - 10) })}>-</Button>
                                            <Slider
                                                value={[settings.font.bodySize]}
                                                min={50}
                                                max={200}
                                                step={5}
                                                onValueChange={([val]) => updateFontSettings({ bodySize: val })}
                                                className="flex-1"
                                            />
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ bodySize: Math.min(200, settings.font.bodySize + 10) })}>+</Button>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 px-1">
                                            <span>50% - 200%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Line Spacing</Label>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{settings.font.lineSpacing}%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ lineSpacing: Math.max(80, settings.font.lineSpacing - 10) })}>-</Button>
                                            <Slider
                                                value={[settings.font.lineSpacing]}
                                                min={80}
                                                max={200}
                                                step={5}
                                                onValueChange={([val]) => updateFontSettings({ lineSpacing: val })}
                                                className="flex-1"
                                            />
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ lineSpacing: Math.min(200, settings.font.lineSpacing + 10) })}>+</Button>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 px-1">
                                            <span>80% - 200%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Layout Tab Content */}
                        {activeTab === 'layout' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                        Format
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={resetSettings} className="text-xs text-slate-500 h-auto p-0 hover:bg-transparent hover:text-blue-600">
                                        Reset
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Format</Label>
                                        <Select
                                            value={settings.layout.format}
                                            onValueChange={(value) => updateLayoutSettings({ format: value as 'A4' | 'Letter' })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A4">A4 (8.27" x 11.69")</SelectItem>
                                                <SelectItem value="Letter">Letter (8.5" x 11")</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Margins & Paddings</Label>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs">Top & Bottom</Label>
                                                <span className="text-xs text-slate-500">{settings.layout.margins.top} in</span>
                                            </div>
                                            <Slider
                                                value={[settings.layout.margins.top]}
                                                min={0}
                                                max={2}
                                                step={0.1}
                                                onValueChange={([val]) => updateLayoutSettings({ margins: { ...settings.layout.margins, top: val, bottom: val } })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs">Left & Right</Label>
                                                <span className="text-xs text-slate-500">{settings.layout.margins.left} in</span>
                                            </div>
                                            <Slider
                                                value={[settings.layout.margins.left]}
                                                min={0}
                                                max={2}
                                                step={0.1}
                                                onValueChange={([val]) => updateLayoutSettings({ margins: { ...settings.layout.margins, left: val, right: val } })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs">Between Sections</Label>
                                                <span className="text-xs text-slate-500">{settings.layout.padding.section} pt</span>
                                            </div>
                                            <Slider
                                                value={[settings.layout.padding.section]}
                                                min={0}
                                                max={50}
                                                step={1}
                                                onValueChange={([val]) => updateLayoutSettings({ padding: { ...settings.layout.padding, section: val } })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Date Format</Label>
                                        <Select
                                            value={settings.layout.dateFormat}
                                            onValueChange={(value) => updateLayoutSettings({ dateFormat: value as DateFormat })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MMM YYYY">Short Name (Jan 2025)</SelectItem>
                                                <SelectItem value="Month YYYY">Full Name (January 2025)</SelectItem>
                                                <SelectItem value="MM/YYYY">Numeric (01/2025)</SelectItem>
                                                <SelectItem value="YYYY">Year Only (2025)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Header Alignment</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                variant={settings.layout.headerAlignment === 'left' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateLayoutSettings({ headerAlignment: 'left' })}
                                            >
                                                Left
                                            </Button>
                                            <Button
                                                variant={settings.layout.headerAlignment === 'center' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateLayoutSettings({ headerAlignment: 'center' })}
                                            >
                                                Center
                                            </Button>
                                            <Button
                                                variant={settings.layout.headerAlignment === 'right' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateLayoutSettings({ headerAlignment: 'right' })}
                                            >
                                                Right
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab Content */}
                        {activeTab === 'settings' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                        Settings
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={resetSettings} className="text-xs text-slate-500 h-auto p-0 hover:bg-transparent hover:text-blue-600">
                                        Reset
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* Skills Layout */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                            <span className="text-blue-500">🛠️</span> Skills Layout
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant={settings.layout.skillsLayout === 'comma' ? 'default' : 'outline'}
                                                className={settings.layout.skillsLayout === 'comma' ? 'bg-blue-600 text-white' : ''}
                                                onClick={() => updateLayoutSettings({ skillsLayout: 'comma' })}
                                            >
                                                Comma
                                            </Button>
                                            <Button
                                                variant={settings.layout.skillsLayout === 'columns' ? 'default' : 'outline'}
                                                className={settings.layout.skillsLayout === 'columns' ? 'bg-blue-600 text-white' : ''}
                                                onClick={() => updateLayoutSettings({ skillsLayout: 'columns' })}
                                            >
                                                Columns
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Sort Skills */}
                                    <div className="space-y-3">
                                        <Label>Sort Skills</Label>
                                        <Select
                                            value={settings.layout.skillsSort}
                                            onValueChange={(value) => updateLayoutSettings({ skillsSort: value as 'none' | 'asc' | 'desc' })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (Original Order)</SelectItem>
                                                <SelectItem value="asc">Ascending (A-Z)</SelectItem>
                                                <SelectItem value="desc">Descending (Z-A)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Reorder Sections */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                            <span className="text-blue-500">↕️</span> Reorder Sections
                                        </Label>
                                        <p className="text-xs text-slate-500">Personal Information stays at top. Drag to reorder.</p>

                                        {/* Fixed Contact Section Visual */}
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg opacity-60 cursor-not-allowed mb-2">
                                            <div className="w-4 h-4" />
                                            <span className="text-sm font-medium text-slate-500">Personal Information (Fixed)</span>
                                        </div>

                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={settings.layout.sectionOrder}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {settings.layout.sectionOrder
                                                    .filter(key => key !== 'contact') // Contact is fixed
                                                    .map((key) => {
                                                        const section = SECTION_CONFIGS.find(s => s.key === key);
                                                        return (
                                                            <SortableItem key={key} id={key}>
                                                                {section?.label || key}
                                                            </SortableItem>
                                                        );
                                                    })}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Right Preview Area */}
                <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden">
                    {/* Preview Toolbar */}
                    <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-center gap-6 z-10 shadow-sm">
                        {/* Font Select */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium">Font</span>
                            <Select
                                value={settings.font.primary}
                                onValueChange={(value) => updateFontSettings({ primary: value as FontFamily })}
                            >
                                <SelectTrigger className="w-[180px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Inter">Inter</SelectItem>
                                    <SelectItem value="Roboto">Roboto</SelectItem>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                    <SelectItem value="Courier New">Courier New</SelectItem>
                                    <SelectItem value="Verdana">Verdana</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="h-4 w-px bg-slate-300" />

                        {/* Font Size */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium">Size</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ bodySize: Math.max(50, settings.font.bodySize - 10) })}>-</Button>
                            <span className="text-sm font-medium w-12 text-center">{settings.font.bodySize}%</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ bodySize: Math.min(200, settings.font.bodySize + 10) })}>+</Button>
                        </div>

                        <div className="h-4 w-px bg-slate-300" />

                        {/* Line Spacing */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium">Spacing</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ lineSpacing: Math.max(80, settings.font.lineSpacing - 10) })}>-</Button>
                            <span className="text-sm font-medium w-12 text-center">{settings.font.lineSpacing}%</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateFontSettings({ lineSpacing: Math.min(200, settings.font.lineSpacing + 10) })}>+</Button>
                        </div>
                    </div>

                    {/* Scrollable Preview */}
                    <div className="flex-1 overflow-y-auto flex items-start justify-center p-8">
                        <div
                            className="origin-top shadow-2xl transition-transform duration-200"
                            style={{ transform: `scale(${zoom / 100})` }}
                        >
                            <FullPageResumePreview profile={profile} isSplitView={false} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
