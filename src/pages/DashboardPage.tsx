import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
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

interface DocType {
  createdBy: string;
  colleges: string[];
  totalDuration: number;
  validated: boolean;
  [key: string]: any;
}

interface AggregatedData {
  uid: string;
  name: string;
  totalDuration: number;
}

const COLORS = ["#0061feff", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];
const collections = [
  "tutoring",
  "academicadvising",
  "studyworkshop",
  "counseling",
  "psychologycounseling",
];

// Google API credentials
const CLIENT_ID =
  "262638998809-vtupmcq2o7biavf0dfq483v3ccv3sd62.apps.googleusercontent.com";
const API_KEY = "AIzaSyDtD5rRCHlMH7nnV1CGBh5gYaLPohRSyJo";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

const DashboardPage: React.FC = () => {
  const [adminCollege, setAdminCollege] = useState<string | null>(null);
  const [aggregated, setAggregated] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Fetch and group sessions by createdBy
  useEffect(() => {
    if (!adminCollege) return;

    const fetchAllCollections = async () => {
      try {
        setLoading(true);

        const fetchPromises = collections.map(async (col) => {
          const snapshot = await getDocs(collection(db, col));
          return snapshot.docs.map((d) => d.data() as DocType);
        });

        const results = await Promise.all(fetchPromises);
        const allDocs = results.flat();

        const filteredDocs = allDocs.filter(
          (doc) => doc.colleges?.includes(adminCollege) && doc.validated === true
        );

        const durationByCreator: Record<string, number> = {};
        filteredDocs.forEach((doc) => {
          if (doc.createdBy) {
            durationByCreator[doc.createdBy] =
              (durationByCreator[doc.createdBy] || 0) +
              (doc.totalDuration || 0);
          }
        });

        const usersSnapshot = await getDocs(collection(db, "users"));
        const uidNameMap: Record<string, string> = {};
        usersSnapshot.docs.forEach((userDoc) => {
          const data = userDoc.data();
          uidNameMap[userDoc.id] = data.name || userDoc.id;
        });

        const aggregatedData: AggregatedData[] = Object.entries(
          durationByCreator
        ).map(([uid, totalDuration]) => ({
          uid,
          name: uidNameMap[uid] || uid,
          totalDuration,
        }));

        setAggregated(aggregatedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setLoading(false);
      }
    };

    fetchAllCollections();
  }, [adminCollege]);

  // CSV Download
  const downloadCSV = () => {
    const headers = ["Name", "Total Duration"];
    const rows = aggregated.map((item) => [item.name, item.totalDuration]);
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

  // Google Sheets Download
  const downloadGoogleSheet = async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn();

      const spreadsheet = await gapi.client.sheets.spreadsheets.create({
        properties: { title: "Dashboard Data" },
      });

      const spreadsheetId = spreadsheet.result.spreadsheetId;
      const values = [
        ["Name", "Total Duration"],
        ...aggregated.map((a) => [a.name, a.totalDuration]),
      ];

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        resource: { values },
      });

      alert(`Spreadsheet created! ID: ${spreadsheetId}`);
    } catch (error) {
      console.error("Error creating Google Sheet:", error);
      alert("Failed to create Google Sheet. Check console.");
    }
  };

  if (loading || !adminCollege)
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
        Dashboard – Vishnu Institute of Technology
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
          onClick={downloadGoogleSheet}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowDownToLine className="mr-2 w-4 h-4" /> Export to Google Sheets
        </Button>
      </div>

      {/* Table */}
      <motion.div
        className="mt-10 overflow-x-auto bg-[hsl(60,100%,95%)] rounded-2xl shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <table className="w-full text-left border-collapse text-black">
          <thead>
            <tr className="bg-[hsl(60,100%,95%)] text-black">
              <th className="py-3 px-4 border-b border-gray-700">Name</th>
              <th className="py-3 px-4 border-b border-gray-700">
                Total Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {aggregated.map((item) => (
              <tr
                key={item.uid}
                className="hover:bg-[hsl(60,100%,95%)] transition duration-200"
              >
                <td className="py-3 px-4 border-b border-gray-700">
                  {item.name}
                </td>
                <td className="py-3 px-4 border-b border-gray-700">
                  {item.totalDuration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
