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
  Users,
  MessageCircle,
  Eye,
  Brain,
  Lightbulb
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
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 md:mb-8 text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Get Cited by ChatGPT, Gemini, Claude & Grok
              <span className="block mt-2 sm:mt-3 text-primary">
                — or stay invisible.
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-4 sm:mb-6 md:mb-8 lg:mb-10 max-w-3xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              As AI becomes the primary way people discover products, e-commerce businesses face a critical challenge: when shoppers ask AI 
              assistants about products, will your store be mentioned? Large language models like ChatGPT, Gemini, Claude, and Grok learn from 
              online content to provide product recommendations.
            </motion.p>
            
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-4 sm:mb-6 md:mb-8 lg:mb-10 max-w-3xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              At Citrus, we specialize in AI visibility optimization for e-commerce businesses. We help online stores understand how AI agents 
              discover and cite e-commerce brands, then optimize their online presence to increase product recommendations. Our approach combines 
              content strategy, technical optimization, and positioning to make your e-commerce store discoverable across major AI platforms.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-12 px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button asChild size="lg" className="h-12 sm:h-14 w-full sm:w-auto px-8 sm:px-12 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95">
                <Link href="#contact" className="flex items-center justify-center">
                  Get Your Free AI Visibility Score
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 sm:h-14 w-full sm:w-auto px-8 sm:px-12 text-base sm:text-lg font-bold border-2 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-105 active:scale-95">
                <Link href="#how-it-works" className="flex items-center justify-center">
                  Learn How It Works
                </Link>
              </Button>
            </motion.div>
            
            {/* Trust Signals (temporarily removed per request) */}
          </motion.div>

          {/* Right side - Visualization */}
          <motion.div
            className="flex items-center justify-center w-full mt-8 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-full max-w-full">
              <LLMConnectionVisualization />
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding AI Visibility Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8 text-foreground">
                Understanding AI Visibility and Citation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg border border-primary/20 bg-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">What is AI Visibility?</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      How discoverable your store is when users ask ChatGPT, Gemini, Claude, and Grok about products. Unlike SEO rankings, AI visibility means being recommended and cited by AI agents.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg border border-primary/20 bg-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">How AI Chooses Stores</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      AI systems understand context and authority signals. Stores with clear positioning, comprehensive presence, and established authority get cited most often.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg border border-primary/20 bg-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">The New Discovery Channel</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      AI provides direct answers with specific recommendations—not just lists. If you're not being cited, you're missing a growing channel of customer discovery.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg border border-primary/20 bg-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">Different from Search</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      AI systems learn from patterns in how product information is presented. They recognize relationships and authority—not just keywords.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The New Reality Section - Before/After */}
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
              The New Reality
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2 mt-4">
              The landscape of product discovery is changing rapidly. Here's what many e-commerce businesses are experiencing versus what's possible 
              with strategic AI visibility optimization.
            </p>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Before Column */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-4 sm:p-6 md:p-8 rounded-lg border-2 border-destructive/20 bg-destructive/5"
              >
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-destructive">Before Citrus</h3>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-destructive mt-0.5 sm:mt-1 text-lg sm:text-xl">✗</span>
                    <span className="text-sm sm:text-base text-muted-foreground">Zero-click searches kill your traffic</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-destructive mt-0.5 sm:mt-1 text-lg sm:text-xl">✗</span>
                    <span className="text-sm sm:text-base text-muted-foreground">Competitors get cited instead of you</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-destructive mt-0.5 sm:mt-1 text-lg sm:text-xl">✗</span>
                    <span className="text-sm sm:text-base text-muted-foreground">Spending $50k+/mo on SEO with shrinking ROI</span>
                  </li>
                </ul>
              </motion.div>

              {/* After Column */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-4 sm:p-6 md:p-8 rounded-lg border-2 border-primary/30 bg-primary/10"
              >
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-primary">After Citrus</h3>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 sm:mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-muted-foreground">You win the zero-click war</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 sm:mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-muted-foreground">You dominate every relevant AI answer</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 sm:mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-muted-foreground">Lower ad spend, higher authority, evergreen leads</span>
                  </li>
                </ul>
              </motion.div>
            </div>
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
              { icon: Target, title: 'We Speak AI\'s Language', desc: 'We understand how AI agents think, learn, and recommend. It\'s not just technical knowledge—it\'s genuine understanding of how to help AI agents truly see what makes your e-commerce store special.' },
              { icon: Globe, title: 'Everywhere Your Shoppers Are', desc: 'We help you be present across all major AI platforms, so no matter where your ideal shoppers turn for product recommendations, they find you.' },
              { icon: BarChart3, title: 'Clear, Honest Reporting', desc: 'You deserve to know what\'s working. We provide transparent insights into your visibility, so you can see the real impact on your sales and traffic.' },
              { icon: TrendingUp, title: 'Built for What\'s Next', desc: 'We don\'t just help you with today—we prepare you for tomorrow. As AI becomes the primary way people discover products, you\'ll be ready.' },
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
          <motion.div 
            className="flex justify-center mt-8 sm:mt-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button asChild size="lg" className="h-12 sm:h-14 w-full sm:w-auto px-6 sm:px-8 md:px-12 text-sm sm:text-base md:text-lg font-bold shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95">
              <Link href="#contact" className="flex items-center justify-center">
                Get Your Free AI Visibility Score
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - 3-Step Timeline */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground px-2">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
              Our approach to AI visibility optimization is systematic and data-driven. We analyze your current position, build strategic 
              content architecture, and continuously optimize to improve your visibility across major AI platforms.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8 sm:space-y-12">
              {[
                { 
                  step: '1', 
                  title: 'Audit & Baseline', 
                  desc: 'We scan 50M+ monthly prompts across ChatGPT, Gemini, Claude, Perplexity, Grok and show exactly where you rank today.',
                  icon: Search
                },
                { 
                  step: '2', 
                  title: 'Strategic Citation Architecture™', 
                  desc: 'We build authoritative, citation-magnet content + structured signals that LLMs can\'t ignore.',
                  icon: Target
                },
                { 
                  step: '3', 
                  title: 'Amplify & Dominate', 
                  desc: 'Multi-channel distribution + continuous optimization until you own the answer box.',
                  icon: TrendingUp
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex gap-4 sm:gap-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                      {item.step}
                    </div>
                    {index < 2 && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-primary/30 to-transparent mt-4 min-h-[60px]"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                      <h3 className="text-xl sm:text-2xl font-bold">{item.title}</h3>
                    </div>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div 
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button asChild size="lg" className="h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95">
              <Link href="#contact" className="flex items-center justify-center">
                Get Your Free AI Visibility Score
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </motion.div>
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
              We're not just a service—we're your partners in growth, committed to understanding your unique e-commerce journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Kadri Kaasik', role: 'Business Development & Partnerships', initials: 'KK', photo: '/Kadrikaasik.jpg', desc: 'Kadri believes every e-commerce store has a story worth telling. She listens deeply, builds genuine relationships, and ensures you feel supported every step of the way. Her passion is helping you connect with the shoppers who need exactly what you offer.', badges: ['Business Development', 'Partnerships', 'Customer Service'] },
              { name: 'Andrias Seeberg', role: 'Marketing & Technical Solutions', initials: 'AS', photo: '/andrias.jpg', desc: 'Andrias combines technical expertise with genuine care for your success. He sees the big picture while paying attention to every detail, crafting strategies that feel authentic to who you are. His goal? Making sure AI agents understand your e-commerce store as well as you do.', badges: ['Marketing', 'Technical Solutions', 'AI Integration'] },
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

      {/* How AI Agents Work Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8 text-foreground">
                How AI Agents Discover and Cite Businesses
              </h2>
              <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                <p>
                  Large language models like ChatGPT, Gemini, Claude, and Grok are trained on vast amounts of text data from the internet. When a 
                  shopper asks about products, these AI systems draw from their training data to construct responses based on patterns they've learned 
                  about e-commerce stores and products.
                </p>
                <p>
                  For an e-commerce store to be cited by an AI agent, it needs a strong online presence with clear, authoritative product content. Industry 
                  recognition, media coverage, and comprehensive product information all contribute to how AI systems understand and reference an e-commerce 
                  business. The way product information is structured and the language used influence whether an AI will cite it.
                </p>
                <p>
                  AI systems recognize patterns of authority. E-commerce stores frequently mentioned in industry publications, with detailed product documentation 
                  and positive reviews, are more likely to be cited. However, simply having an online store isn't enough—product content must be structured in 
                  ways AI systems can understand and reference meaningfully.
                </p>
                <p>
                  Strategic AI visibility optimization helps e-commerce businesses structure their online presence to increase citations. This involves product 
                  content strategy, technical optimization, and positioning that makes it easier for AI systems to understand what products you offer and when 
                  your store should be recommended.
                </p>
                <p>
                  AI visibility is different from traditional SEO. While SEO focuses on ranking in search results, AI visibility is about being included 
                  in AI-generated product recommendations. The metrics, strategies, and outcomes are different for e-commerce businesses.
                </p>
              </div>
            </motion.div>
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
              We Work With E-commerce Stores Like Yours
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Every e-commerce business has unique needs. Here's how we've helped others, and how we can help you too.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: ShoppingCart, title: 'Fashion & Apparel Stores', desc: 'When shoppers ask AI about clothing, accessories, or style recommendations, we make sure your store comes to mind. We understand what makes your brand unique, and we help AI agents understand that too—so shoppers discover your products when they need them most.' },
              { icon: Home, title: 'Home & Lifestyle Brands', desc: 'Shoppers are using AI to find home decor, furniture, and lifestyle products. We help them find you. When someone asks about home improvement or interior design, we ensure your e-commerce store is part of that conversation, presented in a way that reflects your brand and quality.' },
              { icon: Heart, title: 'Beauty & Wellness Products', desc: 'The beauty and wellness space moves fast, and we help you keep up. When shoppers ask AI about skincare, makeup, or wellness products, we make sure your products get noticed. We understand the unique challenges of e-commerce in this industry, and we\'re here to help you shine.' },
              { icon: Zap, title: 'Electronics & Tech Stores', desc: 'Tech products are about innovation and reliability. We help AI agents understand how your e-commerce store provides that. When shoppers research the latest gadgets or tech solutions, we ensure you\'re part of their consideration—presented accurately and highlighting your expertise.' },
              { icon: Briefcase, title: 'B2B E-commerce Platforms', desc: 'As a B2B e-commerce platform, your professional approach matters. We help AI agents understand what makes your service unique. When businesses use AI to find suppliers or wholesale products, we make sure they discover a platform that truly understands their needs—yours.' },
              { icon: Users, title: 'Niche & Specialty Stores', desc: 'Shoppers turn to AI when they need specific, hard-to-find products. We help them find you. We understand the unique products you offer, and we help AI agents explain them in ways that resonate with the shoppers who need exactly what you sell.' },
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
                    className="mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
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
              These aren't just features—they're real benefits that help your e-commerce store connect with the shoppers who need you most
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: Clock, title: 'Always There When They Need You', desc: 'AI agents never sleep, and neither does your opportunity to be discovered. Whether it\'s 2 AM or 2 PM, someone might be asking AI about products. We make sure your e-commerce store is there, ready to help, whenever that shopping moment comes.' },
              { icon: Target, title: 'Connecting With Shoppers Who Are Ready', desc: 'When someone asks AI a specific product question, they\'re not just curious—they\'re actively looking to buy. We help you reach these shoppers at exactly the right moment, when they\'re most ready to purchase and most likely to convert.' },
              { icon: Globe, title: 'One Strategy, Many Platforms', desc: 'You don\'t have to choose which AI platform to focus on. We help you be present across all of them—ChatGPT, Gemini, Claude, Grok—so no matter where your ideal shoppers turn, they find you. It\'s efficient, effective, and designed to work for your e-commerce business.' },
              { icon: TrendingUp, title: 'Staying Ahead of the Curve', desc: 'The way people discover products is changing, and we want you to be part of that change, not left behind by it. By getting started now, you\'re positioning your e-commerce store ahead of competitors and preparing for opportunities that are just around the corner.' },
              { icon: Shield, title: 'Recommendations That Feel Trusted', desc: 'When AI agents recommend your e-commerce store, it feels different than traditional advertising. It\'s more like a trusted referral—someone genuinely suggesting your products because they understand what you offer. That trust translates to better conversions and stronger customer relationships.' },
              { icon: DollarSign, title: 'Smart Investment, Real Results', desc: 'We believe in showing you the value of what we do. AI visibility often costs less than traditional advertising while reaching shoppers who are genuinely interested in buying. Plus, when paid AI advertising arrives, you\'ll already be positioned to take advantage of it.' },
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
                    className="mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
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
                AI visibility is the new front door to your store. Tell us about your brand and we’ll send a free AI Visibility Report showing where you stand—and how to get cited more often.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground px-2 mt-2">
                Fill in the form below to get your free visibility score and a tailored action plan.
              </p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-full max-w-2xl">
                <ContactForm />
              </div>
              
              {/* WhatsApp Contact Option */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-px w-12 bg-border"></div>
                  <span className="text-sm font-medium">or</span>
                  <div className="h-px w-12 bg-border"></div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-[#25D366] hover:bg-[#25D366]/90 text-white hover:scale-105 active:scale-95"
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      const phoneNumber = '37253498180'
                      const message = encodeURIComponent('Hello! I\'m interested in learning more about AI visibility for my e-commerce store.')
                      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
                    }}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Contact via WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="font-bold text-2xl mb-4 tracking-tight">
                Citrus
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
            <p>&copy; {new Date().getFullYear()} Citrus. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
                { q: 'What exactly is AI visibility?', a: 'Think of AI visibility as helping AI agents truly understand your e-commerce store. When someone asks ChatGPT, Gemini, Claude, or Grok about products, we make sure your store is part of that conversation. It\'s about being discoverable in a way that feels authentic to your brand, not just being listed somewhere.' },
                { q: 'How do AI agents actually find stores like mine?', a: 'AI agents learn from everything available online—your website, product descriptions, reviews, and industry content. They recognize patterns and understand context. When someone asks about products, they search through what they know. We help them know you—your products, your brand, your values. It\'s like introducing yourself to someone who can recommend you to thousands of ideal shoppers.' },
                { q: 'Which AI platforms should we focus on?', a: 'We work with all the major platforms—ChatGPT, Gemini, Claude, Grok, and emerging ones too. Each has its own personality and user base. Rather than choosing just one, we help you be present across all of them. That way, no matter where your ideal shoppers turn, they find you. We\'ll help you prioritize based on where your shoppers actually are.' },
                { q: 'What about AI advertising—is that coming?', a: 'Yes, and we want you to be ready. The major AI platforms are building advertising networks designed with e-commerce in mind. Soon, you\'ll be able to reach shoppers exactly when they\'re asking AI about products. We\'re already helping e-commerce stores prepare—optimizing product descriptions, creating compelling content, developing strategies. When these opportunities arrive, you\'ll be ready, not scrambling.' },
                { q: 'How is this different from SEO?', a: 'Traditional SEO is about ranking in search results. AI visibility is about being recommended. AI agents don\'t just list options—they understand context, compare thoughtfully, and make personalized product recommendations. When someone asks about running shoes, the AI doesn\'t just show a list—it recommends stores it truly understands. We help it understand you.' },
                { q: 'How quickly will we see results?', a: 'You\'ll start seeing improvements within 2-4 weeks as AI agents update their knowledge. But here\'s what we believe: this is a journey, not a one-time fix. We\'re in this with you for the long term, continuously monitoring, adjusting, and optimizing your presence. Your success is our success, and we\'re committed to both.' },
                { q: 'Do we really need to be on every platform?', a: 'We understand that every e-commerce store has different priorities. While being on multiple platforms maximizes your reach, we\'ll help you focus on what matters most for your specific situation. We\'ll look at where your ideal shoppers actually are, what makes sense for your products, and help you make smart decisions. It\'s about what works for you, not a one-size-fits-all approach.' },
                { q: 'Can you help us prepare for AI advertising?', a: 'Absolutely. We\'re already working with e-commerce stores to get ready for what\'s coming. We\'ll help you create product profiles that feel authentic, develop descriptions that are both compelling and optimized, and build strategies that work. When ChatGPT, Gemini, Claude, and Grok launch their ad networks, you won\'t just be ready—you\'ll be positioned to thrive. Let\'s start preparing together.' },
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
    </div>
  )
}
