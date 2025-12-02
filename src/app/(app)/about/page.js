
import Image from "next/image";
import Link from "next/link";
import StayInspired from "@/components/home/StayInspired";

const AuthenticSimplicityIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 3L3 20L20 37L37 20L20 3Z" stroke="#4A5568" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const TimelessRelevanceIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4Z" stroke="#D87F4A" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M20 12V20L26 23" stroke="#D87F4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MaterialHonestyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 16H30" stroke="#4A5568" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 24H30" stroke="#4A5568" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 10V30" stroke="#4A5568" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 10V30" stroke="#4A5568" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const HumanCenteredFunctionIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 10H18V18H10V10Z" stroke="#4A5568" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M22 10H30V18H22V10Z" stroke="#4A5568" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M10 22H18V30H10V22Z" stroke="#4A5568" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M22 22H30V30H22V22Z" stroke="#4A5568" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const Avatar = ({ src, alt, fallback }) => (
  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
    {src ? (
      <Image src={src} alt={alt} width={128} height={128} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
        {fallback}
      </div>
    )}
  </div>
);

export default function AboutPage() {
  return (
    <>
      {/* 1. Hero Story Section */}
      <section className="py-12 lg:py-16">
        <div className="w-full mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Right Column */}
            <div className="space-y-12 lg:pt-20 order-2 lg:order-1">
              <div>
                 <div className="relative mb-8 inline-block">
                  <h1 className="text-6xl lg:text-7xl font-normal pb-4 text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Our Story
                  </h1>
                   <div className="absolute left-0 bottom-0 h-1 bg-pink-500 rounded-full w-full"></div>
                </div>
                <div className="space-y-8 text-gray-700 leading-relaxed">
                  <p>
                    Tanariri Overseas LLP was founded with a vision to <strong>bridge Indian heritage with global taste</strong>. We combine <strong>traditional Indian craftsmanship</strong> with <strong>international quality standards</strong> to create premium lifestyle and home products.
                  </p>
                  <p>
                    From gold-plated ceramic tableware to handcrafted sarees, every product reflects our commitment to <strong>sophistication, authenticity, and modern living</strong>.
                  </p>
                  <p>
                    We export to <strong>15+ countries</strong> and partner with luxury hospitality, wellness brands, and ethnic boutiques worldwide.
                  </p>
                </div>
              </div>

              {/* SAME IMAGE */}
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/about-2-1024x734.jpg"
                  alt="Indian artisan crafting premium products"
                  width={1024}
                  height={734}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Left Column */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* SAME IMAGE */}
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/about-1-1024x683.jpg"
                  alt="Gold-plated tableware and craftsmanship"
                  width={1024}
                  height={683}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-5xl lg:text-6xl font-normal mb-6 text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Made in India, Designed for the World
                </h1>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We are a <strong>multi-category premium brand</strong> specializing in fine ceramics, brass utensils, luxury linen, apparel, and ethnic wear.
                  </p>
                  <p>
                    Our products are <strong>ISO-compliant, OEKO-TEX certified, and lead-free</strong> — crafted for global markets with Indian soul.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Design Philosophy */}
      <section className="py-8 px-4 lg:px-12 bg-white">
        
        <h2 className="text-5xl font-bold text-center mb-16 text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Our Philosophy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          
          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <AuthenticSimplicityIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Authentic Craftsmanship</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every piece is handcrafted by skilled Indian artisans using techniques passed down through generations.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <TimelessRelevanceIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Standards</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We meet international certifications — lead-free, AZO-free, OEKO-TEX — for safety and quality.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <MaterialHonestyIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sustainable Sourcing</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We use eco-friendly materials and support artisan communities with fair trade practices.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <HumanCenteredFunctionIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer First</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Customization, private labeling, and 24/7 support for B2B partners worldwide.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Meet the Makers */}
      <section className="py-12 px-4 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto items-start">
          
          <div className="lg:w-1/3 lg:sticky lg:top-24">
           <div className="relative mb-6 inline-block">
              <h2 className="text-5xl pb-4  text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Our Leadership
              </h2>
              <div className="absolute left-0 bottom-0 h-1 bg-pink-500 rounded-full w-full"></div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our team combines decades of experience in export, manufacturing, and design to deliver world-class products with Indian heritage.
            </p>
          </div>

          <div className="lg:w-2/3 flex flex-col gap-16">
            
            <div className="flex flex-col items-start text-left max-w-lg mx-auto">
              {/* SAME IMAGE */}
              <Avatar src="/erik_johannsen.webp" alt="Rajesh Patel" fallback="PS" />
              <div className="mt-6">
                <h3 className="text-4xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Mr. Rajesh Patel
                </h3>
                <p className="text-gray-600 text-lg mb-3">Founder & CEO</p>
                <p className="text-gray-700 text-md leading-snug">
                 With a deep passion for artistry, design, and timeless craftsmanship, Ravi Mehta founded TanaRiri Overseas LLP with a vision to bring India’s rich cultural heritage to the global stage. Under his leadership, TanaRiri has evolved into a distinguished name in luxury lifestyle and tableware, blending traditional Indian aesthetics with modern sophistication.
                  <br /> <br />
                 Guided by his commitment to quality and authenticity, Ravi ensures that every TanaRiri creation reflects elegance, innovation, and enduring value. His dedication to excellence continues to inspire the brand’s pursuit of perfection — where every piece tells a story of heritage reimagined for the contemporary world.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start text-start max-w-lg mx-auto">
              {/* SAME IMAGE */}
              <Avatar src="/maria_larsson.jpg" alt="Ms. Priya Sharma" fallback="RP" />
              
              <div className="mt-6">
                <h3 className="text-4xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Ms. Priya Sharma
                </h3>
                <p className="text-gray-600 text-lg mb-3">Head of Design & Sourcing</p>
                <p className="text-gray-700 text-md leading-snug">
                  A creative force behind TanaRiri Overseas LLP, Jyoti Mehta leads the Design and Sourcing division with an eye for detail and a passion for perfection. Her deep understanding of aesthetics, materials, and craftsmanship ensures that every collection embodies the brand’s philosophy — where timeless tradition meets global elegance.
                  <br />
                  <br />
                  Jyoti’s approach blends artistry with functionality, curating designs that are both visually captivating and impeccably made. Her leadership in sourcing premium materials and guiding design innovation has been central to shaping TanaRiri’s signature style of refined luxury.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Sustainability & Craftsmanship */}
      <section className="py-16 px-4 md:px-8 lg:px-12 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">

            {/* Sustainability Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img 
                src="/assests/sustain2.jpeg" 
                alt="Sustainable sourcing" 
                className="w-full h-96 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
                  Sustainability
                </h3>
                
                <div className="space-y-3 text-white text-sm md:text-base lg:text-lg leading-relaxed">
                  <p>
                    Tanariri Overseas LLP is moving toward sustainable sourcing, eco-packaging, and ethical production, ensuring our business not only thrives — but nurtures the communities and environment around it.
                  </p>
                  <p className="font-medium text-pink-200">
                    Our goal: 100% carbon-neutral shipping for EU orders by 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* Craftsmanship Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img 
                src="/assests/craftman.jpg" 
                alt="Indian craftsmanship" 
                className="w-full h-96 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
                  Craftsmanship
                </h3>
                
                <div className="space-y-3 text-white text-sm md:text-base lg:text-lg leading-relaxed">
                  <p>
                    Every product is handcrafted using traditional techniques — from gold-plating to hand-block printing.
                  </p>
                  <p className="font-medium text-pink-200">
                    We partner with MSME clusters and SEDEX-compliant units for quality and ethics.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

      {/* 5. Quote */}
      <section className="py-20 px-4 text-center">
        <blockquote className="w-full mx-auto">
          <p className="text-3xl md:text-3xl italic leading-relaxed text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
           “To be a global ambassador of Indian heritage, delivering products that harmonize tradition with modern luxury—across homes, wardrobes, and lifestyles worldwide.”
          </p>
          <footer className="mt-6 text-lg text-gray-700">
            Mr. Rajesh Patel
            <div className="text-sm text-gray-600">Founder & CEO, Tanariri Overseas LLP</div>
          </footer>
        </blockquote>
      </section>

      <StayInspired />
    </>
  );
}