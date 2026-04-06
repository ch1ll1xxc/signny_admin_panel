import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Plus, Search, Edit2, Trash2, Eye, Calendar, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Exhibition {
  id: number;
  name: string;
  curator: string;
  category: string;
  status: "active" | "scheduled" | "archived" | "maintenance";
  startDate: string;
  endDate: string;
  visitors: number;
  exhibits: number;
  description: string;
}

const mockExhibitions: Exhibition[] = [
  {
    id: 1,
    name: "Ancient Rome: City of the Caesars",
    curator: "Dr. Marcus Aurelius",
    category: "Ancient History",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    visitors: 12340,
    exhibits: 87,
    description: "Explore the grandeur of Ancient Rome",
  },
  {
    id: 2,
    name: "Medieval Art & Architecture",
    curator: "Prof. Eleanor Stone",
    category: "Medieval Art",
    status: "active",
    startDate: "2024-03-01",
    endDate: "2024-08-31",
    visitors: 8950,
    exhibits: 64,
    description: "Journey through medieval masterpieces",
  },
  {
    id: 3,
    name: "Renaissance Masters",
    curator: "Dr. Sofia Martinez",
    category: "Renaissance",
    status: "maintenance",
    startDate: "2023-10-01",
    endDate: "2024-06-30",
    visitors: 15678,
    exhibits: 92,
    description: "Works from the greatest Renaissance artists",
  },
  {
    id: 4,
    name: "Viking Age: Warriors & Traders",
    curator: "Dr. Erik Nordmann",
    category: "Nordic History",
    status: "scheduled",
    startDate: "2026-04-01",
    endDate: "2026-10-31",
    visitors: 0,
    exhibits: 73,
    description: "Discover the world of the Vikings",
  },
  {
    id: 5,
    name: "Ancient Egypt: Land of Pharaohs",
    curator: "Dr. Amira Hassan",
    category: "Ancient History",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    visitors: 18234,
    exhibits: 105,
    description: "Uncover the mysteries of Ancient Egypt",
  },
  {
    id: 6,
    name: "Impressionist Revolution",
    curator: "Prof. Jean Dubois",
    category: "Modern Art",
    status: "archived",
    startDate: "2023-05-01",
    endDate: "2023-11-30",
    visitors: 22456,
    exhibits: 58,
    description: "The birth of Impressionism",
  },
];

export function ExhibitionManagement() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(mockExhibitions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExhibition, setNewExhibition] = useState({
    name: "",
    curator: "",
    category: "Ancient History",
    status: "scheduled" as const,
    startDate: "",
    endDate: "",
    description: "",
  });

  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const matchesSearch =
      exhibition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exhibition.curator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || exhibition.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddExhibition = () => {
    const exhibition: Exhibition = {
      id: Math.max(...exhibitions.map((e) => e.id)) + 1,
      ...newExhibition,
      visitors: 0,
      exhibits: 0,
    };
    setExhibitions([...exhibitions, exhibition]);
    setIsAddDialogOpen(false);
    setNewExhibition({
      name: "",
      curator: "",
      category: "Ancient History",
      status: "scheduled",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const handleDeleteExhibition = (id: number) => {
    if (confirm("Are you sure you want to delete this exhibition?")) {
      setExhibitions(exhibitions.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Exhibition Management</h1>
          <p className="text-muted-foreground">Manage all museum exhibitions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2B173F] hover:bg-[#1f1130] dark:bg-[#A193D7] dark:hover:bg-[#8b7ab8] dark:text-[#1a0e28]">
              <Plus className="mr-2 h-4 w-4" />
              Add Exhibition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Exhibition</DialogTitle>
              <DialogDescription>Add a new exhibition to the museum</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Exhibition Name</Label>
                <Input
                  id="name"
                  value={newExhibition.name}
                  onChange={(e) => setNewExhibition({ ...newExhibition, name: e.target.value })}
                  placeholder="Enter exhibition name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="curator">Curator</Label>
                  <Input
                    id="curator"
                    value={newExhibition.curator}
                    onChange={(e) => setNewExhibition({ ...newExhibition, curator: e.target.value })}
                    placeholder="Curator name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExhibition.category}
                    onValueChange={(value) => setNewExhibition({ ...newExhibition, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ancient History">Ancient History</SelectItem>
                      <SelectItem value="Medieval Art">Medieval Art</SelectItem>
                      <SelectItem value="Renaissance">Renaissance</SelectItem>
                      <SelectItem value="Modern Art">Modern Art</SelectItem>
                      <SelectItem value="Nordic History">Nordic History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newExhibition.startDate}
                    onChange={(e) => setNewExhibition({ ...newExhibition, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newExhibition.endDate}
                    onChange={(e) => setNewExhibition({ ...newExhibition, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExhibition.description}
                  onChange={(e) => setNewExhibition({ ...newExhibition, description: e.target.value })}
                  placeholder="Enter exhibition description"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddExhibition} className="w-full bg-[#2B173F] hover:bg-[#1f1130] dark:bg-[#A193D7] dark:hover:bg-[#8b7ab8] dark:text-[#1a0e28]">
                Create Exhibition
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exhibitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExhibitions.map((exhibition) => (
          <Card key={exhibition.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{exhibition.name}</CardTitle>
                  <CardDescription>{exhibition.curator}</CardDescription>
                </div>
                <Badge variant="secondary" className={getStatusColor(exhibition.status)}>
                  {exhibition.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{exhibition.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Visitors
                  </p>
                  <p>{exhibition.visitors.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Exhibits
                  </p>
                  <p>{exhibition.exhibits}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Duration</p>
                <p>
                  {new Date(exhibition.startDate).toLocaleDateString()} -{" "}
                  {new Date(exhibition.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteExhibition(exhibition.id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExhibitions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No exhibitions found matching your criteria
          </CardContent>
        </Card>
      )}
    </div>
  );
}
