import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';

const TechnicalPreloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            // Dispatch a custom event when loading is done
            window.dispatchEvent(new Event('site-loaded'));
          }, 800);
          return 100;
        }
        const step = Math.random() * 15;
        return Math.min(prev + step, 100);
      });
    }, 150);

    if (!containerRef.current) return;

    // Three.js Assembly Animation
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create "pieces" that will assemble
    const pieces: THREE.Mesh[] = [];
    const targetPositions: THREE.Vector3[] = [];
    const group = new THREE.Group();

    for (let i = 0; i < 60; i++) {
      const geometry = i % 3 === 0 
        ? new THREE.BoxGeometry(Math.random() * 0.4, 0.05, 0.05)
        : i % 3 === 1 
          ? new THREE.CylinderGeometry(0.02, 0.02, Math.random() * 0.6)
          : new THREE.SphereGeometry(0.03, 8, 8);

      const material = new THREE.MeshStandardMaterial({ 
        color: i % 2 === 0 ? 0x46583c : 0x005a7b,
        wireframe: Math.random() > 0.4,
        transparent: true,
        opacity: 0.8
      });
      
      const piece = new THREE.Mesh(geometry, material);
      
      // Random starting position far away
      piece.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      
      // Target position in a structured core
      const target = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      
      pieces.push(piece);
      targetPositions.push(target);
      group.add(piece);
    }
    scene.add(group);

    const light = new THREE.PointLight(0xffffff, 100);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    camera.position.z = 10;

    const animate = () => {
      if (!loading) return;
      requestAnimationFrame(animate);
      
      pieces.forEach((piece, i) => {
        const target = targetPositions[i];
        // Move towards target progressively
        piece.position.lerp(target, 0.03);
        piece.rotation.x += 0.01;
        piece.rotation.y += 0.01;
      });

      group.rotation.y += 0.005;
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
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[9999] bg-[#f9f9f7] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Canvas for 3D Pieces */}
          <div ref={containerRef} className="absolute inset-0 z-0 opacity-60" />
          
          {/* Technical UI Overlay */}
          <div className="relative z-10 flex flex-col items-center gap-12">
            <div className="flex flex-col items-center">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-tertiary uppercase tracking-[0.8em] mb-4 font-mono"
              >
                Initializing Assembly
              </motion.span>
              <div className="font-headline text-8xl font-bold text-primary tracking-tighter tabular-nums">
                {Math.round(progress)}
              </div>
            </div>
            
            <div className="w-80 h-[2px] bg-outline/10 relative">
              <motion.div 
                className="absolute inset-0 bg-primary h-full"
                style={{ scaleX: progress / 100, transformOrigin: 'left' }}
              />
              {/* Markers */}
              <div className="absolute -top-1 left-0 w-px h-3 bg-primary/30" />
              <div className="absolute -top-1 right-0 w-px h-3 bg-primary/30" />
              <div className="absolute -top-1 left-1/2 w-px h-3 bg-primary/30" />
            </div>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 font-mono text-[8px] text-outline/40 uppercase tracking-widest">
              <span>SYSTEM_STATUS: OK</span>
              <span>MEMORY_ALLOC: 4.2GB</span>
              <span>GEOMETRY_PIECES: 60/60</span>
              <span>RENDER_ENGINE: THREE_JS</span>
            </div>
          </div>

          {/* Corner Elements */}
          <div className="absolute top-12 left-12 w-24 h-px bg-primary/20" />
          <div className="absolute top-12 left-12 w-px h-24 bg-primary/20" />
          
          <div className="absolute bottom-12 right-12 w-24 h-px bg-primary/20" />
          <div className="absolute bottom-12 right-12 w-px h-24 bg-primary/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TechnicalPreloader;
