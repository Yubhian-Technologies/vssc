import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
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

// ✅ Tell TypeScript that window.gapi exists
declare global {
  interface Window {
    gapi: any;
  }
}

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
  const [gapiInitialized, setGapiInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Google API Initialization (Safe)
  useEffect(() => {
    const loadGapi = async () => {
      try {
        // Load the Google API script if not already loaded
        if (!window.gapi) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/api.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject("Failed to load Google API script.");
            document.body.appendChild(script);
          });
        }

        // Load the required modules
        await new Promise<void>((resolve) => {
          window.gapi.load("client:auth2", resolve);
        });

        // Initialize client
        await window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: SCOPES,
        });

        console.log("✅ Google API client initialized successfully.");
        setGapiInitialized(true);
      } catch (error) {
        console.error("❌ Error initializing Google API client:", error);
        setError("Failed to initialize Google API client.");
        setGapiInitialized(false);
      }
    };

    loadGapi();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        fetchAdminCollege(user.uid);
      } else {
        setError("No authenticated user found. Please sign in.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch admin's college
  const fetchAdminCollege = async (uid: string) => {
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        const college = userSnap.data().college;
        if (college) {
          setAdminCollege(college);
        } else {
          setError("User profile incomplete. Please ensure college is set.");
        }
      } else {
        setError("User profile not found. Please ensure your account is set up.");
      }
    } catch (error) {
      console.error("Error fetching admin college:", error);
      setError("Failed to fetch user profile.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch and group sessions by createdBy
  useEffect(() => {
    if (!adminCollege) return;

    const fetchAllCollections = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchPromises = collections.map(async (col) => {
          const snapshot = await getDocs(collection(db, col));
          return snapshot.docs
            .map((d) => {
              const data = d.data();
              if (
                !data.createdBy ||
                !Array.isArray(data.colleges) ||
                typeof data.totalDuration !== "number" ||
                isNaN(data.totalDuration) ||
                typeof data.validated !== "boolean"
              ) {
                return null;
              }
              return {
                ...data,
                collection: col,
                id: d.id,
                createdBy: data.createdBy as string,
                colleges: data.colleges as string[],
                totalDuration: data.totalDuration as number,
                validated: data.validated as boolean,
              } as DocType;
            })
            .filter((doc): doc is DocType => doc !== null);
        });

        const results = await Promise.all(fetchPromises);
        const allDocs = results.flat();

        const filteredDocs = allDocs.filter(
          (doc) =>
            doc.colleges.includes(adminCollege) &&
            doc.validated === true &&
            typeof doc.totalDuration === "number"
        );

        const durationByCreator: Record<string, number> = {};
        filteredDocs.forEach((doc) => {
          durationByCreator[doc.createdBy] =
            (durationByCreator[doc.createdBy] || 0) + doc.totalDuration;
        });

        const usersSnapshot = await getDocs(collection(db, "users"));
        const uidNameMap: Record<string, string> = {};
        usersSnapshot.docs.forEach((userDoc) => {
          const data = userDoc.data();
          uidNameMap[userDoc.id] = data.name || "Unknown User";
        });

        const aggregatedData: AggregatedData[] = Object.entries(
          durationByCreator
        )
          .map(([uid, totalDuration]) => {
            if (!uidNameMap[uid]) return null;
            return { uid, name: uidNameMap[uid], totalDuration };
          })
          .filter((item): item is AggregatedData => item !== null)
          .filter((item) => item.name !== "Unknown User");

        if (aggregatedData.length === 0) {
          setError("No valid session data found for your college.");
        }

        setAggregated(aggregatedData);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError("Failed to fetch session data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCollections();
  }, [adminCollege]);

  // CSV Download
  const downloadCSV = () => {
    if (aggregated.length === 0) {
      alert("No data available to download.");
      return;
    }
    const headers = ["Name", "Total Duration"];
    const rows = aggregated.map((item) => [item.name, item.totalDuration]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `dashboard_data_${adminCollege || "all"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Sheets Download
  const downloadGoogleSheet = async () => {
    try {
      if (!gapiInitialized) {
        alert("Google API not initialized yet. Please wait a moment.");
        return;
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const spreadsheet = await window.gapi.client.sheets.spreadsheets.create({
        properties: {
          title: `Dashboard Data ${adminCollege || "All"} ${new Date().toISOString()}`,
        },
      });

      const spreadsheetId = spreadsheet.result.spreadsheetId;
      const values = [
        ["Name", "Total Duration"],
        ...aggregated.map((a) => [a.name, a.totalDuration]),
      ];

      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A1:B${values.length}`,
        valueInputOption: "RAW",
        resource: { values },
      });

      alert(
        `✅ Spreadsheet created: https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      );
    } catch (error: any) {
      console.error("Error exporting to Google Sheets:", error);
      alert(`Failed to export to Google Sheets: ${error.message}`);
    }
  };

  // UI Rendering
  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-lg text-gray-400">
        Loading dashboard data...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[80vh] text-lg text-red-600">
        Error: {error}
      </div>
    );

  if (!adminCollege)
    return (
      <div className="flex justify-center items-center h-[80vh] text-lg text-red-600">
        Error: Unable to determine admin college.
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
        Dashboard – {adminCollege}
      </motion.h2>

      {/* Summary Cards */}
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
              Total Duration (minutes)
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
              {aggregated.length > 0
                ? (totalDurationSum / aggregated.length).toFixed(1)
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {aggregated.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              className="bg-[hsl(60,100%,95%)] rounded-2xl shadow-lg p-5"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="text-blue-400" />
                <h3 className="text-xl font-semibold">Distribution</h3>
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
                    {aggregated.map((_, index) => (
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
                <BarChart3 className="text-green-400" />
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

          <motion.div
            className="mt-10 bg-[hsl(60,100%,95%)] rounded-2xl shadow-lg p-5"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <LineChartIcon className="text-purple-400" />
              <h3 className="text-xl font-semibold">Trend (Line Chart)</h3>
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
        </>
      )}

      {/* Download Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button
          onClick={downloadCSV}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={aggregated.length === 0}
        >
          <ArrowDownToLine className="mr-2 w-4 h-4" /> Download CSV
        </Button>
        <Button
          onClick={downloadGoogleSheet}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!gapiInitialized || aggregated.length === 0}
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
                Total Duration (minutes)
              </th>
            </tr>
          </thead>
          <tbody>
            {aggregated.length > 0 ? (
              aggregated.map((item) => (
                <tr
                  key={item.uid}
                  className="hover:bg-[hsl(60,100%,90%)] transition duration-200"
                >
                  <td className="py-3 px-4 border-b border-gray-700">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-700">
                    {item.totalDuration}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="py-3 px-4 text-center text-gray-600"
                >
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
