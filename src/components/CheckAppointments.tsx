import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";

const UpcomingActivities = () => {
  const [appointments] = useState([
    {
      id: 1,
      name: "Academic Counseling",
      date: "2025-09-20",
      time: "10:00 AM - 11:00 AM",
      seats: 5
    },
    {
      id: 2,
      name: "Career Guidance",
      date: "2025-09-22",
      time: "02:00 PM - 03:00 PM",
      seats: 3
    },
    {
      id: 3,
      name: "Peer Tutoring",
      date: "2025-09-25",
      time: "11:00 AM - 12:00 PM",
      seats: 2
    }
  ]);

  const today = new Date();
  const upcomingAppointments = appointments.filter(
    (appt) => new Date(appt.date) >= today
  );

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Upcoming Activities
            </h2>
            <p className="text-muted-foreground max-w-md mt-2">
              View and book your upcoming sessions. Stay on track and reserve your seats.
            </p>
          </div>
          <Button className="bg-primary text-white hover:bg-primary/90 mt-4 lg:mt-0">
            Book Appointment
          </Button>
        </div>

        {/* Appointments Grid */}
        {upcomingAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No upcoming activities.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.map((appt) => (
              <Card
                key={appt.id}
                className="bg-card border border-border rounded-xl hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {appt.name}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary" /> {appt.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" /> {appt.time}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Users className="w-4 h-4 text-primary" /> {appt.seats} Seats Available
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 hover:bg-primary hover:text-primary-foreground w-full"
                  >
                    Book Slot
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingActivities;
