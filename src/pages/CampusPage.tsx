import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { campuses } from "./TourPage";

const CampusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const campus = campuses.find((c) => c.id === Number(id));

  if (!campus) {
    return <p className="text-center mt-20 text-xl text-red-500">Campus not found!</p>;
  }

  return (
    <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20  [background-color:hsl(60,100%,95%)]">
    <div className="min-h-screen bg-gray-50 px-6 lg:px-16 py-10  [background-color:hsl(60,100%,95%)]">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        ← Back
      </button>
      

      {/* Campus Title */}
      <h1 className="text-3xl font-bold text-center mb-8">{campus.name}</h1>

       <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20  [background-color:hsl(220,100%,90%)]">
      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {campus.gallery.map((img) => (
          <div key={img.id} className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-46 object-cover"
            />
            <div className="p-4 bg-white">
              <h3 className="font-semibold text-gray-800">{img.alt}</h3>
              <p className="text-gray-600 text-sm">{img.description}</p>
            </div>
          </div>
        ))}
         
      </div>
      </section>
    </div>
     
    </section>
  );
};

export default CampusPage;
