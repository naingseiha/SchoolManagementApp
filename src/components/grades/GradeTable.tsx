import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Loader2 } from "lucide-react";
import axios from "axios";
import GradeImportDialog from "./GradeImportDialog";

interface GradeTableProps {
  classId: string;
  className: string;
}

interface StudentSummary {
  id: string;
  student: {
    id: string;
    khmerName: string;
    firstName: string;
    lastName: string;
    gender: string;
  };
  totalScore: number;
  totalMaxScore: number;
  average: number;
  classRank: number;
  gradeLevel: string;
}

const MONTHS = [
  { value: "មករា", label: "មករា (January)" },
  { value: "កុម្ភៈ", label: "កុម្ភៈ (February)" },
  { value: "មីនា", label: "មីនា (March)" },
  { value: "មេសា", label: "មេសា (April)" },
  { value: "ឧសភា", label: "ឧសភា (May)" },
  { value: "មិថុនា", label: "មិថុនា (June)" },
  { value: "កក្កដា", label: "កក្កដា (July)" },
  { value: "សីហា", label: "សីហា (August)" },
  { value: "កញ្ញា", label: "កញ្ញា (September)" },
  { value: "តុលា", label: "តុលា (October)" },
  { value: "វិច្ឆិកា", label: "វិច្ឆិកា (November)" },
  { value: "ធ្នូ", label: "ធ្នូ (December)" },
];

export default function GradeTable({ classId, className }: GradeTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("មករា");
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [summaries, setSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const fetchGradeSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5001/api/grades/summary/${classId}`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
        }
      );
      setSummaries(response.data.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId && selectedMonth && selectedYear) {
      fetchGradeSummary();
    }
  }, [classId, selectedMonth, selectedYear]);

  const getGradeLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      A: "bg-green-500",
      "B+": "bg-blue-500",
      B: "bg-cyan-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      E: "bg-red-400",
      F: "bg-red-600",
    };
    return colors[level] || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            ពិន្ទុប្រចាំខែ • {className}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setImportDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              នាំចូលពិន្ទុ
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              នាំចេញ
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">ខែ:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើសខែ" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">ឆ្នាំ:</label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(val) => setSelectedYear(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើសឆ្នាំ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Table */}
        {!loading && summaries.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 text-center">ល.រ</TableHead>
                  <TableHead>គោត្តនាម.នាម</TableHead>
                  <TableHead className="text-center">ភេទ</TableHead>
                  <TableHead className="text-center">ពិន្ទុសរុប</TableHead>
                  <TableHead className="text-center">មធ្យមភាគ</TableHead>
                  <TableHead className="text-center">ចំ.ថ្នាក់</TableHead>
                  <TableHead className="text-center">និទ្ទេស</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((summary, index) => (
                  <TableRow key={summary.id}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {summary.student.khmerName ||
                        `${summary.student.lastName} ${summary.student.firstName}`}
                    </TableCell>
                    <TableCell className="text-center">
                      {summary.student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
                    </TableCell>
                    <TableCell className="text-center">
                      {summary.totalScore.toFixed(2)} /{" "}
                      {summary.totalMaxScore.toFixed(0)}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {summary.average.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{summary.classRank}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`${getGradeLevelColor(
                          summary.gradeLevel
                        )} text-white`}
                      >
                        {summary.gradeLevel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty State */}
        {!loading && summaries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileSpreadsheet className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>មិនមានទិន្នន័យពិន្ទុសម្រាប់ខែនេះ</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              នាំចូលពិន្ទុ
            </Button>
          </div>
        )}
      </CardContent>

      {/* Import Dialog */}
      <GradeImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        classId={classId}
        className={className}
        onSuccess={fetchGradeSummary}
      />
    </Card>
  );
}
