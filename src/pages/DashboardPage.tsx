import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { gapi } from "gapi-script";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useDashboardData, AggregatedData } from "@/hooks/useDashboardData";
import { useAdminDataAutoRefresh } from "@/hooks/usePageAutoRefresh";

const COLORS = ["#0061feff", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

// Google API credentials
const CLIENT_ID =
  "262638998809-vtupmcq2o7biavf0dfq483v3ccv3sd62.apps.googleusercontent.com";
const API_KEY = "AIzaSyDtD5rRCHlMH7nnV1CGBh5gYaLPohRSyJo";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

const DashboardPage: React.FC = () => {
  const [adminCollege, setAdminCollege] = useState<string | null>(null);
  const { data: aggregated, isLoading } = useDashboardData(adminCollege);
  
  // Enable auto-refresh for admin data
  useAdminDataAutoRefresh(adminCollege || undefined);

  // Initialize Google API
  useEffect(() => {
    const initClient = () => {
      gapi.load("client:auth2", () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: SCOPES,
        });
      });
    };
    initClient();
  }, []);

  // Listen to auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) fetchAdminCollege(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminCollege = async (uid: string) => {
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        setAdminCollege(userSnap.data().college);
      } else {
        console.error("No user found with UID:", uid);
      }
    } catch (error) {
      console.error("Error fetching admin college:", error);
    }
  };

  // Fetch and group sessions by createdBy - now handled by the hook
  // The useDashboardData hook automatically refreshes data

  // CSV Download
  const downloadCSV = () => {
    const headers = ["Name", "Session Count", "Total Duration", "Skills"];
    const rows = aggregated.map((item) => [
      item.name,
      item.sessionCount,
      item.totalDuration,
      item.skills.join("; "),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "dashboard_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // NEW: Excel Download (XLSX) – NO API KEYS, PURE CLIENT-SIDE
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  const downloadExcel = () => {
    const data = aggregated.map((item) => ({
      Name: item.name,
      "Session Count": item.sessionCount,
      "Total Duration": item.totalDuration,
      Skills:
        item.skills.length > 0 ? item.skills.join(", ") : "No skills listed",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Data");

    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // Name
      { wch: 15 }, // Session Count
      { wch: 15 }, // Total Duration
      { wch: 40 }, // Skills
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "dashboard_data.xlsx");
  };
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  if (isLoading || !adminCollege)
    return (
      <div className="flex justify-center items-center h-[80vh] text-lg text-gray-400">
        Loading dashboard data...
      </div>
    );

  const totalDurationSum = aggregated.reduce(
    (sum, item) => sum + item.totalDuration,
    0
  );

  return (
    <motion.div
      className="p-8 min-h-screen bg-[hsl(60,100%,85%)] text-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-3xl font-bold mb-8 text-center text-blue-900"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Dashboard – {adminCollege || "Loading..."}
      </motion.h2>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-[hsl(60,100%,95%)] border-none shadow-xl">
          <CardContent className="p-5 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold mt-2">{aggregated.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(60,100%,95%)] border-none shadow-xl">
          <CardContent className="p-5 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Duration
            </h3>
            <p className="text-3xl font-bold mt-2">{totalDurationSum}</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(60,100%,95%)] border-none shadow-xl">
          <CardContent className="p-5 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Average Duration / User
            </h3>
            <p className="text-3xl font-bold mt-2">
              {(totalDurationSum / aggregated.length).toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-10">
        <motion.div
          className="bg-[hsl(60,100%,95%)] rounded-2xl shadow-lg p-5"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="text-blue-400" />{" "}
            <h3 className="text-xl font-semibold">Distribution (Pie Chart)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={aggregated}
                dataKey="totalDuration"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {aggregated.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="bg-[hsl(60,100%,95%)] rounded-2xl shadow-lg p-5"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-green-400" />{" "}
            <h3 className="text-xl font-semibold">Bar Chart</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregated}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalDuration" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Line Chart */}
      <motion.div
        className="mt-10 bg-[hsl(60,100%,95%)] rounded-2xl shadow-lg p-5"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <LineChartIcon className="text-purple-400" />{" "}
          <h3 className="text-xl font-semibold">Trend Analysis (Line Chart)</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aggregated}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalDuration"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Download Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button
          onClick={downloadCSV}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <ArrowDownToLine className="mr-2 w-4 h-4" /> Download CSV
        </Button>
        <Button
          onClick={downloadExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowDownToLine className="mr-2 w-4 h-4" /> Download Excel
        </Button>
      </div>

      {/* Table */}
      <motion.div
        className="mt-10 overflow-x-auto bg-[hsl(60,100%,95%)] rounded-2xl shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="overflow-x-auto w-full">
          <table className="w-full table-fixed border-collapse text-black text-center">
            <thead>
              <tr className="bg-[hsl(60,100%,95%)] text-black">
                <th className="w-1/4 py-3 px-4 border-b border-gray-700">
                  Name
                </th>
                <th className="w-1/4 py-3 px-4 border-b border-gray-700">
                  Session Count
                </th>
                <th className="w-1/4 py-3 px-4 border-b border-gray-700">
                  Total Duration
                </th>
                <th className="w-1/4 py-3 px-4 border-b border-gray-700">
                  Skills Taught
                </th>
              </tr>
            </thead>
            <tbody>
              {aggregated.map((item) => (
                <tr
                  key={item.uid}
                  className="hover:bg-[hsl(60,100%,95%)] transition duration-200"
                >
                  <td className="py-3 px-4 border-b border-gray-700 break-words">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-700">
                    {item.sessionCount}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-700">
                    {item.totalDuration}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-700 break-words">
                    {item.skills.length > 0
                      ? item.skills.join(", ")
                      : "No skills listed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
