import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Search, Filter, Eye, Edit2, ChevronLeft, ChevronRight } from "lucide-react";

interface Exhibit {
  id: number;
  name: string;
  exhibition: string;
  category: string;
  era: string;
  status: "active" | "archived" | "maintenance";
  dateAdded: string;
  views: number;
}

const mockExhibits: Exhibit[] = [
  { id: 1, name: "Caesar's Bust", exhibition: "Ancient Rome", category: "Sculpture", era: "Roman Empire", status: "active", dateAdded: "2024-01-15", views: 2456 },
  { id: 2, name: "The Colosseum Model", exhibition: "Ancient Rome", category: "Architecture", era: "Roman Empire", status: "active", dateAdded: "2024-02-20", views: 3210 },
  { id: 3, name: "Medieval Crown", exhibition: "Medieval Art", category: "Artifact", era: "Middle Ages", status: "active", dateAdded: "2023-11-05", views: 1890 },
  { id: 4, name: "Renaissance Painting", exhibition: "Renaissance Masters", category: "Painting", era: "Renaissance", status: "maintenance", dateAdded: "2024-03-12", views: 4521 },
  { id: 5, name: "Viking Sword", exhibition: "Nordic History", category: "Weapon", era: "Viking Age", status: "active", dateAdded: "2024-01-28", views: 2102 },
  { id: 6, name: "Egyptian Sarcophagus", exhibition: "Ancient Egypt", category: "Artifact", era: "Ancient Egypt", status: "active", dateAdded: "2023-09-14", views: 5634 },
  { id: 7, name: "Greek Amphora", exhibition: "Ancient Greece", category: "Pottery", era: "Ancient Greece", status: "active", dateAdded: "2024-02-01", views: 1567 },
  { id: 8, name: "Samurai Armor", exhibition: "Japanese History", category: "Armor", era: "Feudal Japan", status: "archived", dateAdded: "2023-07-22", views: 3456 },
  { id: 9, name: "Leonardo's Sketch", exhibition: "Renaissance Masters", category: "Drawing", era: "Renaissance", status: "active", dateAdded: "2024-04-05", views: 6789 },
  { id: 10, name: "Byzantine Mosaic", exhibition: "Byzantine Empire", category: "Art", era: "Byzantine", status: "active", dateAdded: "2024-01-10", views: 2234 },
];

const exhibitions = ["All Exhibitions", "Ancient Rome", "Medieval Art", "Renaissance Masters", "Nordic History", "Ancient Egypt", "Ancient Greece", "Japanese History", "Byzantine Empire"];
const categories = ["All Categories", "Sculpture", "Architecture", "Artifact", "Painting", "Weapon", "Pottery", "Armor", "Drawing", "Art"];
const eras = ["All Eras", "Roman Empire", "Middle Ages", "Renaissance", "Viking Age", "Ancient Egypt", "Ancient Greece", "Feudal Japan", "Byzantine"];
const statuses = ["All Statuses", "active", "archived", "maintenance"];

export function ExhibitsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExhibition, setSelectedExhibition] = useState("All Exhibitions");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedEra, setSelectedEra] = useState("All Eras");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredExhibits = mockExhibits.filter((exhibit) => {
    const matchesSearch = exhibit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exhibit.exhibition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExhibition = selectedExhibition === "All Exhibitions" || exhibit.exhibition === selectedExhibition;
    const matchesCategory = selectedCategory === "All Categories" || exhibit.category === selectedCategory;
    const matchesEra = selectedEra === "All Eras" || exhibit.era === selectedEra;
    const matchesStatus = selectedStatus === "All Statuses" || exhibit.status === selectedStatus;

    return matchesSearch && matchesExhibition && matchesCategory && matchesEra && matchesStatus;
  });

  const totalPages = Math.ceil(filteredExhibits.length / itemsPerPage);
  const paginatedExhibits = filteredExhibits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Exhibits Management</h1>
        <p className="text-muted-foreground">Browse and manage all museum exhibits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter exhibits by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exhibits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedExhibition} onValueChange={setSelectedExhibition}>
              <SelectTrigger>
                <SelectValue placeholder="Exhibition" />
              </SelectTrigger>
              <SelectContent>
                {exhibitions.map((exhibition) => (
                  <SelectItem key={exhibition} value={exhibition}>
                    {exhibition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedEra} onValueChange={setSelectedEra}>
              <SelectTrigger>
                <SelectValue placeholder="Era" />
              </SelectTrigger>
              <SelectContent>
                {eras.map((era) => (
                  <SelectItem key={era} value={era}>
                    {era}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Exhibits</CardTitle>
              <CardDescription>
                Showing {filteredExhibits.length} of {mockExhibits.length} exhibits
              </CardDescription>
            </div>
            <Button className="bg-[#2B173F] hover:bg-[#1f1130] dark:bg-[#A193D7] dark:hover:bg-[#8b7ab8] dark:text-[#1a0e28]">
              <Filter className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Exhibition</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Era</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExhibits.length > 0 ? (
                  paginatedExhibits.map((exhibit) => (
                    <TableRow key={exhibit.id}>
                      <TableCell>{exhibit.name}</TableCell>
                      <TableCell>{exhibit.exhibition}</TableCell>
                      <TableCell>{exhibit.category}</TableCell>
                      <TableCell>{exhibit.era}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(exhibit.status)}>
                          {exhibit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(exhibit.dateAdded).toLocaleDateString()}</TableCell>
                      <TableCell>{exhibit.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No exhibits found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredExhibits.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredExhibits.length)} of {filteredExhibits.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-[#2B173F] hover:bg-[#1f1130] dark:bg-[#A193D7] dark:hover:bg-[#8b7ab8] dark:text-[#1a0e28]"
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
