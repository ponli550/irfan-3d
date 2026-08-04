import React, { useState, useMemo, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  PerspectiveCamera, 
  OrbitControls, 
  Box, 
  Cylinder, 
  MeshDistortMaterial, 
  Float, 
  Text,
  ContactShadows,
  Environment,
  PresentationControls,
  OrthographicCamera,
  Line
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
// --- ICONS (SVG) ---

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const IconArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
);

const IconSun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
);

const IconMoon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

// --- 3D COMPONENTS ---

const PetronasTowers = () => {
  return (
    <group position={[-2, 0, -2]}>
      {/* Tower 1 */}
      <mesh position={[-0.4, 3, 0]} castShadow>
        <boxGeometry args={[0.6, 6, 0.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Tower 2 */}
      <mesh position={[0.4, 3, 0]} castShadow>
        <boxGeometry args={[0.6, 6, 0.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      {/* Spires */}
      <mesh position={[-0.4, 6.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.1, 0.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.4, 6.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.1, 0.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Interior Glow - making it more "glowy" with multiple lights or stronger intensity */}
      <pointLight position={[0, 4.5, 0.2]} color="#ffcc33" intensity={15} distance={3} />
      <pointLight position={[0, 2, 0.2]} color="#ffaa00" intensity={10} distance={4} />
    </group>
  );
};

const KLTower = () => {
  return (
    <group position={[3, 0, -1]}>
      {/* Base/Shaft */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.25, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.4, 0.6, 8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.1} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, 4.8, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

const CityBuildings = () => {
  const buildings = useMemo(() => {
    const items = [];
    // Buildings
    for (let i = 0; i < 30; i++) {
      items.push({
        type: 'building',
        position: [(Math.random() - 0.5) * 16, 0, (Math.random() - 0.5) * 16],
        args: [0.4 + Math.random() * 0.4, 0.5 + Math.random() * 2.5, 0.4 + Math.random() * 0.4],
        color: ["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#94a3b8", "#fbbf24", "#ef4444"][Math.floor(Math.random() * 7)]
      });
    }
    // Trees
    for (let i = 0; i < 20; i++) {
      items.push({
        type: 'tree',
        position: [(Math.random() - 0.5) * 18, 0, (Math.random() - 0.5) * 18],
        color: "#22c55e"
      });
    }
    // Market stalls
    for (let i = 0; i < 10; i++) {
      items.push({
        type: 'stall',
        position: [(Math.random() - 0.5) * 12, 0, (Math.random() - 0.5) * 12],
        color: ["#3b82f6", "#ec4899", "#8b5cf6"][Math.floor(Math.random() * 3)]
      });
    }
    
    return items.filter(b => {
      const distToPetronas = Math.sqrt(Math.pow(b.position[0] - (-2), 2) + Math.pow(b.position[2] - (-2), 2));
      const distToKL = Math.sqrt(Math.pow(b.position[0] - 3, 2) + Math.pow(b.position[2] - (-1), 2));
      return distToPetronas > 2.5 && distToKL > 2.5;
    });
  }, []);

  return (
    <group>
      {buildings.map((b, i) => {
        if (b.type === 'building') {
          return (
            <Box key={i} args={b.args} position={[b.position[0], b.args[1] / 2, b.position[2]]}>
              <meshStandardMaterial color={b.color} />
            </Box>
          );
        } else if (b.type === 'tree') {
          return (
            <group key={i} position={b.position}>
              <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#78350f" />
              </Cylinder>
              <Box args={[0.3, 0.3, 0.3]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color={b.color} />
              </Box>
            </group>
          );
        } else {
          return (
            <group key={i} position={b.position}>
              <Box args={[0.6, 0.3, 0.4]} position={[0, 0.15, 0]}>
                <meshStandardMaterial color={b.color} />
              </Box>
              <Box args={[0.7, 0.05, 0.5]} position={[0, 0.35, 0]}>
                <meshStandardMaterial color="#fff" />
              </Box>
            </group>
          );
        }
      })}
    </group>
  );
};

const RibbonPath = () => {
  const points = useMemo(() => {
    const p = [];
    const segments = 100;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // More "snaky" path
      const x = Math.sin(t * Math.PI * 4) * 5 * Math.cos(t * 2);
      const z = (t - 0.5) * 20;
      const y = 0.1 + Math.sin(t * Math.PI * 8) * 0.05; // Slight wave in height
      p.push(new THREE.Vector3(x, y, z));
    }
    return p;
  }, []);

  return (
    <group>
      <Line
        points={points}
        color="#ff0000"
        lineWidth={8}
        transparent
        opacity={0.9}
      />
      {/* Add a subtle glow effect around the path */}
      <Line
        points={points}
        color="#ff4444"
        lineWidth={15}
        transparent
        opacity={0.2}
      />
    </group>
  );
};

const Ground = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <mesh receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Concentric circles - blueprint style */}
      {[2, 5, 8, 11, 14, 17, 20, 23, 26].map((r) => (
        <mesh key={r} position={[0, 0, 0.01]}>
          <ringGeometry args={[r, r + 0.03, 128]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
        </mesh>
      ))}
      {/* Faint Blueprint Grid */}
      <gridHelper 
        args={[60, 60, "#3b82f6", "#eff6ff"]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0, 0.005]} 
      />
    </group>
  );
};

const Scene = ({ scrollProgress }) => {
  const groupRef = useRef();
  const cameraRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation: 0 to 90 degrees
      const targetRotation = scrollProgress.current * Math.PI * 0.5;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.05);
      
      // Position shift: move the city sideways
      const targetX = -scrollProgress.current * 10;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);

      // Zoom effect: slightly zoom in as we progress
      const targetZoom = 50 + scrollProgress.current * 20;
      state.camera.zoom = THREE.MathUtils.lerp(state.camera.zoom, targetZoom, 0.05);
      state.camera.updateProjectionMatrix();
    }
    
    // Add some floaty movement
    state.camera.position.y = 10 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    state.camera.position.x = 10 + Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <OrthographicCamera 
        makeDefault 
        ref={cameraRef}
        position={[10, 10, 10]} 
        zoom={50} 
        near={0.1} 
        far={1000} 
      />
      
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[15, 25, 10]} 
        intensity={2} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Environment preset="city" />

      <group ref={groupRef}>
        <PetronasTowers />
        <KLTower />
        <CityBuildings />
        <RibbonPath />
        <Ground />
      </group>
    </>
  );
};

// --- UI COMPONENTS ---

const Navigation = ({ setSection }) => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 glass rounded-full px-8 py-4 flex items-center justify-between">
      <div className="flex gap-8 text-xs font-bold tracking-widest text-slate-800 dark:text-white">
        <button onClick={() => setSection(1)} className="hover:opacity-60 transition-opacity">ABOUT</button>
        <button onClick={() => setSection(2)} className="hover:opacity-60 transition-opacity">PROJECTS</button>
        <button onClick={() => setSection(3)} className="hover:opacity-60 transition-opacity">SKILLS</button>
      </div>
      
      <div className="text-center">
        <div className="text-xl font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase">
          IRFAN ALI
        </div>
        <div className="text-[8px] font-bold tracking-[0.3em] text-slate-500 dark:text-slate-400 mt-1 uppercase">
          Software Engineer @ Gamuda Technologies
        </div>
      </div>
      
      <button 
        onClick={() => setSection(4)}
        className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-slate-800 transition-colors"
      >
        HIRE ME
      </button>
    </nav>
  );
};

const InfoCard = ({ scrollProgress, activeSection, setActiveSection }) => {
  const sections = [
    {
      id: 1,
      title: "AT A GLANCE",
      content: "Software Engineer at Gamuda Technologies. BSc in Computer Science, 5 AWS certifications and 10+ shipped projects — including client work running in production on its own domain. React and TypeScript up front, serverless Firebase and AWS behind."
    },
    {
      id: 2,
      title: "FEATURED WORK",
      content: "A DIGITAL TWIN SYSTEM FOR LARGE-SCALE INFRASTRUCTURE MONITORING, A REAL-TIME ANALYTICS DASHBOARD FOR SMART CITY DATA, AND SEVERAL HIGH-PERFORMANCE WEB APPLICATIONS RUNNING ON AWS SERVERLESS ARCHITECTURES."
    },
    {
      id: 3,
      title: "TECHNICAL ARSENAL",
      content: "EXPERT IN REACT, TYPESCRIPT, AND THREE.JS FOR FRONTEND. POWERED BY AWS (5X CERTIFIED), FIREBASE, AND NODE.JS ON THE BACKEND. SPECIALIZING IN CLOUD ARCHITECTURE AND 3D WEB VISUALIZATION."
    },
    {
      id: 4,
      title: "LET'S COLLABORATE",
      content: "CURRENTLY DRIVING INNOVATION AT GAMUDA TECHNOLOGIES. OPEN TO STRATEGIC PARTNERSHIPS AND HIGH-IMPACT CLOUD PROJECTS. CLICK 'HIRE ME' TO START A CONVERSATION."
    }
  ];

  return (
    <div className="fixed left-12 top-1/2 -translate-y-1/2 w-[400px] z-40 space-y-4">
      {sections.map((section) => (
        <motion.div
          key={section.id}
          className={`glass p-6 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden ${activeSection === section.id ? 'opacity-100 shadow-xl scale-[1.02]' : 'opacity-60 hover:opacity-80'}`}
          onClick={() => setActiveSection(section.id)}
          layout
        >
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400">0{section.id}</span>
            <h3 className="text-sm font-black tracking-widest text-slate-800 dark:text-white uppercase">{section.title}</h3>
          </div>
          
          <AnimatePresence>
            {activeSection === section.id && section.content && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {section.content}
                </p>
                <button className="mt-6 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-900 dark:text-white hover:gap-3 transition-all">
                  MORE ABOUT ME <IconChevronRight />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

const BottomUI = ({ theme, toggleTheme, scrollProgress, setSection }) => {
  return (
    <div className="fixed bottom-12 right-12 flex items-center gap-4 z-40">
      <button 
        onClick={() => setSection(4)}
        className="glass px-8 py-4 rounded-full text-xs font-black tracking-[0.2em] text-slate-800 dark:text-white flex items-center gap-2 hover:bg-white/20 transition-all"
      >
        SKIP THE TOUR <IconArrowDown />
      </button>
      <button 
        onClick={toggleTheme}
        className="glass w-14 h-14 rounded-full flex items-center justify-center text-slate-800 dark:text-white hover:scale-110 transition-transform"
      >
        {theme === 'light' ? <IconMoon /> : <IconSun />}
      </button>
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState(1);
  const scrollProgress = useRef(0);

  const setSection = (id) => {
    setActiveSection(id);
    scrollProgress.current = (id - 1) / 3;
  };

  useEffect(() => {
    const handleWheel = (e) => {
      scrollProgress.current += e.deltaY * 0.001;
      scrollProgress.current = Math.max(0, Math.min(1, scrollProgress.current));
      // Sync active section based on scroll
      const newSection = Math.round(scrollProgress.current * 3) + 1;
      if (newSection !== activeSection) setActiveSection(newSection);
    };

    let touchStart = 0;
    const handleTouchStart = (e) => {
      touchStart = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const delta = touchStart - e.touches[0].clientY;
      scrollProgress.current += delta * 0.002;
      scrollProgress.current = Math.max(0, Math.min(1, scrollProgress.current));
      touchStart = e.touches[0].clientY;
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: true }}>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <Navigation setSection={setSection} />
      <InfoCard scrollProgress={scrollProgress} activeSection={activeSection} setActiveSection={setSection} />
      <BottomUI theme={theme} toggleTheme={toggleTheme} scrollProgress={scrollProgress} setSection={setSection} />
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none border-[32px] border-white/50 dark:border-black/20 z-10"></div>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
