import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, useFieldArray, Control, Controller } from 'react-hook-form@7.55.0';
import { Portfolio, Stat, Image, Step, CaseStudy, CustomSection, CustomSectionItem, ContextItem } from '../types';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Trash2, Plus, Image as ImageIcon, PanelRightOpen, PanelRightClose, Smartphone, Tablet, Monitor, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Sparkles, Palette, Save, FileText, Star, Link } from 'lucide-react';
import { PortfolioView } from './PortfolioView';

interface PortfolioEditorProps {
  initialData: Portfolio;
  onSave: (data: Portfolio) => void;
  onCancel: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function PortfolioEditor({ initialData, onSave, onCancel }: PortfolioEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [deviceWidth, setDeviceWidth] = useState<'100%' | '768px' | '375px'>('100%');
  
  const { control, register, handleSubmit, watch, setValue } = useForm<Portfolio>({
    defaultValues: initialData,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formValues = watch();
  const [debouncedPreviewData, setDebouncedPreviewData] = useState<Portfolio>({ ...initialData, ...formValues });

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedPreviewData({ ...initialData, ...formValues });
    }, 300);

    return () => clearTimeout(handler);
  }, [formValues, initialData]);

  const onSubmit = (data: Portfolio, status: 'draft' | 'published' = 'draft') => {
    // Only update the status if it's explicitly passed or if we need to ensure it's set
    const finalData = { ...data, status };
    onSave(finalData);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Smooth scroll to section in Preview
    const sectionId = `section-${value}`;
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHeroImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValue('hero.image', reader.result, { shouldDirty: true, shouldTouch: true });
      }
    };

    reader.readAsDataURL(file);
  };

  const memoizedPreview = useMemo(() => (
      <PortfolioView portfolio={debouncedPreviewData} activeTab={activeTab} />
  ), [debouncedPreviewData, activeTab]);

  const editorForm = (
    <form onSubmit={handleSubmit((data) => onSubmit(data, 'draft'))} className="h-full flex flex-col bg-white overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 border-b bg-white z-20">
          <div className="max-w-4xl mx-auto w-full space-y-4 p-6 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label>Internal Title</Label>
                  <Input {...register('title')} />
              </div>
              <div>
                  <Label>Slug</Label>
                  <Input {...register('slug')} />
              </div>
            </div>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 overflow-hidden">
        {/* Sticky Tabs List */}
        <div className="shrink-0 border-b bg-white/95 backdrop-blur z-10 px-6 py-4 shadow-sm">
           <div className="max-w-4xl mx-auto w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex flex-nowrap gap-1 h-auto p-1">
                <TabsTrigger value="design" className="px-3 py-1.5 min-w-fit">Design</TabsTrigger>
                <TabsTrigger value="hero" className="px-3 py-1.5 min-w-fit">Hero</TabsTrigger>
                <TabsTrigger value="context" className="px-3 py-1.5 min-w-fit">Context</TabsTrigger>
                <TabsTrigger value="images" className="px-3 py-1.5 min-w-fit">Visuals</TabsTrigger>
                <TabsTrigger value="info" className="px-3 py-1.5 min-w-fit">Info</TabsTrigger>
                <TabsTrigger value="process" className="px-3 py-1.5 min-w-fit">Process</TabsTrigger>
                <TabsTrigger value="clients" className="px-3 py-1.5 min-w-fit">Clients</TabsTrigger>
                <TabsTrigger value="custom" className="px-3 py-1.5 min-w-fit">Custom</TabsTrigger>
                <TabsTrigger value="impact" className="px-3 py-1.5 min-w-fit">Impact</TabsTrigger>
                <TabsTrigger value="contact" className="px-3 py-1.5 min-w-fit">Contact</TabsTrigger>
              </TabsList>
           </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 min-h-0 basis-0">
            
        {/* DESIGN SECTION */}
        <TabsContent value="design" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
           <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" /> Global Design Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               
               {/* Theme Presets */}
               <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <Label className="mb-3 block flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-500" /> Quick Presets</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                     <Button variant="outline" size="sm" type="button" className="text-xs justify-start" onClick={() => {
                        setValue('theme.mode', 'light');
                        setValue('theme.fontHeading', 'sans');
                        setValue('theme.fontBody', 'sans');
                        setValue('theme.accentColor', '#FF3333');
                     }}>
                        🇨🇭 Swiss
                     </Button>
                     <Button variant="outline" size="sm" type="button" className="text-xs justify-start" onClick={() => {
                        setValue('theme.mode', 'light');
                        setValue('theme.fontHeading', 'serif');
                        setValue('theme.fontBody', 'serif');
                        setValue('theme.accentColor', '#000000');
                     }}>
                        📰 Editorial
                     </Button>
                     <Button variant="outline" size="sm" type="button" className="text-xs justify-start" onClick={() => {
                        setValue('theme.mode', 'dark');
                        setValue('theme.fontHeading', 'mono');
                        setValue('theme.fontBody', 'mono');
                        setValue('theme.accentColor', '#00FF99');
                     }}>
                        📟 Terminal
                     </Button>
                     <Button variant="outline" size="sm" type="button" className="text-xs justify-start" onClick={() => {
                        setValue('theme.mode', 'midnight');
                        setValue('theme.fontHeading', 'sans');
                        setValue('theme.fontBody', 'sans');
                        setValue('theme.accentColor', '#6366f1');
                     }}>
                        🌃 Midnight
                     </Button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <Label>Color Mode</Label>
                    <Controller
                      control={control}
                      name="theme.mode"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="midnight">Midnight</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                 </div>
                 <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" {...register('theme.accentColor')} className="w-12 h-10 p-1" />
                      <Input {...register('theme.accentColor')} placeholder="#FFFFFF" className="uppercase" />
                    </div>
                 </div>
               </div>
               
               <Separator />

               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <Label>Heading Font</Label>
                    <Controller
                      control={control}
                      name="theme.fontHeading"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans">Modern Sans (Inter)</SelectItem>
                            <SelectItem value="serif">Editorial Serif (Playfair)</SelectItem>
                            <SelectItem value="mono">Technical Mono (JetBrains)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                 </div>
                 <div>
                    <Label>Body Font</Label>
                     <Controller
                      control={control}
                      name="theme.fontBody"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans">Modern Sans (Inter)</SelectItem>
                            <SelectItem value="serif">Editorial Serif (Merriweather)</SelectItem>
                            <SelectItem value="mono">Technical Mono (JetBrains)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                 </div>
               </div>
            </CardContent>
           </Card>
        </TabsContent>

        {/* HERO SECTION */}
        <TabsContent value="hero" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subtitle (Small Top Text)</Label>
                <Input {...register('hero.subtitle')} />
              </div>
              <div>
                <Label>Main Title</Label>
                <Textarea {...register('hero.title')} />
              </div>
              <div>
                <Label>Tags</Label>
                <Input {...register('hero.tags')} />
              </div>
              <div>
                <Label>Hero Image URL</Label>
                <div className="flex gap-2 items-center">
                  <Input {...register('hero.image')} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleHeroImageUpload(event.target.files)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload hero image from computer"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Separator />
              <Label>Hero Stats</Label>
              <StatsArray control={control} name="hero.stats" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTEXT SECTION */}
        <TabsContent value="context" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Project Context</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ContextArray control={control} name="context" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMAGES SECTION */}
        <TabsContent value="images" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Showcase Images (Parallax)</CardTitle></CardHeader>
            <CardContent>
               <Label className="mb-2 block">Images List</Label>
               <ShowcaseImagesArray control={control} name="showcaseImages" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Brand Direction</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                  <Label>Description</Label>
                  <Textarea {...register('brandDirection.description')} />
              </div>
              <Label>Brand Images (Grid)</Label>
              <ImagesArray control={control} name="brandDirection.images" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* INFO & QUOTE SECTION */}
        <TabsContent value="info" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                  <Label>Role & Deliverables</Label>
                  <Input {...register('infoBar.role')} />
              </div>
              <div>
                  <Label>Timeline</Label>
                  <Input {...register('infoBar.timeline')} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Key Quote</CardTitle></CardHeader>
            <CardContent>
              <Label>Quote Text</Label>
              <Textarea className="h-24" {...register('quote.text')} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROCESS SECTION */}
        <TabsContent value="process" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Process Steps</CardTitle></CardHeader>
            <CardContent>
              <StepsArray control={control} name="process" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLIENTS SECTION */}
        <TabsContent value="clients" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Client Logos</CardTitle></CardHeader>
            <CardContent>
              <BrandsArray control={control} name="brands" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOM SECTIONS */}
        <TabsContent value="custom" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
           <Card>
            <CardHeader><CardTitle>Custom Details Sections</CardTitle></CardHeader>
            <CardContent>
               <p className="text-sm text-gray-500 mb-4">Add your own sections with custom titles and key-value pairs.</p>
               <CustomSectionsArray control={control} name="customSections" />
            </CardContent>
           </Card>
        </TabsContent>

        {/* IMPACT & CASE STUDIES SECTION */}
        <TabsContent value="impact" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Impact Stats</CardTitle></CardHeader>
            <CardContent>
              <StatsArray control={control} name="impact.stats" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Related Case Studies</CardTitle></CardHeader>
            <CardContent>
              <CaseStudiesArray control={control} name="caseStudies" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT SECTION */}
        <TabsContent value="contact" className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-4">
          <Card>
            <CardHeader><CardTitle>Footer Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                  <Label>Heading</Label>
                  <Input {...register('contact.heading')} />
              </div>
              <div>
                  <Label>Subheading</Label>
                  <Input {...register('contact.subheading')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label>Email</Label>
                      <Input {...register('contact.email')} />
                  </div>
                  <div>
                      <Label>Phone</Label>
                      <Input {...register('contact.phone')} />
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </div>

      </Tabs>
    </form>
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <div className="sticky top-0 z-50 h-[72px] border-b p-4 flex justify-between items-center bg-gray-50 shrink-0">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Portfolio Editor</h2>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPreview(!showPreview)}
                className="hidden md:flex gap-2"
            >
                {showPreview ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                {showPreview ? 'Close Preview' : 'Split Preview'}
            </Button>
        </div>
        <div className="space-x-2 flex items-center">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button 
            variant="outline" 
            onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
            className="gap-2"
          >
            <FileText className="w-4 h-4" /> Save Draft
          </Button>
          <Button 
            onClick={handleSubmit((data) => onSubmit(data, 'published'))}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4" /> Publish
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {showPreview ? (
             <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                <ResizablePanel defaultSize={50} minSize={30} className="relative z-0 border-r border-gray-200">
                    {editorForm}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={30} className="h-full overflow-y-auto bg-gray-100 shadow-inner">
                    <div className="sticky top-0 z-50 flex justify-center items-center gap-2 bg-white/80 backdrop-blur border-b border-gray-200">
                        <Button 
                            variant={deviceWidth === '375px' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setDeviceWidth('375px')}
                        >
                            <Smartphone className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant={deviceWidth === '768px' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setDeviceWidth('768px')}
                        >
                            <Tablet className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant={deviceWidth === '100%' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setDeviceWidth('100%')}
                        >
                            <Monitor className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="h-full w-full overflow-y-auto flex justify-center pt-[24px] pb-24">
                       <div 
                         style={{ width: deviceWidth }} 
                         className={`transition-all duration-300 ease-in-out bg-white shadow-2xl ${deviceWidth !== '100%' ? 'border border-gray-300 rounded-lg overflow-hidden my-4 min-h-[800px]' : 'min-h-full'}`}
                       >
                           {memoizedPreview}
                       </div>
                    </div>
                </ResizablePanel>
             </ResizablePanelGroup>
        ) : (
            <div className="h-full overflow-hidden bg-white">
                {editorForm}
            </div>
        )}
      </div>
    </div>
  );
}

// Sub-components for Arrays

const Separator = () => <div className="h-px bg-gray-200 my-4" />;

function StatsArray({ control, name }: { control: Control<Portfolio>; name: any }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-xs">Value</Label>
            <Controller
                control={control}
                name={`${name}.${index}.value`}
                render={({ field }) => <Input {...field} placeholder="e.g. 52%" />}
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">Label</Label>
             <Controller
                control={control}
                name={`${name}.${index}.label`}
                render={({ field }) => <Input {...field} placeholder="e.g. Increase in sales" />}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => remove(index)} type="button">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => append({ id: generateId(), value: '', label: '' })} type="button">
        <Plus className="w-4 h-4 mr-2" /> Add Stat
      </Button>
    </div>
  );
}

function ImagesArray({ control, name }: { control: Control<Portfolio>; name: any }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-xs">Image URL</Label>
            <Controller
                control={control}
                name={`${name}.${index}.url`}
                render={({ field }) => <Input {...field} />}
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">Alt Text</Label>
             <Controller
                control={control}
                name={`${name}.${index}.alt`}
                render={({ field }) => <Input {...field} />}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => remove(index)} type="button">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => append({ id: generateId(), url: '', alt: '' })} type="button">
        <Plus className="w-4 h-4 mr-2" /> Add Image
      </Button>
    </div>
  );
}

function StepsArray({ control, name }: { control: Control<Portfolio>; name: any }) {
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const isExpanded = expandedId === field.id;
        return (
            <div key={field.id} className="border rounded-lg relative bg-gray-50 overflow-hidden transition-all duration-200">
            {/* Header / Drag Bar */}
            <div className="flex items-center gap-2 p-3 bg-gray-100/50 border-b border-gray-100 cursor-pointer hover:bg-gray-100" onClick={() => setExpandedId(isExpanded ? null : field.id)}>
                <div className="p-1">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border text-gray-500">
                    Step {index + 1}
                </div>
                <div className="flex-1 font-medium text-sm truncate opacity-80">
                    {/* We can't easily access the current value without watch, but we can try to show something generic or use a watch inside if needed. 
                        For now, just showing "Process Step" if collapsed is fine, or we rely on the user expanding it. 
                        Actually, let's just show "Process Step {index+1}" in the header.
                    */}
                    Process Step
                </div>
                
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, index - 1)} type="button">
                        <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} type="button">
                        <ArrowDown className="w-3 h-3" />
                    </Button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => remove(index)} type="button">
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Body */}
            {isExpanded && (
                <div className="p-4 grid grid-cols-6 gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="col-span-1">
                        <Label className="text-xs">Step #</Label>
                        <Controller
                            control={control}
                            name={`${name}.${index}.step`}
                            render={({ field }) => <Input {...field} />}
                        />
                    </div>
                    <div className="col-span-5">
                        <Label className="text-xs">Title</Label>
                        <Controller
                            control={control}
                            name={`${name}.${index}.title`}
                            render={({ field }) => <Input {...field} />}
                        />
                    </div>
                    <div className="col-span-6">
                        <Label className="text-xs">Description</Label>
                        <Controller
                            control={control}
                            name={`${name}.${index}.description`}
                            render={({ field }) => <Textarea {...field} className="min-h-[100px]" />}
                        />
                    </div>
                </div>
            )}
            </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={() => {
          const id = generateId();
          append({ id, step: '01', title: '', description: '' });
          setExpandedId(id);
      }} type="button" className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Add Process Step
      </Button>
    </div>
  );
}

function ContextArray({ control, name }: { control: Control<Portfolio>; name: any }) {
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const isExpanded = expandedId === field.id;
        return (
          <div key={field.id} className="border rounded-lg relative bg-gray-50 overflow-hidden transition-all duration-200">
            <div className="flex items-center gap-2 p-3 bg-gray-100/50 border-b border-gray-100 cursor-pointer hover:bg-gray-100" onClick={() => setExpandedId(isExpanded ? null : field.id)}>
                <div className="p-1">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border text-gray-500">
                    Item {index + 1}
                </div>
                <div className="flex-1 font-medium text-sm truncate opacity-80">
                    Context Item
                </div>
                
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, index - 1)} type="button">
                        <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} type="button">
                        <ArrowDown className="w-3 h-3" />
                    </Button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => remove(index)} type="button">
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div>
                    <Label className="text-xs">Label (e.g. The Challenge)</Label>
                    <Controller
                        control={control}
                        name={`${name}.${index}.label`}
                        render={({ field }) => <Input {...field} className="font-bold" />}
                    />
                </div>
                <div>
                    <Label className="text-xs">Description</Label>
                    <Controller
                        control={control}
                        name={`${name}.${index}.description`}
                        render={({ field }) => <Textarea className="min-h-[100px]" {...field} />}
                    />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={() => {
          const id = generateId();
          append({ id, label: '', description: '' });
          setExpandedId(id);
      }} type="button" className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Add Context Item
      </Button>
    </div>
  );
}

function CaseStudiesArray({ control, name }: { control: Control<Portfolio>; name: any }) {
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const isExpanded = expandedId === field.id;
        return (
          <div key={field.id} className="border rounded-lg relative bg-gray-50 overflow-hidden transition-all duration-200">
            <div className="flex items-center gap-2 p-3 bg-gray-100/50 border-b border-gray-100 cursor-pointer hover:bg-gray-100" onClick={() => setExpandedId(isExpanded ? null : field.id)}>
                <div className="p-1">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border text-gray-500">
                    Study {index + 1}
                </div>
                <div className="flex-1 font-medium text-sm truncate opacity-80">
                    Case Study
                </div>
                
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, index - 1)} type="button">
                        <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} type="button">
                        <ArrowDown className="w-3 h-3" />
                    </Button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => remove(index)} type="button">
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                <div>
                    <Label className="text-xs">Title</Label>
                    <Controller
                        control={control}
                        name={`${name}.${index}.title`}
                        render={({ field }) => <Input {...field} />}
                    />
                </div>
                <div>
                    <Label className="text-xs">Image URL</Label>
                    <Controller
                        control={control}
                        name={`${name}.${index}.image`}
                        render={({ field }) => <Input {...field} />}
                    />
                </div>
                <div>
                    <Label className="text-xs">Link/Action Text</Label>
                    <Controller
                        control={control}
                        name={`${name}.${index}.description`}
                        render={({ field }) => <Input {...field} />}
                    />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={() => {
          const id = generateId();
          append({ id, title: '', image: '', description: 'See case study' });
          setExpandedId(id);
      }} type="button" className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Add Case Study
      </Button>
    </div>
  );
}

function CustomSectionsArray({ control, name }: { control: Control<Portfolio>; name: any }) {
    const { fields, append, remove } = useFieldArray({ control, name });
    return (
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-lg relative bg-gray-50 border-gray-200">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)} type="button">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
            
            <div className="mb-4 pr-10">
                 <Label>Section Title</Label>
                 <Controller
                  control={control}
                  name={`${name}.${index}.title`}
                  render={({ field }) => <Input {...field} placeholder="e.g. Technology Stack" className="font-bold" />}
                 />
            </div>
            
            <div className="pl-4 border-l-2 border-gray-300">
                <Label className="mb-2 block text-xs uppercase text-gray-500">Items (Key - Value)</Label>
                <CustomItemsArray control={control} name={`${name}.${index}.items`} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => append({ id: generateId(), title: '', items: [] })} type="button">
          <Plus className="w-4 h-4 mr-2" /> Add New Custom Section
        </Button>
      </div>
    );
}
  
function CustomItemsArray({ control, name }: { control: Control<Portfolio>; name: any }) {
    const { fields, append, remove } = useFieldArray({ control, name });
    return (
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center">
            <div className="w-1/3">
               <Controller
                  control={control}
                  name={`${name}.${index}.label`}
                  render={({ field }) => <Input {...field} placeholder="Label (e.g. Frontend)" className="h-8 text-sm" />}
               />
            </div>
            <div className="flex-1">
               <Controller
                  control={control}
                  name={`${name}.${index}.value`}
                  render={({ field }) => <Input {...field} placeholder="Value (e.g. React, TypeScript)" className="h-8 text-sm" />}
               />
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(index)} type="button" className="h-8 w-8">
              <Trash2 className="w-3 h-3 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => append({ id: generateId(), label: '', value: '' })} type="button" className="text-xs h-7">
          <Plus className="w-3 h-3 mr-1" /> Add Item
        </Button>
      </div>
    );
}

function BrandsArray({ control, name }: { control: Control<Portfolio>; name: any }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {fields.map((field, index) => (
        <div key={field.id} className="relative aspect-video rounded-xl bg-black border border-zinc-800 p-4 flex flex-col items-center justify-center group">
          {/* Featured Star - Top Left */}
          <div className="absolute top-2 left-2 z-10">
             <Controller
                control={control}
                name={`${name}.${index}.isFeatured`}
                render={({ field }) => (
                    <button 
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`p-1 rounded-full transition-colors ${field.value ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800/50 text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Star className={`w-3 h-3 ${field.value ? 'fill-current' : ''}`} />
                    </button>
                )}
            />
          </div>

          {/* Delete Button - Top Right */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6 text-zinc-600 hover:text-red-500 hover:bg-zinc-800" 
            onClick={() => remove(index)} 
            type="button"
          >
            <Trash2 className="w-3 h-3" />
          </Button>

          {/* Logo Area - Center */}
          <div className="flex-1 flex items-center justify-center w-full relative">
            <Controller
                control={control}
                name={`${name}.${index}.logo`}
                render={({ field }) => (
                    <div className="relative group/image">
                        {field.value ? (
                            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                                <img src={field.value} className="w-8 h-8 object-contain opacity-80" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-zinc-600" />
                            </div>
                        )}
                        
                        {/* URL Input on Hover/Focus */}
                        <div className="absolute inset-0 z-20 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/80 flex items-center justify-center rounded">
                             <Label htmlFor={`logo-upload-${field.name}`} className="cursor-pointer">
                                <Link className="w-4 h-4 text-white" />
                             </Label>
                             {/* Hidden prompt for URL input? Or we can make this a popover. 
                                 For simplicity, let's keep the URL input below or make this a text area overlay?
                                 Actually, let's just make the URL input part of the card structure but less obtrusive.
                             */}
                        </div>
                    </div>
                )}
            />
          </div>
          
          {/* Logo URL Input (Hidden unless needed or maybe small at bottom) - 
              Actually let's put the URL input in a popover or just a small input line 
              But matching the design image: it just shows Name below.
              Let's put the Name input at the bottom and maybe a small link icon for the URL.
           */}

           <div className="w-full space-y-2 mt-2">
             <Controller
                control={control}
                name={`${name}.${index}.name`}
                render={({ field }) => (
                    <Input 
                        {...field} 
                        className="h-6 text-[10px] text-center bg-transparent border-none text-zinc-400 placeholder:text-zinc-700 focus-visible:ring-0 focus-visible:text-zinc-200 p-0" 
                        placeholder="Brand Name" 
                    />
                )}
             />
             
             {/* Collapsed URL Input - revealed on hover of a small icon or similar? 
                 Or just always there but very subtle.
             */}
             <div className="relative group/url">
                <Controller
                    control={control}
                    name={`${name}.${index}.logo`}
                    render={({ field }) => (
                        <Input 
                            {...field} 
                            className="h-5 text-[9px] text-center bg-zinc-900/50 border-none text-zinc-600 focus-visible:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-700 p-0 px-1 w-full rounded" 
                            placeholder="Logo URL" 
                        />
                    )}
                />
             </div>
           </div>

        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => append({ id: generateId(), name: 'New Brand', logo: '', isFeatured: false })} type="button" className="aspect-video h-full flex flex-col items-center justify-center gap-2 border-dashed bg-gray-50/50 hover:bg-gray-100/50 text-gray-400 hover:text-gray-600">
        <Plus className="w-6 h-6" /> 
        <span className="text-xs">Add Brand</span>
      </Button>
      </div>
    </div>
  );
}

function ShowcaseImagesArray({ control, name }: { control: Control<Portfolio>; name: any }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-center">
          <div className="flex-1">
             <Controller
                control={control}
                name={`${name}.${index}`}
                render={({ field }) => <Input {...field} placeholder="Image URL" />}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => remove(index)} type="button">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => append('')} type="button">
        <Plus className="w-4 h-4 mr-2" /> Add Showcase Image
      </Button>
    </div>
  );
}