import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError } from "@/components/ui/sonner";
import { auth, db } from "../firebase";
import event3 from "@/assets/event3.png";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";
import { Plus, Edit, Users, Calendar, Clock, MoreVertical, Trash2 } from "lucide-react";
import { uploadToCloudinary } from "../utils/cloudinary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as ExcelJS from "exceljs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// === PAGE‑SPECIFIC CONFIG ===
const PAGE_NAME = "HappyFeet";
const EVENTS_COLLECTION = "happyfeet_events";
const REGISTRATIONS_COLLECTION = "eventRegistrations";

interface Event {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  eventDate: string;
  eventTime: string;
  createdAt: any;
  createdBy: string;
  college?: string;
}

interface Registration {
  id: string;
  userId: string;
  name: string;
  email: string;
  profileUrl?: string;
}

const HappyFeetPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [userCollege, setUserCollege] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  // Admin+ filter
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [availableColleges, setAvailableColleges] = useState<string[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Forms
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventTime: "",
    image: null as File | null,
  });
  const [editForm, setEditForm] = useState({ eventDate: "", eventTime: "" });

  /* -------------------------- IST TIME HELPERS --------------------------- */
  const getISTNow = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  };

  /* -------------------------- AUTH & ROLE --------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setCurrentUser(user);
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserRole(data.role || "student");
          setUserCollege(data.college || "");
          setUserName(data.name || user.displayName || "Student");

          // Default filter for admin+
          if (data.role === "admin+") {
            setSelectedCollege(data.college || "All colleges");
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole("student");
        setUserCollege("");
        setUserName("");
        setSelectedCollege("");
        setAvailableColleges([]);
      }
    });
    return () => unsub();
  }, []);

  /* --------------------- COLLEGES FOR FILTER ---------------------- */
  useEffect(() => {
    if (userRole !== "admin+") return;

    const q = query(collection(db, EVENTS_COLLECTION));
    const unsub = onSnapshot(q, (snap) => {
      const colleges = new Set<string>();
      snap.forEach((d) => {
        const data = d.data();
        if (data.college) colleges.add(data.college);
      });
      const list = Array.from(colleges).sort();
      setAvailableColleges(["All colleges", ...list]);
    });
    return () => unsub();
  }, [userRole]);

  /* --------------------- PAGE‑SPECIFIC EVENTS ---------------------- */
  useEffect(() => {
    let q: any;

    if (userRole === "admin+" && selectedCollege && selectedCollege !== "All colleges") {
      q = query(
        collection(db, EVENTS_COLLECTION),
        where("college", "==", selectedCollege)
      );
    } else if (userRole === "admin+") {
      q = query(collection(db, EVENTS_COLLECTION));
    } else if (userRole === "admin") {
      q = query(collection(db, EVENTS_COLLECTION), where("createdBy", "==", currentUser.uid));
    } else if (userRole === "student" && currentUser) {
      q = query(collection(db, EVENTS_COLLECTION), where("college", "==", userCollege));
    } else {
      q = query(collection(db, EVENTS_COLLECTION));
    }

    const unsub = onSnapshot(q, (snap) => {
      const list: Event[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Event));
      setEvents(list);
    });
    return () => unsub();
  }, [currentUser, userRole, userCollege, selectedCollege]);

  /* ----------------- PAGE‑SPECIFIC REGISTRATIONS ------------------- */
  useEffect(() => {
    if (!currentUser) {
      setRegistrations(new Set());
      return;
    }
    const q = query(
      collection(db, REGISTRATIONS_COLLECTION),
      where("userId", "==", currentUser.uid),
      where("pageName", "==", PAGE_NAME)
    );
    const unsub = onSnapshot(q, (snap) => {
      const reg = new Set<string>();
      snap.forEach((d) => reg.add(d.data().eventId));
      setRegistrations(reg);
    });
    return () => unsub();
  }, [currentUser]);

  /* ------------------------------- HELPERS ------------------------- */
  const isExpired = (date: string, time: string) => {
    const dt = new Date(`${date}T${time}:00`);
    return dt < getISTNow();
  };

  const isAfterOriginal = (
    newDate: string,
    newTime: string,
    origDate: string,
    origTime: string
  ) => {
    const newDt = new Date(`${newDate}T${newTime}:00`);
    const origDt = new Date(`${origDate}T${origTime}:00`);
    return newDt >= origDt && newDt >= getISTNow();
  };

  /* ----------------------------- ADD EVENT ------------------------- */
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || userRole !== "admin") return;
    if (!addForm.image) return toastError("Please select an image");

    const eventDt = new Date(`${addForm.eventDate}T${addForm.eventTime}:00`);
    if (eventDt <= getISTNow()) {
      return toastError("Event date & time must be in the future (IST)");
    }

    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary(addForm.image);
      await addDoc(collection(db, EVENTS_COLLECTION), {
        name: addForm.name,
        description: addForm.description,
        imageUrl,
        eventDate: addForm.eventDate,
        eventTime: addForm.eventTime,
        createdBy: currentUser.uid,
        college: userCollege,
        createdAt: serverTimestamp(),
      });
      toastSuccess("Event added successfully!");
      setShowAddModal(false);
      setAddForm({ name: "", description: "", eventDate: "", eventTime: "", image: null });
    } catch (err: any) {
      toastError(err.message || "Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- EDIT EVENT ------------------------ */
  const openEdit = (ev: Event) => {
    setSelectedEvent(ev);
    setEditForm({ eventDate: ev.eventDate, eventTime: ev.eventTime });
    setShowEditModal(true);
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || userRole !== "admin") return;

    if (
      !isAfterOriginal(
        editForm.eventDate,
        editForm.eventTime,
        selectedEvent.eventDate,
        selectedEvent.eventTime
      )
    ) {
      return toastError("New date & time must be after the original event and not in the past (IST)");
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, EVENTS_COLLECTION, selectedEvent.id), {
        eventDate: editForm.eventDate,
        eventTime: editForm.eventTime,
      });
      toastSuccess("Event updated!");
      setShowEditModal(false);
    } catch {
      toastError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- AUTO REGISTER ----------------------- */
  const handleAutoRegister = async (event: Event) => {
    if (!currentUser) {
      toastError("Please log in to register");
      navigate("/auth");
      return;
    }

    if (registrations.has(event.id)) {
      alert("You are already registered for this event!");
      return;
    }

    const confirmRegister = window.confirm(`Register for "${event.name}"?`);
    if (!confirmRegister) return;

    setLoading(true);
    try {
      await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
        eventId: event.id,
        pageName: PAGE_NAME,
        userId: currentUser.uid,
        name: userName,
        email: currentUser.email,
        timestamp: serverTimestamp(),
      });
      alert("Successfully registered!");
    } catch {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- DELETE EVENT ----------------------- */
  const confirmDelete = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, selectedEvent.id));
      toastSuccess("Event deleted!");
      setShowDeleteConfirm(false);
    } catch {
      toastError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------- VIEW PARTICIPANTS ----------------------- */
  const openParticipants = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    setSelectedEvent(event);
    setShowParticipants(true);

    const q = query(
      collection(db, REGISTRATIONS_COLLECTION),
      where("eventId", "==", eventId),
      where("pageName", "==", PAGE_NAME)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list: Registration[] = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          let finalName = data.name;
          let profileUrl = "";

          try {
            const userSnap = await getDoc(doc(db, "users", data.userId));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              finalName = userData.name || data.name;
              profileUrl = userData.profileUrl || "";
            }
          } catch {}

          return {
            id: d.id,
            userId: data.userId,
            name: finalName,
            email: data.email,
            profileUrl,
          };
        })
      );
      setParticipants(list);
    });

    return () => unsub();
  };

  const isAdmin = userRole === "admin";
  const isAdminPlus = userRole === "admin+";

  const isAddFormValid =
    addForm.name &&
    addForm.description &&
    addForm.eventDate &&
    addForm.eventTime &&
    addForm.image &&
    new Date(`${addForm.eventDate}T${addForm.eventTime}:00`) > getISTNow();

  /* ----------------------- DOWNLOAD EXCEL ----------------------- */
  const downloadExcel = async () => {
    if (participants.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Participants");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 35 },
    ];

    participants.forEach((p) => {
      worksheet.addRow({ name: p.name, email: p.email });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedEvent?.name.replace(/[^a-z0-9]/gi, "_") || "event"}_participants.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ----------------------------------------------------------------- */
  return (
    <div className="bg-gray-50">
      {/* HEADER */}
      <section className="[background-color:hsl(60,100%,95%)] w-full py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 px-5">
          <div className="flex-1 flex justify-center">
            <img
              src={event3}
              alt="Wellness & Self-Care"
              className="w-full h-full object-cover max-w-xs md:max-w-sm rounded-lg"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4 p-2 max-h-[300px] mt-20">
            <h2
              className=" text-4xl sm:text-5xl font-bold leading-tight text-green-800"
              
            >
              Wellness and
              
              Self-Care
            </h2>
            <h2
              className="text-3xl sm:text-4xl font-bold leading-tight text-pink-700"
              
            >
              Head
              
              Hustle
              <br />
              Heal
            </h2>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="w-full bg-gray-50 pt-2 pb-8 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
        <div className="container mx-auto text-center">
          <p className="text-md md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Your wellbeing is our priority. From zumba for your limbs to a digital detox for your mind, we have got it all covered. Listen to your needs, stay active, and rejuvenate yourself. Join us to cultivate a balanced and healthy lifestyle.
          </p>
        </div>
      </section>

      {/* DYNAMIC EVENT GRID */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Here are some of the areas we focus on
          </h2>

          {/* COLLEGE FILTER – ADMIN+ ONLY */}
          {isAdminPlus && (
            <div className="mb-6 flex justify-center">
              <div className="max-w-xs w-full">
                <Label htmlFor="college-filter">Filter by College</Label>

                <Select
                  value={selectedCollege}
                  onValueChange={(value) => setSelectedCollege(value)}
                >
                  <SelectTrigger
                    id="college-filter"
                    className="mt-1 [background-color:hsl(60,100%,95%)]"
                  >
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableColleges.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* {selectedCollege && selectedCollege !== "All colleges" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCollege("All colleges")}
                    className="mt-2 text-xs"
                  >
                    Clear filter
                  </Button>
                )} */}
              </div>
            </div>
          )}

          {events.length === 0 ? (
            <p className="text-center text-gray-500">
              No events yet. Admin can add using the + button.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const expired = isExpired(event.eventDate, event.eventTime);
                const registered = registrations.has(event.id);
                const canRegister = !expired && !registered && currentUser;

                return (
                  <Card
                    key={event.id}
                    className="relative flex flex-col [background-color:hsl(60,100%,95%)] transition-all duration-300 overflow-hidden rounded-2xl"
                  >
                    {expired && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10">
                        Expired
                      </span>
                    )}

                    {(isAdmin || isAdminPlus) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin && (
                            <DropdownMenuItem onClick={() => openEdit(event)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {isAdminPlus && (
                            <DropdownMenuItem
                              onClick={() => confirmDelete(event)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-48 object-contain"
                    />
                    <CardContent className="flex flex-col flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 text-base mb-2">
                        {event.name}
                      </h3>
                      <p className="text-gray-700 text-sm mb-4">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(event.eventDate), "MMM dd, yyyy")}
                        </span>
                        <Clock className="w-4 h-4 ml-3" />
                        <span>{event.eventTime}</span>
                      </div>

                      {/* STUDENT */}
                      {!isAdmin && !isAdminPlus && (
                        <Button
                          onClick={() => handleAutoRegister(event)}
                          disabled={!canRegister || loading}
                          className={`mt-auto w-full px-4 py-2 rounded-lg transition ${
                            expired
                              ? "bg-gray-900 text-white cursor-not-allowed"
                              : registered
                              ? "bg-primary text-white"
                              : "bg-primary text-white hover:bg-blue-900"
                          }`}
                        >
                          {expired ? "Expired" : registered ? "Registered" : "Register Now"}
                        </Button>
                      )}

                      {/* ADMIN / ADMIN+ */}
                      {(isAdmin || isAdminPlus) && (
                        <Button
                          onClick={() => openParticipants(event.id)}
                          className="mt-auto w-full bg-primary text-white hover:bg-blue-900"
                        >
                          <Users className="w-4 h-4 mr-2 inline" />
                          View Participants
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAB – ADMIN ONLY */}
      {isAdmin && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* ADD EVENT MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">
              Add New Event
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <Label>Event Name</Label>
              <Input
                value={addForm.name}
                className="[background-color:hsl(60,100%,95%)]"
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={addForm.description}
                className="[background-color:hsl(60,100%,95%)]"
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Event Date</Label>
              <Input
                type="date"
                value={addForm.eventDate}
                className="[background-color:hsl(60,100%,95%)]"
                onChange={(e) => setAddForm({ ...addForm, eventDate: e.target.value })}
                min={getISTNow().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label>Event Time</Label>
              <Input
                type="time"
                value={addForm.eventTime}
                className="[background-color:hsl(60,100%,95%)]"
                onChange={(e) => setAddForm({ ...addForm, eventTime: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAddForm({ ...addForm, image: e.target.files?.[0] || null })}
                className="[background-color:hsl(60,100%,95%)]"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !isAddFormValid}
                className="bg-green-700 hover:bg-green-600 text-white"
              >
                {loading ? "Uploading..." : "Add Event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Date & Time</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditEvent} className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={editForm.eventDate}
                onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                min={selectedEvent?.eventDate ?? getISTNow().toISOString().split("T")[0]}
                className="[background-color:hsl(60,100%,95%)]"
                required
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={editForm.eventTime}
                onChange={(e) => setEditForm({ ...editForm, eventTime: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-700 hover:bg-green-600 text-white"
              >
                Update
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM MODAL */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event?</DialogTitle>
            <DialogDescription>
              This will permanently delete "<strong>{selectedEvent?.name}</strong>". This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PARTICIPANTS MODAL */}
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Participants: {selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          {participants.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No participants yet.</p>
          ) : (
            <div className="space-y-3">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3"
                >
                  {p.profileUrl ? (
                    <img
                      src={p.profileUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 border flex items-center justify-center">
                      <span className="text-xs text-gray-600">{p.name[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-600">{p.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={downloadExcel}
              disabled={participants.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Download Excel 
            </Button>
            <Button
              className="flex-1 bg-red-600 text-white"
              variant="outline"
              onClick={() => setShowParticipants(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HappyFeetPage;