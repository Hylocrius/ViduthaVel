import { AlertTriangle, ExternalLink, BookOpen } from "lucide-react";
import { t } from "@/lib/i18n";

export function DisclaimerPanel() {
  return (
    <div className="card-elevated p-6 space-y-4 border-l-4 border-warning">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-sm mb-2">{t('disclaimer.title')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('disclaimer.text')}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>{t('disclaimer.sources')}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Loss rates based on <strong>FAO Post-Harvest Loss Guidelines</strong> (Food and Agriculture Organization)</p>
              <p>• Storage parameters from <strong>ICAR Research Publications</strong> (Indian Council of Agricultural Research)</p>
              <p>• Transport costs are indicative averages based on regional market data</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            <a 
              href="https://agmarknet.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-primary hover:underline font-medium"
            >
              {t('disclaimer.verify')}
            </a>
          </div>
          
          <div className="text-xs text-muted-foreground italic pt-2 border-t border-border">
            <p>
              <strong>Note:</strong> This tool provides estimates based on simulated data. 
              Always verify current market prices before making selling decisions. 
              This tool does not guarantee any specific financial outcome.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

