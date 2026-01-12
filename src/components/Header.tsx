import { Wheat, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Wheat className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-tight">
              AgriPlan<span className="text-accent">AI</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Smart Harvest Logistics
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#analysis" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Analysis
          </a>
          <a href="#logistics" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Logistics
          </a>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs text-muted-foreground">AI Active</span>
          </div>
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              <a href="#dashboard" className="text-sm font-medium">Dashboard</a>
              <a href="#analysis" className="text-sm font-medium">Analysis</a>
              <a href="#logistics" className="text-sm font-medium">Logistics</a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
