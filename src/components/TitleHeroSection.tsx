// components/HeroSection.tsx
import React from "react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
}

const TitleHeroSection = ({ title, subtitle = "" }: HeroSectionProps) => {
  return (
    <section className="py-16 [background-color:hsl(60,100%,95%)] flex flex-col items-center justify-center text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">{title}</h1>
      {subtitle && <p className="text-lg md:text-xl text-gray-600">{subtitle}</p>}
    </section>
  );
};

export default TitleHeroSection;
