import { useState } from "react";
import { Leaf, MapPin, Package, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROPS, STORAGE_CONDITIONS, type CropType, type StorageCondition } from "@/lib/mockData";

interface FarmContextFormProps {
  onSubmit: (data: FarmContext) => void;
  isLoading?: boolean;
}

export interface FarmContext {
  crop: CropType;
  quantity: number;
  location: string;
  storageCondition: StorageCondition;
}

export function FarmContextForm({ onSubmit, isLoading }: FarmContextFormProps) {
  const [cropId, setCropId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("50");
  const [location, setLocation] = useState<string>("");
  const [storageId, setStorageId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const crop = CROPS.find(c => c.id === cropId);
    const storage = STORAGE_CONDITIONS.find(s => s.type === storageId);
    
    if (crop && storage && quantity && location) {
      onSubmit({
        crop,
        quantity: Number(quantity),
        location,
        storageCondition: storage,
      });
    }
  };

  const isValid = cropId && quantity && location && storageId;

  return (
    <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Leaf className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-semibold">Farm Context</h2>
          <p className="text-xs text-muted-foreground">Tell us about your harvest</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="crop" className="text-sm font-medium">
            Crop Type
          </Label>
          <Select value={cropId} onValueChange={setCropId}>
            <SelectTrigger id="crop" className="w-full">
              <SelectValue placeholder="Select crop" />
            </SelectTrigger>
            <SelectContent>
              {CROPS.map((crop) => (
                <SelectItem key={crop.id} value={crop.id}>
                  <span className="flex items-center gap-2">
                    {crop.name} <span className="text-muted-foreground">({crop.nameHindi})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-sm font-medium">
            Quantity (Quintals)
          </Label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="quantity"
              type="number"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="pl-10"
              placeholder="50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Farm Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
              placeholder="Village, District"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storage" className="text-sm font-medium">
            Storage Condition
          </Label>
          <Select value={storageId} onValueChange={setStorageId}>
            <SelectTrigger id="storage" className="w-full">
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select storage" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STORAGE_CONDITIONS.map((storage) => (
                <SelectItem key={storage.type} value={storage.type}>
                  <div className="flex flex-col">
                    <span>{storage.type}</span>
                    <span className="text-xs text-muted-foreground">{storage.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full font-medium"
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Analyzing...
          </span>
        ) : (
          "Analyze Markets & Get Recommendation"
        )}
      </Button>
    </form>
  );
}
