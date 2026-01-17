import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Shield, Lock, Eye, FileText, Mail, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">JDSA Security</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-12 px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We value your trust. Learn how we protect and manage your data at JDSA Students Bank.
          </p>
        </div>
        
        <div className="grid gap-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-8 md:p-10 space-y-12">
              <section className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">1. Introduction</h2>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Welcome to JDSA Students Bank. Your privacy is our top priority. This document outlines our practices regarding the collection, use, and disclosure of your information when you use our educational banking platform.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Student identification (Name, Code)",
                    "Academic data (Year/Session)",
                    "Financial records (Internal only)",
                    "Profile photography"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">3. Data Usage & Security</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Data is strictly used for educational management, including processing internal deposits/withdrawals and generating student performance reports.
                  </p>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="font-semibold text-primary mb-2">Security Measures:</p>
                    <p className="text-sm italic">
                      All data is protected using enterprise-grade encryption, secure session handling, and advanced password hashing protocols.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">4. Contact & Updates</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  For any privacy-related inquiries, please reach out to the school administration office. This policy is reviewed periodically to ensure maximum protection.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="mailto:admin@jdsaschool.edu" className="flex-1">
                    <Button className="w-full gap-2 py-6 rounded-xl shadow-lg shadow-primary/20">
                      <Mail className="h-4 w-4" />
                      Contact Administration
                    </Button>
                  </Link>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <p>Last modified: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
