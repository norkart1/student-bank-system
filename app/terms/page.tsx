import React from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText, Gavel, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">Legal Center</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-12 px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using JDSA Students Bank.
          </p>
        </div>
        
        <div className="grid gap-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-8 md:p-10 space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">1. Acceptance of Use</h2>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  By accessing JDSA Students Bank, you acknowledge that this is an **educational simulation platform**. No real-world currency is involved, and all transactions are strictly for academic record-keeping.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">2. User Responsibilities</h2>
                </div>
                <div className="grid gap-4">
                  {[
                    "Maintain secure and private login credentials.",
                    "Report any platform bugs or errors to staff.",
                    "Use the dashboard only for designated school activities.",
                    "Respect the integrity of the banking simulation."
                  ].map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="font-medium text-muted-foreground">{rule}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">3. Prohibited Conduct</h2>
                </div>
                <Card className="bg-destructive/5 border-destructive/10 border p-6 rounded-2xl">
                  <p className="text-muted-foreground leading-relaxed">
                    Any attempt to manipulate balances, bypass security, or access other students' private information will result in immediate suspension and disciplinary action by the institution.
                  </p>
                </Card>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">4. Disclaimer</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  The institution reserves the right to modify, reset, or update account data as needed for educational purposes. We provide no warranties regarding data persistence in this simulation environment.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
