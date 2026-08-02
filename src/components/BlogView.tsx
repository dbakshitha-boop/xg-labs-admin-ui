import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants } from 'motion/react';
import { BlogPost, FontFamily, ThemeMode } from '../types';
import { cn } from '../lib/utils';
import { 
  ArrowLeft, Calendar, User, Tag, Info, AlertTriangle, CheckCircle, Terminal, 
  Share2, Mail, Twitter, Linkedin, Link as LinkIcon, Facebook, Bookmark
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface BlogViewProps {
  post: BlogPost;
  activeTab?: string;
  onBack?: () => void;
}

const getFontClass = (font: FontFamily) => {
    switch(font) {
        case 'serif': return 'font-serif';
        case 'mono': return 'font-mono tracking-tight';
        default: return 'font-sans';
    }
}

const getThemeClasses = (mode: ThemeMode) => {
    switch(mode) {
        case 'light': return {
            bg: 'bg-white',
            text: 'text-zinc-900',
            muted: 'text-zinc-500',
            border: 'border-zinc-200',
            card: 'bg-zinc-100',
            invert: false,
            code: 'bg-zinc-100 text-zinc-800'
        };
        case 'midnight': return {
            bg: 'bg-slate-900',
            text: 'text-slate-50',
            muted: 'text-slate-400',
            border: 'border-slate-800',
            card: 'bg-slate-800/50',
            invert: true,
            code: 'bg-slate-800 text-slate-200'
        };
        default: return { // Dark
            bg: 'bg-black',
            text: 'text-white',
            muted: 'text-zinc-400',
            border: 'border-zinc-800',
            card: 'bg-zinc-900',
            invert: true,
            code: 'bg-zinc-900 text-zinc-300'
        };
    }
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Simple Markdown Parser with "Rich Blocks" support
const parseLine = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code
    text = text.replace(/`(.*?)`/g, '<code class="font-mono text-sm px-1 py-0.5 rounded bg-current/10">$1</code>');
    // Links
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="underline decoration-2 underline-offset-4 decoration-current/30 hover:decoration-current transition-colors">$1</a>');
    return text;
};

export function BlogView({ post, activeTab = 'content', onBack }: BlogViewProps) {
  const mode = post.theme?.mode || 'light';
  const headingFont = post.theme?.fontHeading || 'serif';
  const bodyFont = post.theme?.fontBody || 'sans';
  const accentColor = post.theme?.accentColor || '#000000';

  const theme = getThemeClasses(mode);
  const fontHeading = getFontClass(headingFont);
  const fontBody = getFontClass(bodyFont);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  const [activeId, setActiveId] = React.useState<string>("");

  // Generate Table of Contents
  const tableOfContents = post.content.split('\n')
    .filter(line => line.startsWith('# ') || line.startsWith('## '))
    .map((line, index) => {
        const level = line.startsWith('# ') ? 1 : 2;
        const text = line.replace(/^#+\s/, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
        const id = `heading-${index}`;
        return { id, text, level };
    });

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -35% 0px" }
    );

    tableOfContents.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tableOfContents]);

  const handleShare = (platform: string) => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(post.title);
      
      let shareUrl = '';
      if (platform === 'Twitter') shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      if (platform === 'LinkedIn') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      if (platform === 'Facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      
      if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400');
      } else {
        toast.success(`Shared on ${platform}`);
      }
  };

  const copyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
  };

  // Content Parsing
  const renderContent = () => {
      const lines = post.content.split('\n');
      const elements: React.ReactNode[] = [];
      let inCodeBlock = false;
      let codeBlockContent: string[] = [];
      let headerCount = 0;
      let paragraphCount = 0;

      for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();

          // Code Blocks
          if (line.startsWith('```')) {
              if (inCodeBlock) {
                  // End block
                  elements.push(
                      <div key={`code-${i}`} className={cn("p-4 rounded-lg my-8 font-mono text-sm overflow-x-auto border relative group", theme.code, theme.border)}>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                                 navigator.clipboard.writeText(codeBlockContent.join('\n'));
                                 toast.success("Code copied");
                             }}>
                                <span className="sr-only">Copy</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                             </Button>
                          </div>
                          <pre>{codeBlockContent.join('\n')}</pre>
                      </div>
                  );
                  inCodeBlock = false;
                  codeBlockContent = [];
              } else {
                  inCodeBlock = true;
              }
              continue;
          }
          if (inCodeBlock) {
              codeBlockContent.push(lines[i]); // Keep original whitespace
              continue;
          }

          if (!line) {
             elements.push(<div key={i} className="h-6" />);
             continue;
          }

          // Headers
          if (line.startsWith('# ')) {
              const id = `heading-${headerCount++}`;
              elements.push(<h1 id={id} key={i} className={cn("text-3xl md:text-4xl font-bold mt-16 mb-6 leading-tight scroll-mt-24", fontHeading)} dangerouslySetInnerHTML={{ __html: parseLine(line.substring(2)) }} />);
              continue;
          }
          if (line.startsWith('## ')) {
              const id = `heading-${headerCount++}`;
              elements.push(<h2 id={id} key={i} className={cn("text-2xl md:text-3xl font-bold mt-12 mb-4 leading-tight scroll-mt-24", fontHeading)} dangerouslySetInnerHTML={{ __html: parseLine(line.substring(3)) }} />);
              continue;
          }
          if (line.startsWith('### ')) {
              elements.push(<h3 key={i} className={cn("text-xl font-bold mt-8 mb-3 scroll-mt-24", fontHeading)} dangerouslySetInnerHTML={{ __html: parseLine(line.substring(4)) }} />);
              continue;
          }

          // Blockquotes
          if (line.startsWith('> ')) {
              elements.push(
                  <blockquote key={i} className={cn("border-l-4 pl-6 italic my-10 text-2xl font-serif opacity-80", theme.border)} style={{ borderColor: accentColor }}>
                      "{parseLine(line.substring(2))}"
                  </blockquote>
              );
              continue;
          }

          // Images: ![alt](url)
          const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
          if (imgMatch) {
              elements.push(
                  <figure key={i} className="my-12 group">
                      <div className="rounded-lg overflow-hidden shadow-sm">
                          <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full transition-transform duration-700 group-hover:scale-[1.02]" />
                      </div>
                      {imgMatch[1] && <figcaption className={cn("text-center text-xs mt-3 uppercase tracking-widest opacity-60", fontBody)}>{imgMatch[1]}</figcaption>}
                  </figure>
              );
              continue;
          }

          // Lists
          if (line.startsWith('- ')) {
              elements.push(
                  <li key={i} className="ml-4 pl-2 border-l-2 mb-2 leading-relaxed" style={{ borderColor: accentColor }} dangerouslySetInnerHTML={{ __html: parseLine(line.substring(2)) }} />
              );
              continue;
          }

          // Divider
          if (line === '---' || line === '***') {
              elements.push(<hr key={i} className={cn("my-16 border-t-2 border-dashed opacity-20", theme.border)} />);
              continue;
          }

          // Custom Blocks (::: type)
          if (line.startsWith(':::')) {
              const type = line.substring(3).trim();
              const content = lines[i+1] || "Content here"; // Simple lookahead for demo
              i++; // Skip next line
              
              let icon = <Info className="w-5 h-5" />;
              let color = accentColor;
              
              if (type === 'warning') { icon = <AlertTriangle className="w-5 h-5" />; color = '#f59e0b'; }
              if (type === 'success') { icon = <CheckCircle className="w-5 h-5" />; color = '#10b981'; }
              if (type === 'terminal') { icon = <Terminal className="w-5 h-5" />; }

              elements.push(
                  <div key={i} className={cn("p-6 my-10 rounded-lg border flex gap-4 items-start relative overflow-hidden", theme.border)} style={{ backgroundColor: `${color}08`, borderColor: `${color}30` }}>
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
                      <div className="mt-0.5" style={{ color }}>{icon}</div>
                      <div className="flex-1 text-base leading-relaxed opacity-90 font-medium">{content}</div>
                  </div>
              );
              continue;
          }

          // Paragraph
          const isFirstParagraph = paragraphCount === 0;
          elements.push(
            <p 
                key={i} 
                className={cn(
                    "mb-6 text-lg md:text-xl leading-relaxed opacity-90", 
                    theme.text,
                    post.enableDropCap && isFirstParagraph ? "first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:font-serif" : ""
                )} 
                dangerouslySetInnerHTML={{ __html: parseLine(line) }} 
            />
          );
          paragraphCount++;
      }

      return elements;
  };
  
  return (
    <div className={cn(
        "min-h-screen transition-colors duration-300 overflow-x-hidden relative selection:bg-indigo-500/30",
        theme.bg, 
        theme.text,
        fontBody
    )}>
      <style>{`
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-gray-200/20">
        <motion.div 
            className="h-full origin-left" 
            style={{ width: progressBarWidth, backgroundColor: accentColor }} 
        />
      </div>

      {onBack && (
          <div className="fixed top-6 left-6 z-50">
              <button onClick={onBack} className={cn("p-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all shadow-sm group", theme.border, "border")}>
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              </button>
          </div>
      )}

      {/* Hero Section */}
      <section id="section-hero" className="relative w-full h-[70vh] min-h-[500px] overflow-hidden flex items-end">
        <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
        >
            <img src={post.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className={cn("absolute inset-0 bg-gradient-to-t", mode === 'light' ? "from-white via-white/40 to-transparent" : "from-black via-black/40 to-transparent")} />
        </motion.div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-16 md:pb-24">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                <div className="flex items-center gap-4 text-xs font-bold mb-6 uppercase tracking-widest opacity-80">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <Calendar className="w-3.5 h-3.5" /> {post.publishedAt}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <User className="w-3.5 h-3.5" /> {post.author}
                    </span>
                </div>
                <h1 className={cn("text-4xl md:text-7xl font-bold leading-tight mb-8 drop-shadow-sm", fontHeading)}>
                    {post.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                    {post.tags.split(',').map(tag => (
                        <span key={tag} className={cn("text-xs font-bold px-3 py-1.5 border rounded-full uppercase tracking-wider bg-white/5 backdrop-blur-sm", theme.border)}>
                            {tag.trim()}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
          
          {/* Sidebar - Table of Contents & Social */}
          <aside className="hidden lg:block lg:col-span-3 relative">
              <div className="sticky top-32 space-y-10">
                  {post.enableTableOfContents && tableOfContents.length > 0 && (
                      <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest opacity-50">Contents</h4>
                          <nav className="flex flex-col space-y-2 max-h-[60vh] overflow-y-auto pr-4">
                              {tableOfContents.map((item) => (
                                  <a 
                                    key={item.id} 
                                    href={`#${item.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                        setActiveId(item.id);
                                    }}
                                    className={cn(
                                        "text-sm transition-all duration-200 block truncate border-l-2 pl-3 py-1",
                                        activeId === item.id 
                                            ? "opacity-100 border-current font-medium translate-x-1" 
                                            : "opacity-60 hover:opacity-100 border-transparent hover:border-gray-300"
                                    )}
                                    style={{ marginLeft: item.level === 2 ? '0.75rem' : '0' }}
                                  >
                                      {item.text}
                                  </a>
                              ))}
                          </nav>
                      </div>
                  )}

                  <div className="space-y-4">
                       <h4 className="text-xs font-bold uppercase tracking-widest opacity-50">Share</h4>
                       <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleShare('Twitter')}>
                                <Twitter className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleShare('LinkedIn')}>
                                <Linkedin className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleShare('Facebook')}>
                                <Facebook className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={copyLink}>
                                <LinkIcon className="w-4 h-4" />
                            </Button>
                       </div>
                  </div>
              </div>
          </aside>

          {/* Main Content */}
          <main id="section-content" className="lg:col-span-7 min-h-[50vh]">
             {renderContent()}

             {/* Post-Content Actions (Mobile Only) */}
             <div className="lg:hidden flex gap-4 my-8 border-t border-b py-6 justify-center opacity-80">
                 <Button variant="ghost" size="sm" onClick={() => handleShare('Twitter')}><Twitter className="w-4 h-4 mr-2"/> Tweet</Button>
                 <Button variant="ghost" size="sm" onClick={() => handleShare('LinkedIn')}><Linkedin className="w-4 h-4 mr-2"/> Share</Button>
                 <Button variant="ghost" size="sm" onClick={copyLink}><LinkIcon className="w-4 h-4 mr-2"/> Copy Link</Button>
             </div>
             
             {/* Newsletter Block */}
             {post.enableNewsletter && (
                <div className={cn("mt-16 p-8 md:p-12 rounded-2xl border text-center relative overflow-hidden", theme.card, theme.border)}>
                    <div className="relative z-10">
                        <Mail className="w-8 h-8 mx-auto mb-4 opacity-50" />
                        <h3 className={cn("text-2xl font-bold mb-3", fontHeading)}>Subscribe to the newsletter</h3>
                        <p className="opacity-70 max-w-md mx-auto mb-6">Get the latest posts and insights delivered straight to your inbox. No spam, ever.</p>
                        <div className="flex gap-2 max-w-sm mx-auto">
                            <input 
                                type="email" 
                                placeholder="your@email.com" 
                                className={cn("flex-1 px-4 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-current", theme.border)}
                            />
                            <Button style={{ backgroundColor: accentColor, color: mode === 'light' ? '#fff' : '#000' }}>
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
             )}
          </main>

          <div className="hidden lg:block lg:col-span-2">
              {/* Spacer or Ad area */}
          </div>
      </div>

      {/* Info Bar */}
      {(post.infoBar?.role || post.infoBar?.timeline) && (
      <section id="section-info" className={cn("w-full max-w-4xl mx-auto px-6 py-12 border-y", theme.border)}>
        <div className="grid grid-cols-2 gap-8">
           <div>
             <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-2", theme.muted)}>Role & Deliverables</h4>
             <p className="text-sm opacity-90">{post.infoBar.role}</p>
           </div>
           <div>
             <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-2", theme.muted)}>Timeline</h4>
             <p className="text-sm opacity-90">{post.infoBar.timeline}</p>
           </div>
        </div>
      </section>
      )}

      {/* Quote */}
      {post.quote?.text && (
      <section id="section-quote" className="w-full max-w-4xl mx-auto px-6 py-24">
        <blockquote className={cn("text-2xl md:text-4xl font-light leading-tight text-center", fontHeading)}>
          "{post.quote.text}"
        </blockquote>
      </section>
      )}

      {/* Process */}
      {post.process && post.process.length > 0 && (
      <section id="section-process" className={cn("py-24 transition-colors", theme.card)}>
        <div className="w-full max-w-5xl mx-auto px-6">
          <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-16", theme.muted)}>Process Overview</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {post.process.map((step) => (
              <div key={step.id} className="p-6 border rounded-lg" style={{ borderColor: `${accentColor}20` }}>
                <div className="text-xs font-bold mb-4" style={{ color: accentColor }}>{step.step} {step.title}</div>
                <p className="text-sm leading-relaxed opacity-80">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Custom Sections */}
      {post.customSections?.map((section) => (
        <section id="section-custom" key={section.id} className={cn("w-full max-w-5xl mx-auto px-6 py-20 border-t", theme.border)}>
          <div className="grid md:grid-cols-12 gap-8">
             <div className="md:col-span-4">
               <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-6", theme.muted)}>{section.title}</h3>
             </div>
             <div className="md:col-span-8">
               <div className="grid sm:grid-cols-2 gap-8">
                 {section.items.map((item) => (
                   <div key={item.id}>
                     <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-2", theme.muted)}>{item.label}</h4>
                     <p className="text-lg font-light leading-relaxed opacity-90">
                       {item.value}
                     </p>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </section>
      ))}

      {/* Impact */}
      {post.impact?.stats && post.impact.stats.length > 0 && (
      <section id="section-impact" className={cn("w-full max-w-5xl mx-auto px-6 py-24 border-t", theme.border)}>
         <h3 className={cn("text-xs font-bold uppercase tracking-widest text-center mb-16", theme.muted)}>Overall Impact</h3>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {post.impact.stats.map((stat) => (
              <div key={stat.id}>
                <div className={cn("text-4xl lg:text-6xl font-light mb-4", fontHeading)}>
                    {stat.value}
                </div>
                <div className={cn("text-xs uppercase tracking-wide", theme.muted)}>{stat.label}</div>
              </div>
            ))}
         </div>
      </section>
      )}

      {/* Case Studies */}
      {post.caseStudies && post.caseStudies.length > 0 && (
      <section id="section-case-studies" className={cn("w-full max-w-5xl mx-auto px-6 py-20 border-t", theme.border)}>
        <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-12", theme.muted)}>Related Case Studies</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {post.caseStudies.map((study) => (
            <div key={study.id} className="group cursor-pointer">
              <div className={cn("aspect-[4/3] overflow-hidden mb-4", theme.card)}>
                 <img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 />
              </div>
              <h4 className="text-lg font-medium leading-snug mb-2 opacity-90 transition-colors group-hover:opacity-100">{study.title}</h4>
              <p className={cn("text-xs uppercase tracking-wide", theme.muted)}>
                {study.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Footer / Author Bio */}
      <section id="section-footer" className={cn("w-full py-20 border-t mt-12", theme.border, theme.bg)}>
          <div className="max-w-3xl mx-auto px-6 text-center">
              <div className={cn("w-20 h-20 mx-auto rounded-full flex items-center justify-center font-bold text-3xl uppercase mb-6 shadow-lg", theme.card)} style={{ color: accentColor }}>
                 {post.author.charAt(0)}
              </div>
              <div className={cn("text-xs font-bold uppercase tracking-widest opacity-50 mb-2")}>Written By</div>
              <div className={cn("font-bold text-3xl mb-4", fontHeading)}>{post.author}</div>
              <p className="opacity-70 max-w-lg mx-auto text-lg mb-6">
                  Digital designer and writer exploring the intersection of technology, culture, and human experience.
              </p>
              
              {(post.authorTwitter || post.authorLinkedin) && (
                  <div className="flex justify-center gap-4">
                      {post.authorTwitter && (
                          <a href={post.authorTwitter} target="_blank" rel="noopener noreferrer" className={cn("p-2 rounded-full border transition-all hover:-translate-y-1", theme.border)}>
                              <Twitter className="w-5 h-5" />
                          </a>
                      )}
                      {post.authorLinkedin && (
                          <a href={post.authorLinkedin} target="_blank" rel="noopener noreferrer" className={cn("p-2 rounded-full border transition-all hover:-translate-y-1", theme.border)}>
                              <Linkedin className="w-5 h-5" />
                          </a>
                      )}
                  </div>
              )}
          </div>
      </section>

    </div>
  );
}
