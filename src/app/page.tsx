'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ContactForm } from '@/components/forms/ContactForm'
import { LLMConnectionVisualization } from '@/components/LLMConnectionVisualization'
import { 
  Sparkles, 
  Zap, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Globe,
  FileText,
  BarChart3,
  Megaphone,
  Network,
  Infinity,
  Clock,
  TrendingUp,
  Shield,
  DollarSign,
  ShoppingCart,
  Building2,
  Briefcase,
  Heart,
  Home,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-background">
        {/* Neobank vibrant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.12),transparent_50%)]" />
        {/* Modern grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(59,130,246,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.2)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div 
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge variant="secondary" className="mb-4 sm:mb-6 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-secondary/30 bg-secondary/20 font-semibold shadow-sm">
                <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-secondary animate-pulse" />
                Enterprise AI Visibility
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 md:mb-8 text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              We Help Your Financial Institution
              <span className="block mt-2 sm:mt-3 text-primary">
                Be Found When It Matters Most
              </span>
            </motion.h1>
            
            <motion.h2 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6 text-muted-foreground px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              When your ideal clients turn to AI for financial guidance, we make sure they find you
            </motion.h2>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              We understand the challenge: your clients are increasingly using AI assistants like ChatGPT, Gemini, 
              Claude, and Grok to explore financial solutions. Instead of watching from the sidelines, let's ensure 
              your financial institution is the one they discover. We'll walk alongside you, optimizing your presence and preparing you 
              for the future of AI-driven client discovery.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-12 px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button asChild size="lg" className="h-12 sm:h-14 w-full sm:w-auto px-8 sm:px-12 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95">
                <Link href="#contact" className="flex items-center justify-center">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 sm:h-14 w-full sm:w-auto px-8 sm:px-12 text-base sm:text-lg font-bold border-2 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-105 active:scale-95">
                <Link href="#services" className="flex items-center justify-center">
                  View Services
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side - Visualization */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <LLMConnectionVisualization />
          </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-gradient-to-b from-muted/40 via-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
              How We Help You Shine
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Every financial institution has a unique story. We help AI agents understand yours and share it with the right people.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { icon: Search, title: 'AI Search Optimization', desc: 'We help AI agents truly understand what makes your financial institution special. When someone asks ChatGPT, Gemini, Claude, or Grok about financial solutions, we make sure your financial institution comes to mind. Think of us as your translator—we speak both your language and AI\'s language, so your story gets told the right way.' },
              { icon: Globe, title: 'Multi-Platform Strategy', desc: 'Every AI platform has its own personality and way of discovering firms. Instead of a one-size-fits-all approach, we get to know each platform intimately. Whether your ideal clients use ChatGPT, Gemini, Claude, or Grok, we ensure you\'re there when they need you most.' },
              { icon: Megaphone, title: 'AI Advertising Preparation', desc: 'The future of AI advertising is coming, and we\'re here to help you get ready. When ChatGPT, Gemini, Claude, and Grok launch their ad networks, you\'ll be prepared—not scrambling. We\'ll help you create content that\'s both compelling and compliant, so you\'re ready when opportunity knocks.' },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full p-4 sm:p-6">
                  <motion.div 
                    className="mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <service.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl mb-2 font-bold">{service.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="founders" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
              The People Behind Your Success
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              We're not just a service—we're your partners in growth, committed to understanding your unique journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Kadri Kaasik', role: 'Business Development & Partnerships', initials: 'KK', photo: '/Kadrikaasik.jpg', desc: 'Kadri believes every financial institution has a story worth telling. She listens deeply, builds genuine relationships, and ensures you feel supported every step of the way. Her passion is helping you connect with the clients who need exactly what you offer.', badges: ['Business Development', 'Partnerships', 'Customer Service'] },
              { name: 'Andrias Seeberg', role: 'Marketing & Technical Solutions', initials: 'AS', photo: '/andrias.jpg', desc: 'Andrias combines technical expertise with genuine care for your success. He sees the big picture while paying attention to every detail, crafting strategies that feel authentic to who you are. His goal? Making sure AI agents understand your financial institution as well as you do.', badges: ['Marketing', 'Technical Solutions', 'AI Integration'] },
            ].map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="h-full p-4 sm:p-6">
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 mb-3 sm:mb-4">
                        <AvatarImage 
                          src={founder.photo} 
                          alt={`${founder.name} - ${founder.role}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-br from-primary/20 to-secondary/10 text-primary font-bold">{founder.initials}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-1">{founder.name}</h3>
                    <p className="text-xs sm:text-sm text-primary font-semibold mb-3 sm:mb-4">{founder.role}</p>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6 max-w-sm px-2">
                      {founder.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {founder.badges.map((badge) => (
                        <Badge key={badge} variant="outline" className="text-xs sm:text-sm border-2 border-primary/40 bg-primary/10 font-semibold">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How AI Agents Discover Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
                How We Help AI Agents Find You
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
                Let's explore together how the future of client discovery works, and how we can make it work for you
              </p>
            </motion.div>

            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {[
                { title: 'The Shift Happening Right Now', desc: 'We\'re witnessing something beautiful: your clients are turning to AI assistants like ChatGPT, Gemini, Claude, and Grok for financial guidance. This isn\'t a trend to watch—it\'s happening now. When someone asks these platforms about investment strategies or banking services, we make sure your financial institution is the one they discover. We\'re here to help you be part of this change, not left behind by it.' },
                { title: 'How AI Agents Really Work', desc: 'Think of AI agents as incredibly well-read assistants who\'ve studied everything about financial services. They understand context, recognize patterns, and genuinely want to help people find the right solutions. When someone asks "Where can I find the best wealth management firm?" the AI searches through everything it knows. We help it know you—your strengths, your values, your unique approach. It\'s like introducing yourself to someone who can recommend you to thousands of ideal clients.' },
                { title: 'Why This Matters for Your Financial Institution', desc: 'Here\'s what we\'ve learned: when clients use AI for financial research, they\'re not just browsing—they\'re actively looking for solutions. AI agents understand context in ways traditional search can\'t. They compare options thoughtfully and make recommendations that feel personal. When you\'re visible to AI agents, you\'re being recommended to people who are ready to engage, at the exact moment they need you most. That\'s powerful.' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground">{item.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 p-4 sm:p-6 rounded-lg">
                  <div className="mb-4">
                    <h3 className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-lg sm:text-xl md:text-2xl font-bold">
                      <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                      <span>Coming Soon: AI Platform Advertising for Financial Services</span>
                    </h3>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg sm:text-xl mb-3">What's Coming Next (And How We'll Help You Be Ready)</h4>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                      The major AI platforms are building advertising networks designed with financial services in mind. 
                      Soon, you'll be able to reach your ideal clients exactly when they're asking AI about financial solutions. 
                      We don't want you to be caught off guard—we want you to be prepared, confident, and ready to thrive.
                    </p>
                    <p className="font-semibold mb-3 text-base sm:text-lg">Here's how we'll support you:</p>
                    <ul className="space-y-3 text-muted-foreground">
                      {[
                        'We\'ll help you create profiles that feel authentic to who you are, while meeting every compliance requirement',
                        'Together, we\'ll craft messages that resonate with both AI agents and your ideal clients—compliant and compelling',
                        'We\'ll develop strategies that feel natural, not forced, helping you connect with the right people at the right time',
                        'You\'ll have clear visibility into what\'s working, with tracking that respects both your goals and regulatory needs',
                        'We\'ll help you get early access to new opportunities, so you\'re not just ready—you\'re ahead',
                      ].map((item, index) => (
                        <motion.li 
                          key={item}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <span className="text-base">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mt-4 sm:mt-6 font-medium">
                      We believe in preparing you for what's coming, not just reacting to what's here. Let's start now, 
                      so when these opportunities arrive, you're not just ready—you're thriving.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Benefits Section */}
      <section id="who-benefits" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
              We Work With Firms Like Yours
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Every financial institution has unique needs. Here's how we've helped others, and how we can help you too.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: DollarSign, title: 'Banks & Credit Unions', desc: 'When someone asks AI about banking services or financial planning, we make sure your institution comes to mind. We understand the trust your clients place in you, and we help AI agents understand that too—all while keeping every detail compliant and secure.' },
              { icon: TrendingUp, title: 'Investment Institutions & Wealth Management', desc: 'Your clients are using AI to explore investment strategies and find advisors. We help them find you. When someone asks about wealth management or retirement planning, we ensure your financial institution is part of that conversation, presented in a way that reflects your values and expertise.' },
              { icon: Building2, title: 'Fintech Companies', desc: 'The fintech space moves fast, and we help you keep up. When users ask AI about payment solutions or digital banking, we make sure your innovation gets noticed. We understand the unique challenges of fintech, and we\'re here to help you shine.' },
              { icon: Shield, title: 'Insurance Companies', desc: 'Insurance is about protection and peace of mind. We help AI agents understand how your company provides that. When prospects research coverage options, we ensure you\'re part of their consideration—presented accurately and in compliance with all regulations.' },
              { icon: BarChart3, title: 'Financial Advisors & Consultants', desc: 'As an independent advisor or consultant, your personal touch matters. We help AI agents understand what makes your approach unique. When decision-makers use AI to find financial guidance, we make sure they discover someone who truly understands their needs—you.' },
              { icon: Network, title: 'Payment Processors & Lending Platforms', desc: 'Businesses turn to AI when they need payment solutions or financing. We help them find you. We understand the technical side of what you do, and we help AI agents explain it in ways that resonate with the businesses you serve.' },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full p-4 sm:p-6">
                  <motion.div 
                    className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
              Why This Matters for Your Growth
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              These aren't just features—they're real benefits that help your financial institution connect with the clients who need you most
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: Clock, title: 'Always There When They Need You', desc: 'AI agents never sleep, and neither does your opportunity to be discovered. Whether it\'s 2 AM or 2 PM, someone might be asking AI about financial solutions. We make sure you\'re there, ready to help, whenever that moment comes.' },
              { icon: Target, title: 'Connecting With People Who Are Ready', desc: 'When someone asks AI a specific financial question, they\'re not just curious—they\'re actively looking for solutions. We help you reach these people at exactly the right moment, when they\'re most ready to engage and most likely to value what you offer.' },
              { icon: Globe, title: 'One Strategy, Many Platforms', desc: 'You don\'t have to choose which AI platform to focus on. We help you be present across all of them—ChatGPT, Gemini, Claude, Grok—so no matter where your ideal clients turn, they find you. It\'s efficient, effective, and designed to work for you.' },
              { icon: TrendingUp, title: 'Staying Ahead of the Curve', desc: 'The way people discover financial services is changing, and we want you to be part of that change, not left behind by it. By getting started now, you\'re positioning yourself ahead of competitors and preparing for opportunities that are just around the corner.' },
              { icon: Shield, title: 'Recommendations That Feel Trusted', desc: 'When AI agents recommend your financial institution, it feels different than traditional advertising. It\'s more like a trusted referral—someone genuinely suggesting you because they understand what you offer and who you serve. That trust translates to better connections and stronger relationships.' },
              { icon: DollarSign, title: 'Smart Investment, Real Results', desc: 'We believe in showing you the value of what we do. AI visibility often costs less than traditional advertising while reaching people who are genuinely interested. Plus, when paid AI advertising arrives, you\'ll already be positioned to take advantage of it.' },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full p-4 sm:p-6">
                  <motion.div 
                    className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              className="text-center mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
                Questions We Hear Often
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
                We believe in transparency. Here are honest answers to the questions on your mind.
              </p>
            </motion.div>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'What exactly is AI visibility?', a: 'Think of AI visibility as helping AI agents truly understand your financial institution. When someone asks ChatGPT, Gemini, Claude, or Grok about financial solutions, we make sure your financial institution is part of that conversation. It\'s about being discoverable in a way that feels authentic to who you are, not just being listed somewhere.' },
                { q: 'How do AI agents actually find firms like mine?', a: 'AI agents learn from everything available online—your website, regulatory filings, industry publications. They recognize patterns and understand context. When someone asks a question, they search through what they know. We help them know you—your strengths, your approach, your values. It\'s like introducing yourself to someone who can recommend you to thousands of ideal clients.' },
                { q: 'Which AI platforms should we focus on?', a: 'We work with all the major platforms—ChatGPT, Gemini, Claude, Grok, and emerging ones too. Each has its own personality and user base. Rather than choosing just one, we help you be present across all of them. That way, no matter where your ideal clients turn, they find you. We\'ll help you prioritize based on where your clients actually are.' },
                { q: 'What about AI advertising—is that coming?', a: 'Yes, and we want you to be ready. The major AI platforms are building advertising networks designed with financial services in mind. Soon, you\'ll be able to reach clients exactly when they\'re asking AI about financial solutions. We\'re already helping firms prepare—optimizing profiles, creating compliant content, developing strategies. When these opportunities arrive, you\'ll be ready, not scrambling.' },
                { q: 'How is this different from SEO?', a: 'Traditional SEO is about ranking in search results. AI visibility is about being recommended. AI agents don\'t just list options—they understand context, compare thoughtfully, and make personalized recommendations. When someone asks about wealth management, the AI doesn\'t just show a list—it recommends firms it truly understands. We help it understand you.' },
                { q: 'How quickly will we see results?', a: 'You\'ll start seeing improvements within 2-4 weeks as AI agents update their knowledge. But here\'s what we believe: this is a journey, not a one-time fix. We\'re in this with you for the long term, continuously monitoring, adjusting, and ensuring everything stays compliant. Your success is our success, and we\'re committed to both.' },
                { q: 'Do we really need to be on every platform?', a: 'We understand that every financial institution has different priorities. While being on multiple platforms maximizes your reach, we\'ll help you focus on what matters most for your specific situation. We\'ll look at where your ideal clients actually are, what makes sense for your services, and help you make smart decisions. It\'s about what works for you, not a one-size-fits-all approach.' },
                { q: 'Can you help us prepare for AI advertising?', a: 'Absolutely. We\'re already working with firms to get ready for what\'s coming. We\'ll help you create profiles that feel authentic, develop content that\'s both compelling and compliant, and build strategies that work. When ChatGPT, Gemini, Claude, and Grok launch their ad networks, you won\'t just be ready—you\'ll be positioned to thrive. Let\'s start preparing together.' },
              ].map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <AccordionItem value={`item-${index}`} className="border-primary/20">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:text-primary transition-colors py-3 sm:py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-3 sm:pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-gradient-to-b from-muted/40 via-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
                Let's Start a Conversation
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
                We'd love to hear about your financial institution and explore how we can help you connect with the clients who need you most
              </p>
            </motion.div>
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
              What Makes Us Different
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: Target, title: 'We Speak AI\'s Language', desc: 'We understand how AI agents think, learn, and recommend. It\'s not just technical knowledge—it\'s genuine understanding of how to help AI agents truly see what makes your financial institution special.' },
              { icon: Globe, title: 'Everywhere Your Clients Are', desc: 'We help you be present across all major AI platforms, so no matter where your ideal clients turn for guidance, they find you.' },
              { icon: BarChart3, title: 'Clear, Honest Reporting', desc: 'You deserve to know what\'s working. We provide transparent insights into your visibility, so you can see the real impact of our work together.' },
              { icon: TrendingUp, title: 'Built for What\'s Next', desc: 'We don\'t just help you with today—we prepare you for tomorrow. As AI becomes the primary way people discover financial services, you\'ll be ready.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div 
                  className="mb-3 sm:mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mx-auto border-2 border-primary/20 shadow-lg"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-2">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Visibility
              </h3>
              <p className="text-sm text-muted-foreground">
                Making businesses discoverable in the age of AI
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#services" className="hover:text-primary transition-colors">
                    AI Search Optimization
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-primary transition-colors">
                    Multi-Platform Strategy
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-primary transition-colors">
                    Content Enhancement
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-primary transition-colors">
                    AI Advertising Prep
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-primary transition-colors">
                    Contact
            </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platforms</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>ChatGPT</li>
                <li>Gemini</li>
                <li>Claude</li>
                <li>Grok</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary/20 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} AI Visibility Agency. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
