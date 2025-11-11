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
import event1 from "@/assets/event1.png";
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
import { Plus, Edit, Users, Calendar, Clock, MoreVertical, Trash2, MessageSquare } from "lucide-react";
import { uploadToCloudinary } from "../utils/cloudinary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// === PAGE-SPECIFIC CONFIG ===
const PAGE_NAME = "FindingNemo";
const EVENTS_COLLECTION = "nemo_events";
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
  message?: string;
  profileUrl?: string;
}

const FindingNemoPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [userCollege, setUserCollege] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
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
  const [registerForm, setRegisterForm] = useState({ name: "", message: "" });

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
          setRegisterForm((prev) => ({ ...prev, name: data.name || user.displayName || "" }));
        }
      } else {
        setCurrentUser(null);
        setUserRole("student");
        setUserCollege("");
      }
    });
    return () => unsub();
  }, []);

  /* --------------------- PAGE-SPECIFIC EVENTS ---------------------- */
  useEffect(() => {
    let q: any;

    if (userRole === "admin+" || !currentUser) {
      q = query(collection(db, EVENTS_COLLECTION));
    } else if (userRole === "admin") {
      q = query(collection(db, EVENTS_COLLECTION), where("createdBy", "==", currentUser.uid));
    } else {
      q = query(collection(db, EVENTS_COLLECTION), where("college", "==", userCollege));
    }

    const unsub = onSnapshot(q, (snap) => {
      const list: Event[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Event));
      setEvents(list);
    });
    return () => unsub();
  }, [currentUser, userRole, userCollege]);

  /* ----------------- PAGE-SPECIFIC REGISTRATIONS ------------------- */
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
    return dt < new Date();
  };

  const isFutureDate = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) >= today;
  };

  // NEW: Validate edit datetime >= original AND >= now
  const isAfterOriginal = (newDate: string, newTime: string, origDate: string, origTime: string) => {
    const newDt = new Date(`${newDate}T${newTime}:00`);
    const origDt = new Date(`${origDate}T${origTime}:00`);
    return newDt >= origDt && newDt >= new Date();
  };

  /* ----------------------------- ADD EVENT ------------------------- */
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || userRole !== "admin") return;
    if (!addForm.image) return toastError("Please select an image");

    const eventDt = new Date(`${addForm.eventDate}T${addForm.eventTime}:00`);
    if (eventDt <= new Date()) {
      return toastError("Event date & time must be in the future");
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

    if (!isAfterOriginal(editForm.eventDate, editForm.eventTime, selectedEvent.eventDate, selectedEvent.eventTime)) {
      return toastError("New date & time must be after the original event and not in the past");
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

  /* ----------------------- OPEN REGISTER MODAL --------------------- */
  const openRegisterModal = (event: Event) => {
    if (!currentUser) {
      toastError("Please log in");
      navigate("/auth");
      return;
    }
    setSelectedEvent(event);
    setRegisterForm({
      name: currentUser.displayName || "",
      message: "",
    });
    setShowRegisterModal(true);
  };

  /* --------------------------- HANDLE REGISTER --------------------- */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
        eventId: selectedEvent.id,
        pageName: PAGE_NAME,
        userId: currentUser.uid,
        name: registerForm.name,
        email: currentUser.email,
        message: registerForm.message || null,
        timestamp: serverTimestamp(),
      });
      toastSuccess("Registered successfully!");
      setShowRegisterModal(false);
    } catch {
      toastError("Registration failed");
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
          let profileUrl: string | undefined;
          try {
            const userSnap = await getDoc(doc(db, "users", data.userId));
            if (userSnap.exists()) profileUrl = userSnap.data().profileUrl;
          } catch {}
          return {
            id: d.id,
            userId: data.userId,
            name: data.name,
            email: data.email,
            message: data.message || undefined,
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

  // Add form validity
  const isAddFormValid =
    addForm.name &&
    addForm.description &&
    addForm.eventDate &&
    addForm.eventTime &&
    addForm.image &&
    new Date(`${addForm.eventDate}T${addForm.eventTime}:00`) > new Date();

  /* ----------------------------------------------------------------- */
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HEADER */}
      <section className="[background-color:hsl(60,100%,90%)] w-full py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 px-5">
          <div className="flex-1 flex justify-center">
            <img
              src={event1}
              alt="Discover Networks"
              className="w-full h-full object-cover max-w-xs md:max-w-sm rounded-lg"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4 p-2 max-h-[300px] mt-20">
            <h2
              className="text-4xl font-extrabold leading-tight text-pink-600"
              style={{
                fontFamily:
                  "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
              }}
            >
              Discover Networks
              <br />
              and Opportunities
            </h2>
            <h2
              className="text-4xl font-extrabold leading-tight text-blue-700"
              style={{
                fontFamily:
                  "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
              }}
            >
              Explore
              <br />
              Discern
              <br />
              Collaborate
            </h2>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="w-full bg-gray-50 pt-2 pb-8 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="container mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Discover the power of connections as we enable you to forge meaningful
            relationships, expand your professional network, and thrive through
            collaboration. This is where you unlock your potential and give it wings!
            Join us and take your personal and academic experience to the next level.
          </p>
        </div>
      </section>

      {/* DYNAMIC EVENT GRID */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Here are some of the areas we focus on
          </h2>

          {events.length === 0 ? (
            <p className="text-center text-gray-500">
              No events yet. 
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
                    {/* Expired Badge */}
                    {expired && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10">
                        Expired
                      </span>
                    )}

                    {/* 3-Dot Menu */}
                    {(isAdmin || isAdminPlus) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10  w-5 h-8"
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
                      <p className="text-gray-700 text-sm mb-4">{event.description}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(event.eventDate), "MMM dd, yyyy")}</span>
                        <Clock className="w-4 h-4 ml-3" />
                        <span>{event.eventTime}</span>
                      </div>

                      {/* STUDENT */}
                      {!isAdmin && !isAdminPlus && (
                        <Button
                          onClick={() => openRegisterModal(event)}
                          disabled={!canRegister || loading}
                          className={`mt-auto w-full px-4 py-2 rounded-lg transition ${
                            expired
                              ? "bg-blue-500 text-white cursor-not-allowed"
                              : registered
                              ? "bg-blue-600 text-white"
                              : "bg-primary text-white hover:bg-blue-900"
                          }`}
                        >
                          {expired ? "Register" : registered ? "Registered" : "Register"}
                        </Button>
                      )}

                      {/* ADMIN+ */}
                      {isAdminPlus && (
                        <Button
                          onClick={() => openParticipants(event.id)}
                          className="mt-auto w-full bg-primary text-white hover:bg-blue-900"
                        >
                          <Users className="w-4 h-4 mr-2 inline" />
                          View Participants
                        </Button>
                      )}

                      {/* ADMIN */}
                      {isAdmin && (
                        <div className="mt-auto flex gap-2">
                          {/* <Button
                            onClick={() => openEdit(event)}
                            className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button> */}
                          <Button
                            onClick={() => openParticipants(event.id)}
                            className="flex-1 bg-primary text-white hover:bg-blue-900"
                          >
                            View Participents
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAB - ADMIN ONLY */}
      {isAdmin && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* REGISTER MODAL */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register for: {selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                className="[background-color:hsl(60,100%,95%)]"
                required
              />
            </div>
            <div>
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Any message for the organizer?"
                value={registerForm.message}
                onChange={(e) => setRegisterForm({ ...registerForm, message: e.target.value })}
              
                className="resize-none h-24 [background-color:hsl(60,100%,95%)]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-800 text-white">
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
              <Button variant="outline" onClick={() => setShowRegisterModal(false)} className="bg-red-600 text-white">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD EVENT MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Add New Event</DialogTitle>
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
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={addForm.eventDate}
                className="[background-color:hsl(60,100%,95%)]"
                onChange={(e) => setAddForm({ ...addForm, eventDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label>Expiry Time</Label>
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
              <Button type="submit" disabled={loading || !isAddFormValid} className="bg-green-700 hover:bg-green-600 text-white">
                {loading ? "Uploading..." : "Add Event"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="bg-red-600 hover:bg-red-700 text-white">
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
                min={selectedEvent?.eventDate ?? new Date().toISOString().split("T")[0]}
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
              <Button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-600 text-white">
                Update
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="bg-red-600 hover:bg-red-700 text-white">
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
                  className="p-3 bg-white rounded-lg border border-gray-200 flex items-start gap-3"
                >
                  {p.profileUrl ? (
                    <img
                      src={p.profileUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 border flex items-center justify-center">
                      <span className="text-xs text-gray-600">{p.name[0].toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-600">{p.email}</p>
                    {p.message && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-700 flex items-start gap-1">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                        <span>{p.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            className="mt-6 w-full bg-red-600 text-white hover:text-700"
            variant="outline"
            onClick={() => setShowParticipants(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindingNemoPage;