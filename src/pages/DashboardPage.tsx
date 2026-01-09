import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, onSnapshot } from "firebase/firestore";
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
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  Sparkles,
  CalendarHeart,
  Users,
  Trophy,
  Heart,
  Star,
  Flower2,
  Zap,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAdminDataAutoRefresh } from "@/hooks/usePageAutoRefresh";
import { format } from "date-fns";


const SERVICE_COLORS = [ "#f0150a","#660af0", "#dd02fa", "#02f1fa","#18f060", "#f0d90a"];
const EVENT_COLORS = ["#18f060", "#f0150a","#dd02fa", "#02f1fa", "#660af0", "#f0d90a"];

const CATEGORY_NAMES: Record<string, string> = {
  nemo_events: "Finding Nemo",
  incredibles_events: "The Incredibles",
  insideout_events: "Inside Out",
  pursuit_events: "Pursuit of Happiness",
  hiddenfigures_events: "Hidden Figures",
  happyfeet_events: "Happy Feet",
};

const CLIENT_ID = "262638998809-vtupmcq2o7biavf0dfq483v3cc62.apps.googleusercontent.com";
const API_KEY = "AIzaSyDtD5rRCHlMH7nnV1CGBh5gYaLPohRSyJo";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

const DashboardPage: React.FC = () => {
  const [adminCollege, setAdminCollege] = useState<string | null>(null);
  const { data: aggregated, isLoading } = useDashboardData(adminCollege);
  useAdminDataAutoRefresh(adminCollege || undefined);

  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [aggregatedEvents, setAggregatedEvents] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    activeEvents: 0,
  });

  // New states for showing only 5 rows initially
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    const initClient = () => {
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            scope: SCOPES,
          })
          .then(() => {
            // Initialization successful – you can add sign-in logic here if needed
          })
          .catch((error: any) => {
            console.error("Error initializing gapi client:", error);
          });
      });
    };
    initClient();
  }, []);

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
      }
    } catch (error) {
      console.error("Error fetching admin college:", error);
    }
  };

  useEffect(() => {
    const eventCollections = Object.keys(CATEGORY_NAMES);
    const unsubscribers: (() => void)[] = [];

    eventCollections.forEach((coll) => {
      const q = query(collection(db, coll));
      const unsub = onSnapshot(q, (snap) => {
        const events = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          category: CATEGORY_NAMES[coll],
          expired: new Date(`${d.data().eventDate}T${d.data().eventTime}:00`) < new Date(),
        }));

        setAllEvents((prev) => {
          const filtered = prev.filter((e) => e.category !== CATEGORY_NAMES[coll]);
          return [...filtered, ...events];
        });
      });
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((u) => u());
  }, []);

  useEffect(() => {
    const totalEvents = allEvents.length;
    const totalRegistrations = allEvents.reduce((sum, e) => sum + (e.filledSlots || 0), 0);
    const activeEvents = allEvents.filter((e) => !e.expired).length;

    setAggregatedEvents({
      totalEvents,
      totalRegistrations,
      activeEvents,
    });
  }, [allEvents]);

  const servicesPieData = aggregated.map((item, index) => ({
    name: item.name.length > 15 ? item.name.slice(0, 12) + "..." : item.name,
    value: item.totalDuration,
    fullName: item.name,
  }));

  const eventsByCategory = Object.entries(
    allEvents.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, count]) => ({ category, count }));

  const downloadServicesCSV = () => {
    const headers = ["Name", "Session Count", "Total Duration", "Skills"];
    const rows = aggregated.map((item) => [
      item.name,
      item.sessionCount,
      item.totalDuration,
      item.skills.join("; "),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "services_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadServicesExcel = () => {
    const data = aggregated.map((item) => ({
      Name: item.name,
      "Session Count": item.sessionCount,
      "Total Duration": item.totalDuration,
      Skills: item.skills.length > 0 ? item.skills.join(", ") : "No skills listed",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Services Data");
    worksheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 50 }];
    XLSX.writeFile(workbook, "services_data.xlsx");
  };

 const downloadEventsExcel = () => {
  const data = allEvents.map((e) => ({
    Category: e.category,
    "Event Name": e.name,
    Date: format(new Date(e.eventDate), "dd/MM/yyyy"), 
    Time: e.eventTime || "",
    Venue: e.venue || "",
    "Slots Filled": e.filledSlots || 0,
    "Total Slots": e.slots || 0,
    Status: e.expired ? "Expired" : "Active",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

 
  worksheet["!cols"] = [
    { wch: 20 }, 
    { wch: 35 }, 
    { wch: 15 },
    { wch: 12 },
    { wch: 30 }, 
    { wch: 15 },
    { wch: 15 }, 
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Events Data");
  XLSX.writeFile(workbook, "events_data.xlsx");
};

  if (isLoading || !adminCollege)
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-6">
        
        <p className="text-2xl text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    );

  const totalDurationSum = aggregated.reduce((sum, item) => sum + item.totalDuration, 0);

  // Sliced data for tables
  const displayedServices = showAllServices ? aggregated : aggregated.slice(0, 5);
  const displayedEvents = showAllEvents ? allEvents : allEvents.slice(0, 5);

  return (
    <motion.div
      className="p-4 md:p-8 min-h-screen bg-[hsl(60,100%,95%)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary"
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {adminCollege} Dashboard 
      </motion.h1>

      {/* Compact Cute Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <motion.div whileHover={{ scale: 1.1, rotate: 2 }}>
          <Card className="bg-white/80 backdrop-blur-md border-pink-200 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-md text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-pink-600">{aggregated.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1, rotate: -2 }}>
          <Card className="bg-white/80 backdrop-blur-md border-purple-200 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-md text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-purple-600">{totalDurationSum}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1, rotate: 2 }}>
          <Card className="bg-white/80 backdrop-blur-md border-blue-200 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-md text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-blue-600">{aggregatedEvents.totalEvents}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1, rotate: -2 }}>
          <Card className="bg-white/80 backdrop-blur-md border-green-200 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-md text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">{aggregatedEvents.activeEvents}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1, rotate: 2 }}>
          <Card className="bg-white/80 backdrop-blur-md border-yellow-200 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-md text-gray-600">Registrations</p>
              <p className="text-2xl font-bold text-yellow-600">{aggregatedEvents.totalRegistrations}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1, rotate: -2 }}>
          <Card className="bg-white/80 backdrop-blur-md border-orange-200 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-md text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-orange-600">
                {(totalDurationSum / (aggregated.length || 1)).toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cute Pie Charts Side by Side */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div
          className="bg-white/90 rounded-3xl shadow-2xl p-6 backdrop-blur-md"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-primary">Services</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={servicesPieData}
                dataKey="value"
                nameKey="fullName"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={5}
                label={({ name }) => name}
              >
                {servicesPieData.map((entry, index) => (
                  <Cell key={index} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.95)" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="bg-white/90 rounded-3xl shadow-2xl p-6 backdrop-blur-md"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-primary">Events</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventsByCategory}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={5}
                label
              >
                {eventsByCategory.map((entry, index) => (
                  <Cell key={index} fill={EVENT_COLORS[index % EVENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.95)" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Services Section - Compact */}
      <motion.div className="mb-12" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Services Overview </h2>
        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={downloadServicesExcel} className="bg-primary hover:bg-blue-800 text-white shadow-lg">
            Download Excel
          </Button>
        </div>

        <div className="overflow-x-auto shadow-2xl bg-white/90 backdrop-blur-md rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-primary to-blue-800 text-white">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Sessions</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Skills</th>
              </tr>
            </thead>
            <tbody>
              {displayedServices.map((item) => (
                <tr key={item.uid} className="hover:bg-pink-50/60 transition">
                  <td className="py-3 px-4 font-medium text-primary">{item.name}</td>
                  <td className="py-3 px-4 text-center">{item.sessionCount}</td>
                  <td className="py-3 px-4 text-center font-bold">{item.totalDuration}</td>
                  <td className="py-3 px-4 text-sm">{item.skills.length > 0 ? item.skills.join(", ") : "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {aggregated.length > 5 && (
            <div className="p-4 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAllServices(!showAllServices)}
                className="bg-white/80 hover:bg-pink-100"
              >
                {showAllServices ? "Show Less" : "See More"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Events Section - Compact */}
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Events Overview</h2>
        <div className="flex justify-center mb-6">
          <Button onClick={downloadEventsExcel} className="bg-primary hover:bg-blue-800 text-white shadow-lg">
  Download Excel
</Button>
        </div>

        <div className="overflow-x-auto shadow-2xl bg-white/90 backdrop-blur-md rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-primary to-blue-800 text-white">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Slots</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-purple-50/60 transition">
                  <td className="py-3 px-4 text-primary font-medium">{event.category}</td>
                  <td className="py-3 px-4">{event.name}</td>
                  <td className="py-3 px-4 text-center text-sm">
                    {format(new Date(event.eventDate), "dd MMM")} <br /> {event.eventTime}
                  </td>
                  <td className="py-3 px-4">{event.venue}</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-600">
                    {event.filledSlots || 0}/{event.slots || 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs ${event.expired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      {event.expired ? "Expired" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allEvents.length > 5 && (
            <div className="p-4 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAllEvents(!showAllEvents)}
                className="bg-white/80 hover:bg-purple-100"
              >
                {showAllEvents ? "Show Less" : "See More"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;