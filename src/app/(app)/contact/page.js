
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";                  
import StayInspired from "@/components/home/StayInspired";
import { Phone, Mail } from "lucide-react";

// --- Countries Data ---
const countries = [
  { code: "IN", name: "India", dial_code: "+91" },
  { code: "US", name: "United States", dial_code: "+1" },
  { code: "GB", name: "United Kingdom", dial_code: "+44" },
  { code: "CA", name: "Canada", dial_code: "+1" },
  { code: "AU", name: "Australia", dial_code: "+61" },
  { code: "DE", name: "Germany", dial_code: "+49" },
  { code: "FR", name: "France", dial_code: "+33" },
  { code: "JP", name: "Japan", dial_code: "+81" },
  { code: "CN", name: "China", dial_code: "+86" },
  { code: "AE", name: "UAE", dial_code: "+971" },
  { code: "SG", name: "Singapore", dial_code: "+65" },
  { code: "IT", name: "Italy", dial_code: "+39" },
  { code: "ES", name: "Spain", dial_code: "+34" },
  { code: "NL", name: "Netherlands", dial_code: "+31" },
  { code: "SE", name: "Sweden", dial_code: "+46" },
  { code: "NO", name: "Norway", dial_code: "+47" },
  { code: "DK", name: "Denmark", dial_code: "+45" },
  { code: "FI", name: "Finland", dial_code: "+358" },
  { code: "CH", name: "Switzerland", dial_code: "+41" },
  { code: "AT", name: "Austria", dial_code: "+43" },
];

// --- SMOOTH COLLAPSIBLE ---
const Collapsible = ({ open, onOpenChange, trigger, children }) => {
  const [height, setHeight] = useState("0px");
  const contentRef = useRef(null);

  useEffect(() => {
    if (open) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setHeight("0px");
    }
  }, [open]);

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={onOpenChange}
        className="flex w-full items-center justify-between py-4 text-left hover:text-[#1E3A8A] transition-colors"
      >
        <span className="text-lg font-medium">{trigger}</span>
        {open ? <Minus className="w-5 h-5 text-pink-500" /> : <Plus className="w-5 h-5 text-pink-500" />}
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: height }}
      >
        <div ref={contentRef} className="pb-6 pt-2 text-sm text-gray-600 border-b border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

const CountryCodePicker = ({ onSelect, selectedCountry, isPopoverOpen, setIsPopoverOpen, search, setSearch, filteredCountries }) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        className="flex w-full items-center justify-between h-10 rounded-md border border-gray-300 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      >
        <span>{selectedCountry ? `${selectedCountry.dial_code} (${selectedCountry.code})` : "Select"}</span>
        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
      </button>

      {isPopoverOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <input
            type="text"
            placeholder="Search country..."
            className="w-full border-b border-gray-200 px-3 py-2 text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country);
                    setIsPopoverOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {country.name} ({country.dial_code})
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-gray-500">No country found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ContactPage() {
  const [openDepartment, setOpenDepartment] = useState("general");
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [selectedCountry, setSelectedCountry] = useState(countries.find((c) => c.code === "IN"));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ← API BASE
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const toggleDepartment = (dept) => {
    setOpenDepartment(openDepartment === dept ? null : dept);
  };

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    const lower = search.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.dial_code.includes(lower)
    );
  }, [search]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setPhoneNumber(country.dial_code + " ");
    setIsPopoverOpen(false);
    setSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const payload = {
      title: "Contact Form Inquiry",
      description: formData.get("message")?.trim() || "",
      customerInfo: {
        firstName: formData.get("firstName")?.trim() || "",
        lastName: formData.get("lastName")?.trim() || "",
        email: formData.get("email")?.trim() || "",
        phone: phoneNumber.replace(/\s/g, ""),
      },
    };

    if (!payload.customerInfo.firstName || !payload.customerInfo.email || !payload.description) {
      toast.error("Please fill in First Name, Email, and Message!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Thank you! Your message has been sent successfully. We'll get back to you soon.");
        e.target.reset();
        setPhoneNumber("+91 ");
        setSelectedCountry(countries.find((c) => c.code === "IN"));
      } else {
        const err = await res.json();
        toast.error(err.message || "Something went wrong. Please try again.");
      }
      } catch (err) {
        toast.error("No internet connection. Please check your network and try again.");
      }
  };

  return (
    <div className="py-12 lg:py-16">
      {/* Hero Section */}
      <div className="w-full mx-auto px-4 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZnVybml0dXJlJTIwc2hvd3Jvb218ZW58MXx8fHwxNzYwMzU2Njg0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Showroom 1"
                width={600}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/5] overflow-hidden rounded-lg shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1618220179428-22790b461013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmlvciUyMGRlc2lnbiUyMHNwYWNlfGVufDF8fHx8MTc2MDM1NjY4NHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Showroom 2"
                width={600}
                height={750}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <h1 className="mb-12 text-5xl leading-tight text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Questions, requests, or just a hello — feel free to reach out.
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm leading-loose">
              <div>
                <h3 className="mb-2 text-xl font-medium">Corporate Office</h3>
                <address className="not-italic text-gray-600 text-sm leading-relaxed">
                  <span className="block sm:inline">207, Shyam Kunj, Shree Shyam Heights, </span>
                  <span className="block sm:inline">Sampat Hills, Bicholi Mardana, </span>
                  <span className="block sm:inline">Indore – 452016, India</span>
                </address>
              </div>

              <div className="ml-2">
                <h3 className="mb-2 text-xl font-medium">Business Hours</h3>
                <p className="text-gray-600">Monday – Saturday</p>
                <p className="text-gray-600">10:00 AM – 6:00 PM IST</p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-medium">Contact</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href="tel:+919755040030" className="hover:text-black transition">+91 97550 40030</a>
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href="tel:+919644403330" className="hover:text-black transition">+91 96444 03330</a>
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a href="mailto:tanaririllp@gmail.com" className="hover:text-black transition underline">tanaririllp@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form + Departments */}
      <div className="w-full mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Departments */}
          <div className="bg-white p-6 lg:p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="mb-10 text-4xl text-[#1E3A8A]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Departments
            </h2>
            <div className="space-y-4">
              <Collapsible open={openDepartment === "general"} onOpenChange={() => toggleDepartment("general")} trigger="General Inquiries">
                <p className="mb-3">Got a question about a product, need help with an order, or just want to reach out?</p>
                <p>We're here to help. Reach us at <a href="mailto:info@tanariri.com" className="text-[#1E3A8A] hover:underline">info@tanariri.com</a></p>
              </Collapsible>
              <Collapsible open={openDepartment === "trade"} onOpenChange={() => toggleDepartment("trade")} trigger="Trade & Wholesale">
                <p className="mb-3">Interested in wholesale or trade partnerships? We'd love to hear from you.</p>
                <p>Contact us at <a href="mailto:trade@tanariri.com" className="text-[#1E3A8A] hover:underline">trade@tanariri.com</a></p>
              </Collapsible>
              <Collapsible open={openDepartment === "press"} onOpenChange={() => toggleDepartment("press")} trigger="Press & Media">
                <p className="mb-3">For press inquiries, interviews, or media assets, please reach out to our press team.</p>
                <p>Email us at <a href="mailto:press@tanariri.com" className="text-[#1E3A8A] hover:underline">press@tanariri.com</a></p>
              </Collapsible>
              <Collapsible open={openDepartment === "showrooms"} onOpenChange={() => toggleDepartment("showrooms")} trigger="Showrooms">
                <p className="mb-3">Visit our showrooms to experience our collections in person. Book an appointment today.</p>
                <p>Contact <a href="mailto:showroom@tanariri.com" className="text-[#1E3A8A] hover:underline">showroom@tanariri.com</a></p>
              </Collapsible>
            </div>
          </div>

          {/* Contact Form - NOW FULLY WORKING */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="mb-6 text-3xl text-[#1E3A8A]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Let's hear from you
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input name="firstName" required type="text" placeholder="Your Name" className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input name="lastName" type="text" placeholder="Your Last Name" className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" required type="email" placeholder="youremail@example.com" className="w-full h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <div className="flex gap-2">
                  <div className="w-32">
                    <CountryCodePicker
                      onSelect={handleCountrySelect}
                      selectedCountry={selectedCountry}
                      isPopoverOpen={isPopoverOpen}
                      setIsPopoverOpen={setIsPopoverOpen}
                      search={search}
                      setSearch={setSearch}
                      filteredCountries={filteredCountries}
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 h-10 px-4 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={2}
                  placeholder="Tell us about your requirements..."
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" id="privacy" required className="mt-1 h-4 w-4" />
                <label htmlFor="privacy" className="text-xs text-gray-600 cursor-pointer">
                  I agree to the Privacy Policy and consent to be contacted by TanaRiri regarding my inquiry. *
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white h-12 rounded-md font-medium hover:bg-gray-800 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-16">
        <div className="h-px bg-gray-200"></div>
      </div>

      <StayInspired />

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="h-px bg-gray-200"></div>
      </div>
    </div>
  );
}