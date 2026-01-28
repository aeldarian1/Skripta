'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  name: string;
  university: string;
  initial: string;
  color: string;
  text: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Marko',
    university: 'FER Zagreb',
    initial: 'M',
    color: 'from-red-500 to-red-600',
    text: '"Skripta mi je pomogla proći najteže kolegije. Odgovori zajednice su bili brži i korisniji od čekanja profesora."',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ana',
    university: 'PMF Split',
    initial: 'A',
    color: 'from-blue-500 to-blue-600',
    text: '"Konačno mjesto gdje mogu pronaći materijale i savjete od studenata koji su prošli iste ispite. Nezamjenjivo!"',
    rating: 5,
  },
  {
    id: 3,
    name: 'Luka',
    university: 'EFZG',
    initial: 'L',
    color: 'from-purple-500 to-purple-600',
    text: '"Upoznao sam kolege s drugih fakulteta i našao studijsku grupu. Zajednica je stvarno prijateljska i susretljiva!"',
    rating: 5,
  },
  {
    id: 4,
    name: 'Petra',
    university: 'PMF Zagreb',
    initial: 'P',
    color: 'from-green-500 to-green-600',
    text: '"Pomoć koju sam dobila ovdje je bila neprocjenjiva. Studenti razumiju probleme bolje od bilo koga drugog!"',
    rating: 5,
  },
  {
    id: 5,
    name: 'Ivan',
    university: 'FESB Split',
    initial: 'I',
    color: 'from-yellow-500 to-orange-600',
    text: '"Forum gdje mogu slobodno pitati bez straha od osuđivanja. Svakome tko treba pomoć toplo preporučujem!"',
    rating: 5,
  },
  {
    id: 6,
    name: 'Maja',
    university: 'FIDIT Rijeka',
    initial: 'M',
    color: 'from-pink-500 to-pink-600',
    text: '"Skripta mi je spasila studij! Pronašla sam odgovore na sva pitanja i upoznala divne ljude koji su mi pomogli."',
    rating: 5,
  },
  {
    id: 7,
    name: 'Tomislav',
    university: 'FERIT Osijek',
    initial: 'T',
    color: 'from-indigo-500 to-indigo-600',
    text: '"Kvaliteta materijala i brzina odgovora su izvanredni. Ovo je jedina platforma koja mi je stvarno trebala!"',
    rating: 5,
  },
];

// Memoized testimonial card to prevent unnecessary re-renders
const TestimonialCard = memo(function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-2 border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 will-change-transform"
    >
      <div className="flex items-center mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}
        >
          {testimonial.initial}
        </div>
        <div className="ml-3">
          <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
          <div className="text-sm text-gray-500">{testimonial.university}</div>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 italic min-h-[80px]">
        {testimonial.text}
      </p>
      <div className="mt-4 text-yellow-500" aria-label={`${testimonial.rating} od 5 zvjezdica`}>
        {'⭐'.repeat(testimonial.rating)}
      </div>
    </div>
  );
});

export function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Responsive items per view with debounced resize
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth < 768) {
          setItemsPerView(1);
        } else if (window.innerWidth < 1024) {
          setItemsPerView(2);
        } else {
          setItemsPerView(3);
        }
      }, 100);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  // Memoized navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    setIsAutoPlaying(false);
  }, [maxIndex]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext]);

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div className="relative">
      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {visibleTestimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="rounded-full"
          aria-label="Prethodne recenzije"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Idi na slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="rounded-full"
          aria-label="Sljedeće recenzije"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Counter */}
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        {currentIndex + 1} - {Math.min(currentIndex + itemsPerView, testimonials.length)} od{' '}
        {testimonials.length} recenzija
      </div>
    </div>
  );
}
