import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Save, Upload, Play, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ExhibitionData {
  name: string;
  description: string;
  curator: string;
  startDate: string;
  endDate: string;
  status: string;
  category: string;
  location: string;
  videoUrl: string;
  tags: string[];
  metadata: {
    key: string;
    value: string;
  }[];
}

const mockExhibition: ExhibitionData = {
  name: "Ancient Rome: City of the Caesars",
  description: "Explore the grandeur and power of Ancient Rome through artifacts, sculptures, and interactive displays showcasing daily life, military might, and architectural marvels of the Roman Empire.",
  curator: "Dr. Marcus Aurelius",
  startDate: "2024-01-15",
  endDate: "2024-12-31",
  status: "active",
  category: "Ancient History",
  location: "West Wing, Floor 2",
  videoUrl: "https://example.com/videos/ancient-rome-intro.mp4",
  tags: ["Ancient Rome", "Roman Empire", "Architecture", "History"],
  metadata: [
    { key: "Period", value: "753 BC - 476 AD" },
    { key: "Region", value: "Mediterranean" },
    { key: "Total Artifacts", value: "87" },
  ],
};

export function ExhibitionEditor() {
  const [exhibition, setExhibition] = useState<ExhibitionData>(mockExhibition);
  const [newTag, setNewTag] = useState("");
  const [newMetadataKey, setNewMetadataKey] = useState("");
  const [newMetadataValue, setNewMetadataValue] = useState("");

  const handleInputChange = (field: keyof ExhibitionData, value: string) => {
    setExhibition({ ...exhibition, [field]: value });
  };

  const addTag = () => {
    if (newTag.trim() && !exhibition.tags.includes(newTag.trim())) {
      setExhibition({ ...exhibition, tags: [...exhibition.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setExhibition({ ...exhibition, tags: exhibition.tags.filter((tag) => tag !== tagToRemove) });
  };

  const addMetadata = () => {
    if (newMetadataKey.trim() && newMetadataValue.trim()) {
      setExhibition({
        ...exhibition,
        metadata: [...exhibition.metadata, { key: newMetadataKey.trim(), value: newMetadataValue.trim() }],
      });
      setNewMetadataKey("");
      setNewMetadataValue("");
    }
  };

  const removeMetadata = (index: number) => {
    setExhibition({
      ...exhibition,
      metadata: exhibition.metadata.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    alert("Exhibition saved successfully!");
    console.log("Saved exhibition data:", exhibition);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Edit Exhibition</h1>
          <p className="text-muted-foreground">Update exhibition information and metadata</p>
        </div>
        <Button onClick={handleSave} className="bg-[#2B173F] hover:bg-[#1f1130] dark:bg-[#A193D7] dark:hover:bg-[#8b7ab8] dark:text-[#1a0e28]">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="media">Media & Video</TabsTrigger>
          <TabsTrigger value="metadata">Metadata & Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about the exhibition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Exhibition Name</Label>
                  <Input
                    id="name"
                    value={exhibition.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curator">Curator</Label>
                  <Input
                    id="curator"
                    value={exhibition.curator}
                    onChange={(e) => handleInputChange("curator", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={exhibition.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={exhibition.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ancient History">Ancient History</SelectItem>
                      <SelectItem value="Medieval Art">Medieval Art</SelectItem>
                      <SelectItem value="Renaissance">Renaissance</SelectItem>
                      <SelectItem value="Modern Art">Modern Art</SelectItem>
                      <SelectItem value="Science & Technology">Science & Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={exhibition.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={exhibition.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={exhibition.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={exhibition.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video & Media</CardTitle>
              <CardDescription>Manage exhibition video and media content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    value={exhibition.videoUrl}
                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              {exhibition.videoUrl && (
                <div className="space-y-2">
                  <Label>Video Preview</Label>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Play className="mx-auto h-16 w-16 mb-2" />
                        <p className="text-sm">Video Preview</p>
                        <p className="text-xs text-gray-400 mt-1">{exhibition.videoUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Additional Media</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop media files here, or click to browse
                  </p>
                  <Button variant="outline" className="mt-4">
                    Select Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add searchable tags to the exhibition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {exhibition.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pl-3 pr-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Metadata</CardTitle>
              <CardDescription>Additional key-value metadata for the exhibition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {exhibition.metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Key</p>
                        <p>{item.key}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Value</p>
                        <p>{item.value}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeMetadata(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Key"
                  value={newMetadataKey}
                  onChange={(e) => setNewMetadataKey(e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={newMetadataValue}
                  onChange={(e) => setNewMetadataValue(e.target.value)}
                />
              </div>
              <Button onClick={addMetadata} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Metadata
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
