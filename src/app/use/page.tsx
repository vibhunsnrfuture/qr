"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiTruck,
  FiPhoneCall,
  FiUsers,
  FiHeart,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, delay },
});

export default function UseCasesPage() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const useCases = [
    {
      title: "Emergency Assistance",
      icon: <FiAlertTriangle className="text-cyan-300" size={24} />,
      desc: "A tragic accident occurs on the road. A bystander scans the vehicle’s QR tag and instantly connects with the driver’s family or emergency contact — saving crucial minutes.",
      video: "/images/vedio1.mp4", // 🎥 place inside /public/videos
    },
    {
      title: "Parking Conflict",
      icon: <FiTruck className="text-cyan-300" size={24} />,
      desc: "Someone accidentally parks behind your car. Instead of honking or wasting time, they simply scan your QR code and send a polite message or call instantly.",
      img: "/images/wrong parking.jpg",
    },
    {
      title: "Lost Belongings",
      icon: <FiPhoneCall className="text-cyan-300" size={24} />,
      desc: "You left your phone, wallet, or helmet in a café. The finder scans your QR tag and reaches you without needing to reveal personal numbers or apps.",
      img: "/images/lost1.png",
    },
    {
      title: "Community Safety",
      icon: <FiUsers className="text-cyan-300" size={24} />,
      desc: "Neighborhood watch or local groups can use Qratech stickers on gates, bikes, and devices — building quick, private communication between citizens and owners.",
      img: "/images/home.jpg",
    },
    {
      title: "Medical Emergency",
      icon: <FiHeart className="text-cyan-300" size={24} />,
      desc: "A patient’s health QR tag shows blood group, emergency number, and allergy info — allowing faster first aid and accurate hospital coordination.",
      img: "/images/emergency.jpg",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0f1a] text-white">
      {/* Background glow */}
      <motion.div
        className="pointer-events-none absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header Section */}
      <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.02em] leading-tight">
          <span className="bg-gradient-to-b from-cyan-300 to-white bg-clip-text text-transparent">
            Real-Life Use Cases of Qratech
          </span>
        </h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          Transforming everyday situations into safer, smarter, and more connected experiences —
          from emergencies to simple parking interactions.
        </p>
      </section>

      {/* Use Cases */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 space-y-32">
        {useCases.map((u, i) => (
          <motion.div
            key={u.title}
            {...fadeUp(i * 0.1)}
            className={`relative flex flex-col lg:flex-row items-center gap-10 ${
              i % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Media Section */}
            <motion.div
              className="relative flex-1 overflow-hidden rounded-2xl border border-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.1)] bg-black"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5 }}
            >
              {u.video ? (
                <div className="relative w-full h-auto">
                  <video
                    ref={videoRef}
                    src={u.video}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="rounded-2xl object-cover w-full h-full"
                  />
                  {/* Mute/Unmute Button */}
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-3 right-3 p-3 bg-black/60 rounded-full border border-cyan-400/30 hover:bg-cyan-400/20 transition"
                  >
                    {isMuted ? (
                      <FiVolumeX className="text-white" size={18} />
                    ) : (
                      <FiVolume2 className="text-cyan-300" size={18} />
                    )}
                  </button>
                </div>
              ) : (
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    maxHeight: "380px",
                    width: "100%",
                  }}
                >
                  <Image
                    src={u.img || ""}
                    alt={u.title}
                    width={500}
                    height={380}
                    className="object-contain h-full w-full rounded-2xl"
                  />
                </div>
              )}
            </motion.div>

            {/* Text Section */}
            <motion.div className="flex-1 space-y-4 sticky top-32">
              <div className="flex items-center gap-2 text-cyan-300 text-lg">
                {u.icon}
                <span className="font-semibold">{u.title}</span>
              </div>
              <h3 className="text-2xl font-extrabold tracking-[-0.02em]">
                {u.title}
              </h3>
              <p className="text-white/80 leading-relaxed text-base">{u.desc}</p>
            </motion.div>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
