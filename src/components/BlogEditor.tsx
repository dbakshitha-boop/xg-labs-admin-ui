import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, useFieldArray, Control, Controller } from 'react-hook-form@7.55.0';
import { BlogPost } from '../types';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Switch } from './ui/switch';
import {
  Image as ImageIcon, PanelRightOpen, PanelRightClose, Smartphone, Tablet, Monitor,
  Sparkles, Palette, FileText, Save, Bold, Italic, List, ListOrdered,
  Quote, Link as LinkIcon, Heading1, Heading2, AlertTriangle, Terminal, Minus,
  Maximize2, Minimize2, Timer,
  Trash2, Plus, ArrowUp, ArrowDown, ChevronDown, ChevronRight
} from 'lucide-react';
import { BlogView } from './BlogView';
import { cn } from '../lib/utils';

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

interface BlogEditorProps {
  initialData: BlogPost;
  onSave: (data: BlogPost) => void;
  onCancel: () => void;
}



export function BlogEditor({ initialData, onSave, onCancel }: BlogEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [isZenMode, setIsZenMode] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState<'100%' | '768px' | '375px'>('100%');
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const { control, register, handleSubmit, watch, setValue } = useForm<BlogPost>({
    defaultValues: initialData,
  });

  const formValues = watch();
  const [debouncedPreviewData, setDebouncedPreviewData] = useState<BlogPost>({ ...initialData, ...formValues });

  // Handle register ref merging for the textarea
  const { ref: contentRef, ...contentRest } = register('content');

  // Stats Calculation
  const stats = useMemo(() => {
    const text = formValues.content || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const time = Math.ceil(words / 200);
    const chars = text.length;
    return { words, time, chars };
  }, [formValues.content]);

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedPreviewData({ ...initialData, ...formValues });
    }, 300);

    return () => clearTimeout(handler);
  }, [formValues, initialData]);

  const onSubmit = (data: BlogPost, status: 'draft' | 'published' = 'draft') => {
    const finalData = { ...data, status };
    onSave(finalData);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
      if (!textareaRef.current) return;
      
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);
      
      const newValue = `${before}${prefix}${selection}${suffix}${after}`;
      
      setValue('content', newValue, { shouldValidate: true });
      
      // Restore focus and cursor
      setTimeout(() => {
          if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
          }
      }, 0);
  };

  const handleCoverImageUpload = (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
          if (typeof reader.result === 'string') {
              setValue('coverImage', reader.result, { shouldDirty: true, shouldTouch: true });
          }
      };

      reader.readAsDataURL(file);
  };

  const insertBlock = (type: string) => {
      if (!textareaRef.current) return;
      const text = textareaRef.current.value;
      const end = textareaRef.current.selectionEnd;
      
      let block = '';
      if (type === 'code') block = '\n```\n// Your code here\nconsole.log("Hello");\n```\n';
      if (type === 'divider') block = '\n\n---\n\n';
      if (type === 'info') block = '\n::: info\nThis is a helpful note for readers.\n:::\n';
      if (type === 'warning') block = '\n::: warning\nWarning: Proceed with caution.\n:::\n';
      if (type === 'image') block = '\n![Image Caption](https://source.unsplash.com/random/800x600)\n';

      const newValue = text.substring(0, end) + block + text.substring(end);
      setValue('content', newValue, { shouldValidate: true });
  };

  const memoizedPreview = useMemo(() => (
      <BlogView post={debouncedPreviewData} activeTab={activeTab} />
  ), [debouncedPreviewData, activeTab]);

  const editorForm = (
    <form onSubmit={handleSubmit((data) => onSubmit(data, 'draft'))} className="h-full flex flex-col bg-white overflow-hidden">
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 overflow-hidden">
        {/* Sticky Tabs List */}
        {!isZenMode && (
        <div className="shrink-0 border-b bg-white/95 backdrop-blur z-10 px-6 py-2 shadow-sm flex items-center justify-between transition-all">
           <TabsList className="h-9">
             <TabsTrigger value="write" className="px-4 text-xs">Write</TabsTrigger>
             <TabsTrigger value="settings" className="px-4 text-xs">Settings</TabsTrigger>
             <TabsTrigger value="info" className="px-4 text-xs">Info</TabsTrigger>
             <TabsTrigger value="process" className="px-4 text-xs">Process</TabsTrigger>
             <TabsTrigger value="custom" className="px-4 text-xs">Custom</TabsTrigger>
             <TabsTrigger value="impact" className="px-4 text-xs">Impact</TabsTrigger>
             <TabsTrigger value="design" className="px-4 text-xs">Design</TabsTrigger>
           </TabsList>
           
           <div className="flex items-center gap-4">
               {/* Stats Widget */}
               <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1" title="Reading Time">
                    <Timer className="w-3 h-3" /> {stats.time} min read
                  </span>
                  <div className="w-px h-3 bg-gray-200" />
                  <span title="Word Count">
                    {stats.words} words
                  </span>
               </div>


           </div>
        </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 min-h-0 basis-0 relative">
            
        {/* WRITE TAB */}
        <TabsContent value="write" className="min-h-full outline-none mt-0">
           <div className={cn(
               "mx-auto w-full bg-white shadow-sm my-6 border border-gray-100 rounded-lg flex flex-col relative transition-all duration-500 ease-in-out",
               isZenMode ? "max-w-4xl min-h-[calc(100vh-100px)] py-10" : "max-w-3xl min-h-[calc(100vh-150px)]"
           )}>
              
              {/* Cover Image Preview (if exists) */}
              {!isZenMode && formValues.coverImage && (
                  <div className="w-full h-48 rounded-t-lg overflow-hidden relative group bg-gray-100">
                      <img src={formValues.coverImage} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="xs" variant="secondary" onClick={() => setActiveTab('settings')}>Change Cover</Button>
                      </div>
                  </div>
              )}

              <div className={cn("flex-1 flex flex-col", isZenMode ? "p-12 md:p-20" : "p-8 md:p-12 pb-4")}>
                  {/* Title Input */}
                  <div className="mb-6">
                    <Input 
                        {...register('title')} 
                        className="text-4xl md:text-5xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-gray-300 h-auto py-2 leading-tight" 
                        placeholder="Post Title..." 
                    />
                  </div>

                  {/* Toolbar */}
                  <div className={cn(
                      "sticky z-20 bg-white/95 backdrop-blur py-2 mb-4 border-b border-gray-100 flex items-center gap-1 transition-all overflow-x-auto",
                      isZenMode ? "top-0" : "top-0"
                  )}>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('**', '**')} title="Bold">
                          <Bold className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('*', '*')} title="Italic">
                          <Italic className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('# ')} title="Heading 1">
                          <Heading1 className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('## ')} title="Heading 2">
                          <Heading2 className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('> ')} title="Quote">
                          <Quote className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('- ')} title="Bullet List">
                          <List className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('1. ')} title="Numbered List">
                          <ListOrdered className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('[', '](url)')} title="Link">
                          <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertMarkdown('![alt text](', ')')} title="Image">
                          <ImageIcon className="w-4 h-4" />
                      </Button>
                      
                      {/* Advanced Blocks */}
                      <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertBlock('code')} title="Code Block">
                          <Terminal className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertBlock('info')} title="Info Alert">
                          <AlertTriangle className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertBlock('warning')} title="Warning Alert">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => insertBlock('divider')} title="Divider">
                          <Minus className="w-4 h-4" />
                      </Button>

                      {/* Zen Toggle */}
                      <div className="flex-1" />
                      <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                      <Button 
                        type="button" 
                        variant={isZenMode ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-8 w-8 p-0 shrink-0" 
                        onClick={() => setIsZenMode(!isZenMode)} 
                        title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                      >
                          {isZenMode ? <Minimize2 className="w-4 h-4 text-blue-600" /> : <Maximize2 className="w-4 h-4" />}
                      </Button>
                  </div>

                  {/* Main Editor */}
                  <div className="flex-1 min-h-[400px]">
                      <Textarea 
                        {...contentRest} 
                        ref={(e) => {
                            contentRef(e);
                            textareaRef.current = e;
                        }}
                        className="w-full h-full min-h-[400px] border-none shadow-none resize-none focus-visible:ring-0 p-0 text-lg leading-relaxed text-gray-800 font-mono" 
                        placeholder="Tell your story..."
                      />
                  </div>
              </div>
           </div>
        </TabsContent>

        {/* SETTINGS TAB (Merged Hero & SEO) */}
        <TabsContent value="settings" className="max-w-4xl mx-auto w-full p-6 pb-20 mt-0">
          <div className="grid gap-6">
              <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure how your post appears in listings and URLs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label>URL Slug</Label>
                            <Input {...register('slug')} placeholder="my-awesome-post" className="font-mono text-sm" />
                        </div>
                        <div>
                            <Label>Publish Date</Label>
                            <Input type="date" {...register('publishedAt')} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            <Label>Author</Label>
                            <Input {...register('author')} />
                        </div>
                         <div>
                            <Label>Tags (comma separated)</Label>
                            <Input {...register('tags')} />
                        </div>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
                <CardContent>
                   <Label className="mb-2 block">Image URL</Label>
                   <div className="flex gap-2 items-center">
                        <Input {...register('coverImage')} placeholder="https://..." />
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleCoverImageUpload(event.target.files)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          aria-label="Upload cover image from computer"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>SEO & Social</CardTitle>
                    <CardDescription>Control how your post looks when shared on social media.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label className="mb-2 block">Excerpt / Meta Description</Label>
                  <Textarea {...register('excerpt')} placeholder="A brief summary of your post..." className="h-24 mb-4" />
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label className="mb-2 block">Author Twitter URL</Label>
                          <Input {...register('authorTwitter')} placeholder="https://twitter.com/username" />
                      </div>
                      <div>
                          <Label className="mb-2 block">Author LinkedIn URL</Label>
                          <Input {...register('authorLinkedin')} placeholder="https://linkedin.com/in/username" />
                      </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </TabsContent>

        {/* INFO & QUOTE SECTION */}
        <TabsContent value="info" className="max-w-4xl mx-auto w-full p-6 pb-20 mt-0 space-y-4">
          <Card>
            <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
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
        <TabsContent value="process" className="max-w-4xl mx-auto w-full p-6 pb-20 mt-0 space-y-4">
          <Card>
            <CardHeader><CardTitle>Process Steps</CardTitle></CardHeader>
            <CardContent>
              <StepsArray control={control} name="process" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOM SECTIONS */}
        <TabsContent value="custom" className="max-w-4xl mx-auto w-full p-6 pb-20 mt-0 space-y-4">
           <Card>
            <CardHeader><CardTitle>Custom Details Sections</CardTitle></CardHeader>
            <CardContent>
               <p className="text-sm text-gray-500 mb-4">Add your own sections with custom titles and key-value pairs.</p>
               <CustomSectionsArray control={control} name="customSections" />
            </CardContent>
           </Card>
        </TabsContent>

        {/* IMPACT & CASE STUDIES SECTION */}
        <TabsContent value="impact" className="max-w-4xl mx-auto w-full p-6 pb-20 mt-0 space-y-4">
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

        {/* DESIGN TAB */}
        <TabsContent value="design" className="max-w-4xl mx-auto w-full p-6 pb-20 mt-0 space-y-4">
           <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" /> Appearance Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <Label className="mb-3 block flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-500" /> Quick Presets</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                     <Button variant="outline" size="sm" type="button" className="text-xs justify-start" onClick={() => {
                        setValue('theme.mode', 'light');
                        setValue('theme.fontHeading', 'serif');
                        setValue('theme.fontBody', 'sans');
                        setValue('theme.accentColor', '#000000');
                        setValue('enableDropCap', true);
                     }}>
                        📰 Editorial
                     </Button>
                     <Button variant="outline" size="sm" type="button" className="text-xs justify-start" onClick={() => {
                        setValue('theme.mode', 'dark');
                        setValue('theme.fontHeading', 'mono');
                        setValue('theme.fontBody', 'mono');
                        setValue('theme.accentColor', '#00FF99');
                        setValue('enableDropCap', false);
                     }}>
                         Terminal
                     </Button>
                     <Button variant="outline" size="sm" type="button" className="text-xs justify-start" onClick={() => {
                        setValue('theme.mode', 'midnight');
                        setValue('theme.fontHeading', 'sans');
                        setValue('theme.fontBody', 'sans');
                        setValue('theme.accentColor', '#6366f1');
                        setValue('enableDropCap', false);
                     }}>
                        🌃 Midnight
                     </Button>
                  </div>
               </div>
               
               {/* New Toggles */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-white shadow-sm">
                   <div className="flex items-center justify-between gap-4">
                       <Label htmlFor="toc-toggle" className="cursor-pointer">Table of Contents</Label>
                       <Controller
                         control={control}
                         name="enableTableOfContents"
                         render={({ field }) => (
                           <Switch 
                             id="toc-toggle" 
                             checked={field.value} 
                             onCheckedChange={field.onChange} 
                           />
                         )}
                       />
                   </div>
                   <div className="flex items-center justify-between gap-4">
                       <Label htmlFor="dropcap-toggle" className="cursor-pointer">Drop Cap</Label>
                       <Controller
                         control={control}
                         name="enableDropCap"
                         render={({ field }) => (
                           <Switch 
                             id="dropcap-toggle" 
                             checked={field.value} 
                             onCheckedChange={field.onChange} 
                           />
                         )}
                       />
                   </div>
                   <div className="flex items-center justify-between gap-4">
                       <Label htmlFor="newsletter-toggle" className="cursor-pointer">Newsletter Block</Label>
                       <Controller
                         control={control}
                         name="enableNewsletter"
                         render={({ field }) => (
                           <Switch 
                             id="newsletter-toggle" 
                             checked={field.value} 
                             onCheckedChange={field.onChange} 
                           />
                         )}
                       />
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

        </div>
      </Tabs>
    </form>
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <div className="sticky top-0 z-50 h-[72px] border-b p-4 flex justify-between items-center bg-gray-50 shrink-0">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Blog Editor
            </h2>
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
                <ResizablePanel defaultSize={50} minSize={30} className="h-full bg-gray-100 shadow-inner">
                    <div className="h-full overflow-y-auto">
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
                     <div className="mx-auto bg-white shadow-xl min-h-screen border-x border-gray-200 transition-all duration-300 origin-top"
                          style={{ width: deviceWidth }}>
                         {memoizedPreview}
                     </div>
                    </div>
                </ResizablePanel>
             </ResizablePanelGroup>
        ) : (
            <div className="h-full max-w-7xl mx-auto w-full border-x border-gray-100 shadow-sm">
                {editorForm}
            </div>
        )}
      </div>
    </div>
  );
}

function StatsArray({ control, name }: { control: Control<BlogPost>; name: any }) {
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

function StepsArray({ control, name }: { control: Control<BlogPost>; name: any }) {
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

function CaseStudiesArray({ control, name }: { control: Control<BlogPost>; name: any }) {
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

function CustomSectionsArray({ control, name }: { control: Control<BlogPost>; name: any }) {
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

function CustomItemsArray({ control, name }: { control: Control<BlogPost>; name: any }) {
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