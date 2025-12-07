import { Header } from '@/components/layout/Header'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Contact
          </h1>
          <p className="text-xl text-muted-foreground">
            Add a contact form or your contact details here.
          </p>
        </div>
      </main>
    </div>
  )
}

