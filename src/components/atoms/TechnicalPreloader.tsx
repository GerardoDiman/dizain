import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';

const TechnicalPreloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const loadingRef = useRef(true);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const palette = {
    light: { surface: '#f9f9f7', line: '#46583c' },
    dark: { surface: '#121212', line: '#5e7153' }
  };

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const activeColors = palette[theme];

  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  useEffect(() => {
    const duration = 4000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          window.dispatchEvent(new Event('site-loaded'));
        }, 2000);
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const assemblyGroup = new THREE.Group();
    scene.add(assemblyGroup);

    const lineMat = new THREE.MeshPhongMaterial({ color: activeColors.line, wireframe: true, transparent: true, opacity: 0.6 });
    const solidMat = new THREE.MeshPhongMaterial({ color: activeColors.line, transparent: true, opacity: 0.05 });

    const parts: { mesh: THREE.Group; target: THREE.Vector3; origin: THREE.Vector3; phase: number }[] = [];

    // Helper: Gear Generator
    const createGear = (inner: number, outer: number, thickness: number, teeth: number) => {
      const shape = new THREE.Shape();
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? outer : inner;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
      }
      shape.closePath();
      const hole = new THREE.Path(); hole.absarc(0, 0, inner * 0.5, 0, Math.PI * 2, true); shape.holes.push(hole);
      return new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    };

    // Helper: Manifold Block (Liked)
    const createManifold = () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(4, 2, 3), lineMat));
      const step = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 3), lineMat);
      step.position.set(1, 0.75, 0);
      g.add(step);
      const side = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 1.5), lineMat);
      side.position.set(2.5, 0, 0.75);
      g.add(side);
      return g;
    };

    // Helper: Improved High-Fidelity Bracket
    const createBracket = () => {
      const g = new THREE.Group();
      const thickness = 0.05;
      const shape = new THREE.Shape();
      shape.moveTo(-2, -2);
      shape.lineTo(2, -2);
      shape.lineTo(2, 2);
      shape.lineTo(-0.5, 2);
      shape.lineTo(-0.5, 0.5); // Notch
      shape.lineTo(-2, 0.5);
      shape.closePath();
      
      const hole = new THREE.Path(); hole.absarc(1, 1, 0.3, 0, Math.PI * 2); shape.holes.push(hole);
      const geom = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
      
      const main = new THREE.Mesh(geom, lineMat);
      g.add(main);
      
      // Added bends
      const flange = new THREE.Mesh(new THREE.BoxGeometry(4, thickness, 1.5), lineMat);
      flange.position.set(0, -2, 0.75);
      g.add(flange);
      
      return g;
    };

    // Helper: Bearing (The "Empaque")
    const createBearing = (radius: number, thickness: number) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.TorusGeometry(radius * 0.7, thickness * 0.2, 16, 32), lineMat));
      g.add(new THREE.Mesh(new THREE.TorusGeometry(radius, thickness * 0.2, 16, 32), lineMat));
      for(let i=0; i<12; i++) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(thickness * 0.15, 8, 8), lineMat);
        const angle = (i/12) * Math.PI * 2;
        ball.position.set(Math.cos(angle) * radius * 0.85, Math.sin(angle) * radius * 0.85, 0);
        g.add(ball);
      }
      return g;
    };

    const addPart = (geom: THREE.Object3D | THREE.BufferGeometry, target: THREE.Vector3, scale = 1) => {
      const g = new THREE.Group();
      if (geom instanceof THREE.BufferGeometry) {
        g.add(new THREE.Mesh(geom, lineMat), new THREE.Mesh(geom, solidMat));
      } else { g.add(geom); }
      g.scale.set(scale, scale, scale);
      const origin = new THREE.Vector3(target.x, target.y + 18, target.z);
      g.position.copy(origin);
      g.rotation.x = (geom instanceof THREE.Group) ? 0 : -Math.PI / 2;
      parts.push({ mesh: g, target, origin, phase: Math.random() });
      assemblyGroup.add(g);
    };

    const getViewportSize = () => {
      const vFOV = (camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const width = height * camera.aspect;
      return { width, height };
    };
    let { width, height } = getViewportSize();

    // Re-Layout with all pieces present
    addPart(createManifold(), new THREE.Vector3(0, 0, 0), 1.8); // 1. Manifold (Center)
    addPart(createBracket(), new THREE.Vector3(width/3.5, 0, -height/3.5), 1.6); // 2. Bracket (Corner)
    addPart(createBearing(1.5, 0.4), new THREE.Vector3(-width/3.5, 0, height/3.5), 2.0); // 3. Bearing ("Empaque")
    addPart(new THREE.CylinderGeometry(0.15, 0.15, 12, 6), new THREE.Vector3(-width/3.2, 0, -height/4), 1.6); // 4. Shaft
    addPart(createGear(1.8, 2.2, 0.5, 24), new THREE.Vector3(width/3.2, 0, height/4), 1.8); // 5. Large Gear

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight, new THREE.AmbientLight(0xffffff, 0.6));

    const animate = () => {
      if (!loadingRef.current) return;
      requestAnimationFrame(animate);
      const currentProgress = progressRef.current / 100;
      const t = Date.now() * 0.001;

      parts.forEach((p, i) => {
        const delay = i * 0.12;
        const lp = Math.max(0, Math.min(1, (currentProgress - delay) / 0.45));
        p.mesh.position.lerpVectors(p.origin, p.target, lp);
        p.mesh.rotation.z = t * 0.15 + p.phase;
      });

      assemblyGroup.rotation.y = Math.sin(t * 0.1) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      lineMat.dispose();
      solidMat.dispose();
      if (containerRef.current && renderer.domElement) containerRef.current.removeChild(renderer.domElement);
    };
  }, [theme]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: activeColors.surface }}
        >
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: `linear-gradient(${activeColors.line} 1px, transparent 1px), linear-gradient(90deg, ${activeColors.line} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
          <div ref={containerRef} className="absolute inset-0 z-0" />
          <div className="absolute inset-0 z-10 pointer-events-none p-10 md:p-16 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <span className="font-headline text-3xl md:text-5xl tracking-[0.3em] font-light uppercase" style={{ color: activeColors.line }}>Gerardo Díaz</span>
                <div className="w-full h-[0.5px] bg-current opacity-30 mt-2" style={{ color: activeColors.line }} />
                <span className="block mt-2 font-mono text-[10px] tracking-[0.5em] opacity-40 uppercase" style={{ color: activeColors.line }}>Project_Archive // Mech_Design</span>
              </motion.div>
              <div className="font-mono text-[10px] text-right space-y-1 opacity-50 uppercase" style={{ color: activeColors.line }}>
                <div>Blueprint: 001-D</div>
                <div>Status: High_Fidelity_Check</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="font-mono text-[10px] space-y-1 opacity-40 uppercase" style={{ color: activeColors.line }}>
                <div>© 2026 Gerardo Diman</div>
                <div>Manufacturing_Layout_V2</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-headline text-5xl md:text-7xl font-bold tracking-tighter tabular-nums leading-none" style={{ color: activeColors.line }}>{Math.round(progress)}%</div>
                <div className="w-48 h-[0.5px] bg-current opacity-20 relative overflow-hidden" style={{ color: activeColors.line }}>
                  <motion.div className="absolute inset-0 bg-current" style={{ scaleX: progress / 100, transformOrigin: 'left' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-10 border border-current opacity-[0.05]" style={{ borderColor: activeColors.line }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TechnicalPreloader;
