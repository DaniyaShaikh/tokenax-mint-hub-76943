import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface PropertyListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const PropertyListingDialog = ({ open, onOpenChange, onSuccess }: PropertyListingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    address: "",
    valuation: "",
    expectedTokens: "",
    description: "",
    highlights: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.propertyType || !formData.address || !formData.valuation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error("Please log in to list property");
        return;
      }

      const { error } = await supabase.from("properties").insert({
        owner_id: user.data.user.id,
        title: formData.title,
        property_type: formData.propertyType,
        address: formData.address,
        valuation: parseFloat(formData.valuation),
        expected_tokens: formData.expectedTokens ? parseInt(formData.expectedTokens) : null,
        description: formData.description || null,
        highlights: formData.highlights || null,
        property_images: images,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Property submitted for review!");
      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setFormData({
        title: "",
        propertyType: "",
        address: "",
        valuation: "",
        expectedTokens: "",
        description: "",
        highlights: "",
      });
      setImages([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List Your Property</DialogTitle>
          <DialogDescription>
            Submit your property for tokenization. Our team will review and approve it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Modern Downtown Apartment"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valuation">Property Valuation (USD) *</Label>
              <Input
                id="valuation"
                type="number"
                value={formData.valuation}
                onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
                placeholder="500000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedTokens">Expected Tokens (Optional)</Label>
            <Input
              id="expectedTokens"
              type="number"
              value={formData.expectedTokens}
              onChange={(e) => setFormData({ ...formData, expectedTokens: e.target.value })}
              placeholder="1000"
            />
            <p className="text-xs text-muted-foreground">Admin will finalize token allocation</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed property description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">Key Highlights</Label>
            <Textarea
              id="highlights"
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              placeholder="Prime location, newly renovated, etc..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Property Images</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-accent transition-colors">
              <Label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="font-medium">Upload Images</span>
                  <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                </div>
              </Label>
              <Input
                id="images"
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
                multiple
              />
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
