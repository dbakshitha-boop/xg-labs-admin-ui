import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PortfolioEditor } from './components/PortfolioEditor';
import { BlogEditor } from './components/BlogEditor';
import { PortfolioView } from './components/PortfolioView';
import { BlogView } from './components/BlogView';
import { ContactDashboard } from './components/ContactDashboard';
import { MarketingDashboard } from './components/MarketingDashboard';
import { BrandDashboard } from './components/BrandDashboard';
import { Portfolio, initialPortfolio, BlogPost, initialBlogPost, ContactSubmission, Subscriber, Campaign, Brand } from './types';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Button } from './components/ui/button';
import { LayoutDashboard, FileText, Briefcase, Mail, Users, Loader2, LogOut, Star } from 'lucide-react';
import { cn } from './lib/utils';
import { Login } from './components/Login';
import {
  portfoliosApi,
  blogsApi,
  subscribersApi,
  campaignsApi,
  contactsApi,
  brandsApi
} from './api';
import { BASE_URL } from './lib/apiClient';

type ViewState = 'dashboard' | 'editor' | 'preview';
type ToolType = 'portfolio' | 'blog' | 'contact' | 'marketing' | 'brand';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [view, setView] = useState<ViewState>('dashboard');
  const [activeTool, setActiveTool] = useState<ToolType>('portfolio');
  const [isLoading, setIsLoading] = useState(false);
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setApiError(null);
    const [p, b, s, c, m, br] = await Promise.allSettled([
      portfoliosApi.getAll(),
      blogsApi.getAll(),
      subscribersApi.getAll(),
      campaignsApi.getAll(),
      contactsApi.getAll(),
      brandsApi.getAll(),
    ]);

    if (p.status === 'fulfilled') setPortfolios(p.value);
    if (b.status === 'fulfilled') setBlogPosts(b.value);
    if (s.status === 'fulfilled') setSubscribers(s.value);
    if (c.status === 'fulfilled') setCampaigns(c.value);
    if (m.status === 'fulfilled') setSubmissions(m.value);
    if (br.status === 'fulfilled') setBrands(br.value);

    const failures = [
      p.status === 'rejected' ? `portfolios: ${p.reason}` : null,
      b.status === 'rejected' ? `blogs: ${b.reason}` : null,
      s.status === 'rejected' ? `subscribers: ${s.reason}` : null,
      m.status === 'rejected' ? `contacts: ${m.reason}` : null,
      br.status === 'rejected' ? `brands: ${br.reason}` : null,
    ].filter(Boolean);

    if (failures.length > 0) {
      setApiError(`Backend: ${BASE_URL}\n${failures.join('\n')}`);
    }
    setIsLoading(false);
  };

  // Auth & Data Loading
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setPortfolios([]);
      setBlogPosts([]);
      setSubscribers([]);
      setCampaigns([]);
      setSubmissions([]);
      setBrands([]);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  // Helper to switch tools and reset view
  const switchTool = (tool: ToolType) => {
    setActiveTool(tool);
    setView('dashboard');
    setCurrentId(null);
  };

  const handleCreate = async () => {
    if (activeTool === 'contact' || activeTool === 'marketing' || activeTool === 'brand') return;
    
    try {
      if (activeTool === 'portfolio') {
        const { id: _, ...initialData } = initialPortfolio;
        const newPortfolio = {
          ...initialData,
          title: 'New Portfolio Project',
          slug: `new-project-${Date.now()}`,
          status: 'draft' as const,
        };
        const created = await portfoliosApi.add(newPortfolio);
        setPortfolios([created, ...portfolios]);
        setCurrentId(created.id);
      } else {
        const { id: _, ...initialData } = initialBlogPost;
        const newPost = {
          ...initialData,
          title: 'New Blog Post',
          slug: `new-post-${Date.now()}`,
          status: 'draft' as const,
          publishedAt: new Date().toISOString().split('T')[0],
        };
        const created = await blogsApi.add(newPost);
        setBlogPosts([created, ...blogPosts]);
        setCurrentId(created.id);
      }
      setView('editor');
      toast.success(`New ${activeTool === 'portfolio' ? 'project' : 'post'} created`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create item");
    }
  };

  const handleEdit = (id: string) => {
    setCurrentId(id);
    setView('editor');
  };

  const handleView = (id: string) => {
    setCurrentId(id);
    setView('preview');
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete this ${activeTool === 'portfolio' ? 'project' : 'post'}?`)) {
      try {
        if (activeTool === 'portfolio') {
          await portfoliosApi.delete(id);
          setPortfolios(portfolios.filter(p => p.id !== id));
        } else {
          await blogsApi.delete(id);
          setBlogPosts(blogPosts.filter(p => p.id !== id));
        }
        toast.success('Item deleted');
        if (currentId === id) {
          setView('dashboard');
          setCurrentId(null);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete item");
      }
    }
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'published') => {
    try {
      if (activeTool === 'portfolio') {
        await portfoliosApi.update(id, { status });
        setPortfolios(portfolios.map(p => p.id === id ? { ...p, status } : p));
      } else {
        await blogsApi.update(id, { status });
        setBlogPosts(blogPosts.map(p => p.id === id ? { ...p, status } : p));
      }
      toast.success(`Item ${status === 'published' ? 'published' : 'unpublished'}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleSave = async (updatedItem: any) => {
    try {
      if (activeTool === 'portfolio') {
        await portfoliosApi.update(updatedItem.id, updatedItem);
        setPortfolios(portfolios.map(p => p.id === updatedItem.id ? updatedItem : p));
      } else {
        await blogsApi.update(updatedItem.id, updatedItem);
        setBlogPosts(blogPosts.map(p => p.id === updatedItem.id ? updatedItem : p));
      }
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    }
  };

  const handleContactStatusChange = async (id: string, status: 'new' | 'read' | 'archived') => {
      try {
        await contactsApi.update(id, { status });
        setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
        toast.success('Message status updated');
      } catch (error) {
        toast.error("Failed to update message");
      }
  };

  const handleContactDelete = async (id: string) => {
      if (confirm('Are you sure you want to delete this message?')) {
          try {
            await contactsApi.delete(id);
            setSubmissions(submissions.filter(s => s.id !== id));
            toast.success('Message deleted');
          } catch (error) {
            toast.error("Failed to delete message");
          }
      }
  };

  const handleAddToSubscribers = async (data: Omit<Subscriber, 'id'>) => {
      if (subscribers.some(s => s.email === data.email)) {
          toast.info('This person is already a subscriber.');
          return;
      }
      
      try {
        const created = await subscribersApi.add(data);
        setSubscribers([created, ...subscribers]);
        toast.success(`${data.name || data.email} added to audience!`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to add subscriber");
      }
  };

  const handleUpdateSubscriber = async (subscriber: Subscriber) => {
      try {
          const { id, ...data } = subscriber;
          await subscribersApi.update(id, data);
          setSubscribers(subscribers.map(s => s.id === id ? subscriber : s));
          toast.success('Subscriber updated successfully');
      } catch (error) {
          console.error(error);
          toast.error("Failed to update subscriber");
      }
  };

  const handleDeleteSubscriber = async (id: string) => {
      try {
          await subscribersApi.delete(id);
          setSubscribers(subscribers.filter(s => s.id !== id));
          toast.success('Subscriber removed');
      } catch (error) {
          console.error(error);
          toast.error("Failed to delete subscriber");
      }
  };

  const handleCreateCampaign = async (campaign: Omit<Campaign, 'id'>) => {
      try {
          const created = await campaignsApi.add(campaign);
          setCampaigns([created, ...campaigns]);
          toast.success('Campaign sent successfully!');
      } catch (error) {
          console.error(error);
          toast.error("Failed to send campaign");
      }
  };

  const handleAddBrand = async (brand: Omit<Brand, 'id'>) => {
    try {
        const created = await brandsApi.add(brand);
        setBrands([...brands, created]);
        toast.success('Brand added');
    } catch (e) {
        toast.error('Failed to add brand');
    }
  };

  const handleUpdateBrand = async (id: string, data: Partial<Brand>) => {
    try {
        await brandsApi.update(id, data);
        setBrands(brands.map(b => b.id === id ? { ...b, ...data } : b));
        toast.success('Brand updated');
    } catch (e) {
        toast.error('Failed to update brand');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
        await brandsApi.delete(id);
        setBrands(brands.filter(b => b.id !== id));
        toast.success('Brand removed');
    } catch (e) {
        toast.error('Failed to remove brand');
    }
  };

  const handleSendUpdate = async (id: string) => {
      const item = activeTool === 'portfolio' 
        ? portfolios.find(p => p.id === id) 
        : blogPosts.find(p => p.id === id);
      
      if (!item) return;

      const activeSubscribersCount = subscribers.filter(s => s.status === 'subscribed').length;

      if (!confirm(`Are you sure you want to send "${item.title}" to all ${activeSubscribersCount} active subscribers?`)) {
          return;
      }

      const campaign: Omit<Campaign, 'id'> = {
          subject: activeTool === 'portfolio' ? `New Case Study: ${item.title}` : `New Post: ${item.title}`,
          status: 'sent',
          sentAt: new Date().toISOString(),
          recipientCount: activeSubscribersCount,
          openRate: 0,
          clickRate: 0
      };

      try {
          const created = await campaignsApi.add(campaign);
          setCampaigns([created, ...campaigns]);
          toast.success('Update sent to subscribers successfully!');
      } catch (error) {
          console.error(error);
          toast.error("Failed to send update");
      }
  };

  const activeItem = activeTool === 'portfolio' 
    ? portfolios.find(p => p.id === currentId)
    : blogPosts.find(p => p.id === currentId);

  // Not Authenticated -> Show Login
  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={() => { setIsAuthenticated(true); }} />
        <Toaster />
      </>
    );
  }

  // Authenticated but Data Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
           <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-500 mb-4" />
           <p className="text-zinc-500">Loading Dashboard...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 bg-zinc-900 flex flex-col items-center py-6 gap-6 shrink-0 z-50">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex flex-col gap-4 w-full px-2 flex-1">
            <button 
                onClick={() => switchTool('contact')}
                className={cn(
                    "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                    activeTool === 'contact' ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
                title="Inbox"
            >
                <div className="relative">
                    <Mail className="w-6 h-6" />
                    {submissions.filter(s => s.status === 'new').length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-900" />
                    )}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">Inbox</span>
            </button>

            <button 
                onClick={() => switchTool('marketing')}
                className={cn(
                    "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                    activeTool === 'marketing' ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
                title="Marketing"
            >
                <Users className="w-6 h-6" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Audience</span>
            </button>

            <div className="w-full h-px bg-white/10 my-2" />
            
            <button 
                onClick={() => switchTool('portfolio')}
                className={cn(
                    "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                    activeTool === 'portfolio' ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
                title="Portfolio"
            >
                <Briefcase className="w-6 h-6" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Work</span>
            </button>

            <button 
                onClick={() => switchTool('blog')}
                className={cn(
                    "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                    activeTool === 'blog' ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
                title="Blog"
            >
                <FileText className="w-6 h-6" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Blog</span>
            </button>

            <button 
                onClick={() => switchTool('brand')}
                className={cn(
                    "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                    activeTool === 'brand' ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
                title="Brands"
            >
                <Star className="w-6 h-6" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Brands</span>
            </button>

            <div className="flex-1" />
            
            <button 
                onClick={handleLogout}
                className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-zinc-400 hover:bg-white/5 hover:text-red-400"
                title="Log Out"
            >
                <LogOut className="w-6 h-6" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {apiError && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-800 font-mono whitespace-pre-wrap shrink-0">
              <strong>API Error — check Vercel env vars:</strong>{'\n'}{apiError}
            </div>
          )}
          
          {view === 'dashboard' && (
            <div className="flex-1 overflow-auto">
                {activeTool === 'contact' ? (
                    <ContactDashboard 
                        submissions={submissions}
                        onDelete={handleContactDelete}
                        onStatusChange={handleContactStatusChange}
                        onAddToSubscribers={handleAddToSubscribers}
                    />
                ) : activeTool === 'marketing' ? (
                    <MarketingDashboard 
                        subscribers={subscribers}
                        campaigns={campaigns}
                        blogPosts={blogPosts}
                        portfolios={portfolios}
                        onUpdateSubscriber={handleUpdateSubscriber}
                        onDeleteSubscriber={handleDeleteSubscriber}
                        onCreateCampaign={handleCreateCampaign}
                    />
                ) : activeTool === 'brand' ? (
                    <BrandDashboard 
                        brands={brands}
                        onAdd={handleAddBrand}
                        onUpdate={handleUpdateBrand}
                        onDelete={handleDeleteBrand}
                    />
                ) : (
                    <Dashboard  
                        type={activeTool as 'portfolio' | 'blog'}
                        items={activeTool === 'portfolio' ? portfolios : blogPosts}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onSendUpdate={handleSendUpdate}
                    />
                )}
            </div>
          )}

          {view === 'editor' && activeItem && (
            <div className="h-full w-full">
                {activeTool === 'portfolio' ? (
                    <PortfolioEditor 
                        initialData={activeItem as Portfolio}
                        onSave={handleSave}
                        onCancel={() => setView('dashboard')}
                    />
                ) : (
                    <BlogEditor 
                        initialData={activeItem as BlogPost}
                        onSave={handleSave}
                        onCancel={() => setView('dashboard')}
                    />
                )}
            </div>
          )}

          {view === 'preview' && activeItem && (
            <div className="relative h-full overflow-auto bg-white">
              {activeTool === 'portfolio' ? (
                  <PortfolioView portfolio={activeItem as Portfolio} />
              ) : (
                  <BlogView post={activeItem as BlogPost} onBack={() => setView('dashboard')} />
              )}
              
              {/* Builder Navigation Overlay - Only show if not handled by internal back button */}
              {activeTool === 'portfolio' && (
                  <div className="fixed bottom-6 right-6 flex gap-2 z-50">
                    <Button onClick={() => setView('editor')} className="shadow-lg">
                        Edit This Page
                    </Button>
                    <Button variant="secondary" onClick={() => setView('dashboard')} className="shadow-lg">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                  </div>
              )}
            </div>
          )}
      </main>

      <Toaster />
    </div>
  );
}